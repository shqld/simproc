import { Proc } from './proc'
import type { ProcResult } from './result'

export class ProcError extends Error implements ProcResult {
    code!: number
    proc!: Proc

    constructor({ code, proc }: ProcResult) {
        super()

        Error.captureStackTrace?.(this, ProcError)

        const message = `Proc "${proc.argv}" failed with exit code ${code}`

        Object.defineProperties(this, {
            message: {
                get() {
                    return message
                },
            },
            code: {
                get() {
                    return code
                },
            },
            proc: {
                get() {
                    return proc
                },
            },
        })
    }
}

// Avoid mangling for the error name
Object.defineProperty(ProcError, 'name', { value: 'CommmandError' })
