import { ChildProcess, spawn } from 'child_process'
import * as rl from 'readline'
import { Duplex } from 'stream'

import _debug, { Debugger } from 'debug'

import {
    CHUNK_ORIGIN_FD_STDERR,
    CHUNK_ORIGIN_FD_STDOUT,
    createProcStreamChunk,
} from './chunk'
import { ProcError } from './error'
import type { Options } from './options'
import type { ProcResult } from './result'
import type { LimitedChildProcess } from './util'

const debug = _debug('simproc')

type OnFulfilled<T> = (result: ProcResult) => T
type OnRejected<T> = (error: unknown | ProcError) => T

/*
                                 simproc
    ┌──────────────────────────────────────────────────────────────────┐
    │                       NodeJS:child_process                       │
    │  ┌────────────┐  ┌───────┬───────────┬────────┐  ┌────────────┐  │
 ───┼─►│  Writable  ├─►│       │           │ stdout ├─►│  Readable  ├──┼──►
    │  │   Stream   │  │ stdin │(execution)├────────┤┌►│   Stream   │  │
    │  └────────────┘  │       │           │ stderr ├┘ └────────────┘  │
    │                  └───────┴───────────┴────────┘                  │
    └──────────────────────────────────────────────────────────────────┘
*/

export class Proc extends Duplex implements Promise<ProcResult> {
    public [Symbol.toStringTag] = 'Proc'

    public readonly _id: number
    public readonly _name: string
    public readonly _args: Array<string>

    private _proc: LimitedChildProcess
    private readonly _debug: Debugger
    public readonly options: Options

    constructor(proc: string | LimitedChildProcess, options: Options = {}) {
        super(options.stream)

        this.options = options

        if (typeof proc === 'string') {
            const [name, ...args] = proc.split(' ')

            this._proc = spawn(name, args, {
                stdio: 'pipe',
                cwd: options.cwd,
                env: options.env,
                timeout: options.timeout,
            })
            this._name = name
            this._args = args
        } else {
            this._proc = proc
            this._name = this._proc.spawnfile
            this._args = this._proc.spawnargs
        }

        this._id = this._proc.pid ?? 0 // TODO: handle when nullish
        this._debug = debug
            .extend(this._name)
            .extend(this._id as unknown as string)

        this._debug('spawn (pid: %s)', this._id)

        const stdin = this._proc.stdin
        if (stdin) {
            this.once('unpipe', () => {
                stdin.end()
            })
            this.once('finish', () => {
                stdin.end()
            })
        }

        // means backpressure from source (stdout/stderr of
        let canKeepReading = true
        let isHalfEnded = false

        const stdout = this._proc.stdout

        if (stdout) {
            stdout.on('data', (data) => {
                data = createProcStreamChunk(data, CHUNK_ORIGIN_FD_STDOUT)

                if (!canKeepReading) {
                    stdout.once('drain', () => {
                        canKeepReading = true
                        this.push(data)
                    })
                } else if (!this.readableEnded) {
                    const canKeepReading = this.push(data)
                    if (!canKeepReading) {
                        this._debug('backpressure')
                    }
                }
            })

            stdout.once('end', () => {
                if (isHalfEnded) {
                    this.push(null)
                } else {
                    isHalfEnded = true
                }
            })
        }

        const stderr = this._proc.stderr

        if (stderr) {
            stderr.on('data', (data) => {
                data = createProcStreamChunk(data, CHUNK_ORIGIN_FD_STDERR)

                if (!canKeepReading) {
                    stderr.once('drain', () => {
                        canKeepReading = true
                        this.push(data)
                    })
                } else if (!this.readableEnded) {
                    const canKeepReading = this.push(data)
                    if (!canKeepReading) {
                        this._debug('backpressure')
                    }
                }
            })

            stderr.once('end', () => {
                if (isHalfEnded) {
                    this.push(null)
                } else {
                    isHalfEnded = true
                }
            })
        }
    }

    get argv(): string {
        return [this._name, this._args].join(' ')
    }

    get process(): Readonly<ChildProcess> {
        return this._proc as ChildProcess
    }

    public [Symbol.asyncIterator](): AsyncIterableIterator<string> {
        return rl
            .createInterface({
                input: this,
                crlfDelay: Infinity,
            })
            [Symbol.asyncIterator]()
    }

    // TODO:
    // public filter(cb): this {
    //     return this
    // }

    public then(): Promise<void>
    public then<T>(onFulfilled: OnFulfilled<T>): Promise<T>
    public then<T, C>(
        onFulfilled: OnFulfilled<T>,
        onRejected: OnRejected<C>
    ): Promise<T | C>
    public then(
        onFulfilled?: OnFulfilled<unknown>,
        onRejected?: OnRejected<unknown>
    ): Promise<unknown> {
        return this._chain.then(onFulfilled, onRejected)
    }

    public catch(): Promise<void>
    public catch<C>(onRejected: OnRejected<C>): Promise<C>
    public catch(onRejected?: OnRejected<unknown>): Promise<unknown> {
        return this._chain.catch(onRejected)
    }

    public finally<T>(onfinally?: (() => void) | undefined | null): Promise<T>
    public finally(onFinally?: () => void): Promise<unknown> {
        return this._chain.finally(onFinally)
    }

    public _read(_size: number): void {
        // There is nothing to do here, because the data is
        // already being pushed to the stream at the constructor
    }
    public _write(
        chunk: unknown,
        encoding: BufferEncoding,
        done: (error: Error | null | undefined) => void
    ): void {
        this._proc.stdin?.write(chunk, encoding, done)
    }

    private _promise: Promise<unknown> = Promise.resolve()
    private get _chain(): Promise<ProcResult> {
        return this._promise.then(
            () =>
                new Promise((resolve, reject) => {
                    this._proc.on('exit', (code) => {
                        if (typeof code !== 'number') {
                            throw new Error('Proc exited unsuccessfully')
                        }

                        const result: ProcResult = { code, proc: this }

                        if (code === 0) {
                            resolve(result)
                        } else {
                            // TODO: handle output stream when error
                            // if (this._proc.stdout) {
                            //     this._stdout = cloneReadable(this._proc.stdout)
                            // }
                            // if (this._proc.stderr) {
                            //     this._stderr = cloneReadable(this._proc.stderr)
                            // }

                            reject(new ProcError(result))
                        }
                    })
                })
        )
    }
}
