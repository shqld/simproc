import test from 'ava'

import { Proc } from '../src'

test.todo('out: proc')
test.todo('out: stream')

test('out', async (t) => {
    const proc = new Proc('node tests/mock/proc --out')

    const data: Array<Buffer> = []
    proc.on('data', (chunk) => {
        data.push(chunk)
    })

    await proc

    // NOTE: no check for data.length, since chunk number are non-deterministic here in reading
    t.is(Buffer.concat(data).toString(), 'out')
})

test('out * 2', async (t) => {
    const proc = new Proc('node tests/mock/proc --out --out')

    const data: Array<Buffer> = []
    proc.on('data', (chunk) => {
        t.assert(Buffer.isBuffer(chunk))
        data.push(chunk)
    })

    await proc

    // NOTE: no check for data.length, since chunk number are non-deterministic here in reading
    t.is(Buffer.concat(data).toString(), 'outout')
})

test('err', async (t) => {
    const proc = new Proc('node tests/mock/proc --err')

    const data: Array<Buffer> = []
    proc.on('data', (chunk) => {
        t.assert(Buffer.isBuffer(chunk))
        data.push(chunk)
    })

    await proc

    // NOTE: no check for data.length, since chunk number are non-deterministic here in reading
    t.is(Buffer.concat(data).toString(), 'err')
})

test('err * 2', async (t) => {
    const proc = new Proc('node tests/mock/proc --err --err')

    const data: Array<Buffer> = []
    proc.on('data', (chunk) => {
        t.assert(Buffer.isBuffer(chunk))
        data.push(chunk)
    })

    await proc

    // NOTE: no check for data.length, since chunk number are non-deterministic here in reading
    t.is(Buffer.concat(data).toString(), 'errerr')
})

test('(out err)', async (t) => {
    const proc = new Proc('node tests/mock/proc --out --err')

    const data: Array<Buffer> = []
    proc.on('data', (chunk) => {
        t.assert(Buffer.isBuffer(chunk))
        data.push(chunk)
    })

    await proc

    // NOTE: no check for data.length, since chunk number are non-deterministic here in reading
    const str = Buffer.concat(data).toString()
    // NOTE: also not compare with the entire string, since the order of out/err string is non-deterministic
    t.is(str.length, 3 * 2)
    t.assert(str.includes('out'))
    t.assert(str.includes('err'))
})

test('(out err) * 2', async (t) => {
    const proc = new Proc('node tests/mock/proc --out --err --out --err')

    const data: Array<Buffer> = []
    proc.on('data', (chunk) => {
        t.assert(Buffer.isBuffer(chunk))
        data.push(chunk)
    })

    await proc

    // NOTE: no check for data.length, since chunk number are non-deterministic here in reading
    const str = Buffer.concat(data).toString()
    // NOTE: also not compare with the entire string, since the order of out/err string is non-deterministic
    t.is(str.length, 3 * 4)
    t.assert(str.includes('out'))
    t.assert(str.includes('err'))
})

test('in', async (t) => {
    const proc = new Proc('node tests/mock/proc --in')

    proc.write('in')
    proc.end()

    const data: Array<Buffer> = []
    proc.on('data', (chunk) => {
        t.assert(Buffer.isBuffer(chunk))
        data.push(chunk)
    })

    await proc

    t.is(Buffer.concat(data).toString(), '[in]')
})

test('in * 2', async (t) => {
    const proc = new Proc('node tests/mock/proc --in')

    proc.write('in')
    proc.write('in')
    proc.end()

    const data: Array<Buffer> = []
    proc.on('data', (chunk) => {
        t.assert(Buffer.isBuffer(chunk))
        data.push(chunk)
    })

    await proc

    t.is(Buffer.concat(data).toString(), '[inin]')
})

test('(in out err)', async (t) => {
    const proc = new Proc('node tests/mock/proc --in --out --err')

    proc.write('in')
    proc.end()

    const data: Array<Buffer> = []
    proc.on('data', (chunk) => {
        t.assert(Buffer.isBuffer(chunk))
        data.push(chunk)
    })

    await proc

    // NOTE: no check for data.length, since chunk number are non-deterministic here in reading
    const str = Buffer.concat(data).toString()
    // NOTE: also not compare with the entire string, since the order of out/err string is non-deterministic
    t.is(str.length, '[in]outerr'.length)
    t.assert(str.includes('[in]'))
    t.assert(str.includes('out'))
    t.assert(str.includes('err'))
})
