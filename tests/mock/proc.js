/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */

// This file is to run as a process, i.e. `node tests/mock/proc/proc`

const assert = require('assert/strict')
const { format } = require('util')
const args = process.argv.slice(2)

run()

function run() {
    switch (args.shift()) {
        case undefined:
            return
        case '--in':
            {
                process.stdin.on('data', (chunk) => {
                    process.stdout.write(format('[%s]', chunk))
                })
            }
            break
        case '--out':
            process.stdout.write('out')
            break
        case '--err':
            process.stderr.write('err')
            break
        case '--exit':
            {
                const code = Number(args.shift())
                assert(!Number.isNaN(code))
                process.exit(code)
            }
            break
        default:
            break
    }

    process.nextTick(() => run())
}
