import { Readable, Writable } from 'node:stream'

export class ReadableStream extends Readable {
    data: Array<string>

    constructor(data: Array<string>) {
        super()

        this.data = data
    }

    _read(): void {
        this.push(this.data.shift() ?? null)
    }
}

export class WritableStream extends Writable {
    data: Array<string> = []

    _write(chunk: Buffer | string): void {
        this.data.push(chunk.toString())
    }
}
