import { DuplexOptions } from 'stream'

export type Options = Partial<{
    cwd: string
    env: Record<string, string>
    timeout: number
    stream: DuplexOptions
}>

export const defaultOptions: Options = Object.freeze({
    env: undefined,
    cwd: undefined,
    timeout: undefined,
})
