import type { ChildProcess } from 'child_process'

export type LimitedChildProcess = Pick<
    ChildProcess,
    'pid' | 'spawnfile' | 'spawnargs' | 'on' | 'stdin' | 'stdout' | 'stderr'
>
