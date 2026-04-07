#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')
const os = require('os')
const crypto = require('crypto')

function nowMs() { return Number(BigInt(Date.now())) }

function parseArgs() {
  const args = process.argv.slice(2)
  const parsed = {
    iterations: 3,
    cpuN: 3000,
    memMB: 50,
    ioMB: 10
  }
  if (args.length >= 1) parsed.iterations = parseInt(args[0], 10)
  if (args.length >= 2) parsed.cpuN = parseInt(args[1], 10)
  if (args.length >= 3) parsed.memMB = parseInt(args[2], 10)
  if (args.length >= 4) parsed.ioMB = parseInt(args[3], 10)
  return parsed
}

function lcgNext(state) {
  // 32-bit LCG: state = (state * 1664525 + 1013904223) & 0xffffffff
  return (Math.imul(state, 1664525) + 1013904223) >>> 0
}

function bubbleSort(arr) {
  const n = arr.length
  for (let i = 0; i < n - 1; i++) {
    let swapped = false
    for (let j = 0; j < n - 1 - i; j++) {
      if (arr[j] > arr[j+1]) {
        const t = arr[j]; arr[j] = arr[j+1]; arr[j+1] = t
        swapped = true
      }
    }
    if (!swapped) break
  }
}

function cpuTask(n) {
  const start = process.hrtime.bigint()
  let size = Math.max(16, Math.min(n, 20000))
  const repeats = 3

  let state = 0 >>> 0
  for (let r = 0; r < repeats; r++) {
    const arr = new Int32Array(size)
    for (let i = 0; i < size; i++) {
      state = lcgNext(state)
      arr[i] = state | 0
    }
    // convert to regular array for bubbleSort simplicity
    bubbleSort(Array.from(arr))
  }

  // regex work on large generated string
  const sb = new Array(size * 8)
  for (let i = 0; i < sb.length; i++) sb[i] = String.fromCharCode(97 + (i % 26))
  const big = sb.join('')
  const re = /(a+b+)+c?/g
  for (let i = 0; i < 100; i++) {
    let m
    while ((m = re.exec(big)) !== null) {
      // consume matches
    }
    re.lastIndex = 0
  }

  const elapsed = Number(process.hrtime.bigint() - start) / 1e6
  return Math.round(elapsed)
}

function memTask(memMB) {
  const start = process.hrtime.bigint()
  const chunk = 1024 * 1024
  const list = []
  for (let i = 0; i < memMB; i++) {
    const b = Buffer.alloc(chunk)
    for (let j = 0; j < b.length; j += 4096) b[j] = 1
    list.push(b)
  }
  // drop
  // eslint-disable-next-line no-unused-vars
  const _ = list
  const elapsed = Number(process.hrtime.bigint() - start) / 1e6
  return Math.round(elapsed)
}

function ioTask(ioMB) {
  const start = process.hrtime.bigint()
  const file = path.join(os.tmpdir(), 'bench-io-' + crypto.randomUUID().replace(/-/g, '') + '.dat')
  const fd = fs.openSync(file, 'w')
  const buf = Buffer.alloc(1024 * 1024)
  for (let i = 0; i < buf.length; i += 4096) buf[i] = 1
  for (let i = 0; i < ioMB; i++) {
    fs.writeSync(fd, buf)
  }
  fs.fsyncSync(fd)
  fs.closeSync(fd)
  // read back
  fs.readFileSync(file)
  try { fs.unlinkSync(file) } catch (e) {}
  const elapsed = Number(process.hrtime.bigint() - start) / 1e6
  return Math.round(elapsed)
}

function main() {
  const { iterations, cpuN, memMB, ioMB } = parseArgs()
  console.log(`BenchmarkApp start: iterations=${iterations} cpuN=${cpuN} memMB=${memMB} ioMB=${ioMB}`)
  for (let i = 1; i <= iterations; i++) {
    console.log(`--- iteration ${i} ---`)
    const cpu = cpuTask(cpuN)
    console.log(`cpu_ms:${cpu}`)
    const mem = memTask(memMB)
    console.log(`mem_ms:${mem}`)
    const io = ioTask(ioMB)
    console.log(`io_ms:${io}`)
    // small pause
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 200)
  }
  console.log('BenchmarkApp done')
}

if (require.main === module) main()
