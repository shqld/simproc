/* eslint-disable @typescript-eslint/no-explicit-any */

import test from 'ava'

import { Proc, ProcError } from '../src'

test('promise: success', async (t) => {
    t.plan(2)

    await new Proc('node tests/mock/proc --exit 0').then((result) => {
        t.assert(result.proc instanceof Proc)
        t.is(result.code, 0)
    })
})

test('promise: failure (code == 1)', async (t) => {
    t.plan(3)

    await new Proc('node tests/mock/proc --exit 1').catch((err: any) => {
        t.assert(err instanceof ProcError)
        t.assert(err.proc instanceof Proc)
        t.is(err.code, 1)
    })
})

test('promise: failure (code == 2)', async (t) => {
    t.plan(3)

    await new Proc('node tests/mock/proc --exit 2').catch((err: any) => {
        t.assert(err instanceof ProcError)
        t.assert(err.proc instanceof Proc)
        t.is(err.code, 2)
    })
})

test('promise: failure (code > 1)', async (t) => {
    t.plan(3)

    await new Proc('node tests/mock/proc --exit 100').catch((err: any) => {
        t.assert(err instanceof ProcError)
        t.assert(err.proc instanceof Proc)
        t.is(err.code, 100)
    })
})

test('async/await: success', async (t) => {
    t.plan(2)

    const result = await new Proc('node tests/mock/proc --exit 0')

    t.assert(result.proc instanceof Proc)
    t.is(result.code, 0)
})

test('async/await: failure (code == 1)', async (t) => {
    t.plan(3)

    try {
        await new Proc('node tests/mock/proc --exit 1')
    } catch (err: any) {
        t.assert(err instanceof ProcError)
        t.assert(err.proc instanceof Proc)
        t.is(err.code, 1)
    }
})

test('async/await: failure (code == 2)', async (t) => {
    t.plan(3)

    try {
        await new Proc('node tests/mock/proc --exit 2')
    } catch (err: any) {
        t.assert(err instanceof ProcError)
        t.assert(err.proc instanceof Proc)
        t.is(err.code, 2)
    }
})

test('async/await: failure (code > 1)', async (t) => {
    t.plan(3)

    try {
        await new Proc('node tests/mock/proc --exit 100')
    } catch (err: any) {
        t.assert(err instanceof ProcError)
        t.assert(err.proc instanceof Proc)
        t.is(err.code, 100)
    }
})
