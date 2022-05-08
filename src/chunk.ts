export const CHUNK_ORIGIN_FD_STDOUT = 0
export const CHUNK_ORIGIN_FD_STDERR = 1

export type ChunkOriginFd =
    | typeof CHUNK_ORIGIN_FD_STDOUT
    | typeof CHUNK_ORIGIN_FD_STDERR

export interface ProcStreamChunkString extends String {
    origin: ChunkOriginFd
}

export interface ProcStreamChunkBuffer extends Buffer {
    origin: ChunkOriginFd
}

export function createProcStreamChunk(
    chunk: string | Buffer,
    origin: ChunkOriginFd
): ProcStreamChunkString | ProcStreamChunkBuffer {
    if (chunk instanceof Buffer) {
        return createProcStreamChunkBuffer(chunk, origin)
    }

    return createProcStreamChunkString(chunk, origin)
}

function createProcStreamChunkString(
    chunk: string,
    origin: ChunkOriginFd
): ProcStreamChunkString {
    const _chunk = chunk as unknown as ProcStreamChunkString
    _chunk.origin = origin
    return _chunk
}

// TODO: test `Buffer.from(buffer.buffer)` does not copy the underlying array buffer
function createProcStreamChunkBuffer(
    chunk: Buffer,
    origin: ChunkOriginFd
): ProcStreamChunkBuffer {
    const _chunk = Buffer.from(chunk.buffer) as ProcStreamChunkBuffer
    _chunk.origin = origin
    return _chunk
}
