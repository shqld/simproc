import test from 'ava'

import { Proc } from '../src'
import { ReadableStream, WritableStream } from './mock/stream'

test('stdin: proc | proc', async (t) => {
    const piping = new Proc('node tests/mock/proc --out')
    const piped = new Proc('node tests/mock/proc --in')

    const pipeline = piping.pipe(piped)

    const data: Array<Buffer> = []
    piped.on('data', (chunk) => {
        data.push(chunk)
    })

    await pipeline

    t.is(Buffer.concat(data).toString(), '[out]')
    t.is(pipeline, piped)
    t.assert(pipeline instanceof Proc)
})

test('stdin: stream | proc', async (t) => {
    const piping = new ReadableStream(['hello'])
    const piped = new Proc('node tests/mock/proc --in')

    const pipeline = piping.pipe(piped)

    const data: Array<Buffer> = []
    piped.on('data', (chunk) => {
        data.push(chunk)
    })

    await pipeline

    t.is(Buffer.concat(data).toString(), '[hello]')
    t.is(pipeline, piped)
    t.assert(pipeline instanceof Proc)
})

test('stdout: proc | proc', async (t) => {
    const piping = new Proc('node tests/mock/proc --out')
    const piped = new Proc('node tests/mock/proc --in')

    const pipeline = piping.pipe(piped)

    const data: Array<Buffer> = []
    piped.on('data', (chunk) => {
        data.push(chunk)
    })

    await pipeline

    t.is(Buffer.concat(data).toString(), '[out]')
    t.is(pipeline, piped)
    t.assert(pipeline instanceof Proc)
})

test('stdout: proc | stream', async (t) => {
    const piping = new Proc('node tests/mock/proc --out')
    const piped = new WritableStream()

    const pipeline = piping.pipe(piped)

    // TODO: should await `piped` but it does not emit 'finish' now ...
    // TODO: make piped awaitable? `await pipeline`
    await piping

    t.is(piped.data.join(), 'out')
    t.is(pipeline, piped)
    t.falsy(pipeline instanceof Proc)
})

test('stderr: proc | proc', async (t) => {
    const piping = new Proc('node tests/mock/proc --err')
    const piped = new Proc('node tests/mock/proc --in')

    const pipeline = piping.pipe(piped)

    const data: Array<Buffer> = []
    piped.on('data', (chunk) => {
        data.push(chunk)
    })

    await pipeline

    t.is(Buffer.concat(data).toString(), '[err]')
    t.is(pipeline, piped)
    t.assert(pipeline instanceof Proc)
})

test('stderr: proc | stream', async (t) => {
    const piping = new Proc('node tests/mock/proc --err')
    const piped = new WritableStream()

    const pipeline = piping.pipe(piped)

    // TODO: should await `piped` but it does not emit 'finish' now ...
    // TODO: make piped awaitable? `await pipeline`
    await piping

    t.is(piped.data.join(), 'err')
    t.is(pipeline, piped)
    t.falsy(pipeline instanceof Proc)
})
