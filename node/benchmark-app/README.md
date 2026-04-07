# Node benchmark app

This Node.js program mirrors the Java and Go benchmark implementations. It uses a deterministic 32-bit LCG to generate input arrays and then performs repeated bubble sorts, regex work, memory allocations and IO write/read.

Build / Run

```bash
# optional: install dependencies (none required)
node node/benchmark-app/index.js [iterations] [cpuN] [memMB] [ioMB]
```

Example:

```bash
node node/benchmark-app/index.js 3 500 50 10
```

Output

Lines printed are similar to the Java/Go implementations:
- `cpu_ms:...`
- `mem_ms:...`
- `io_ms:...`

Notes

- Inputs are generated deterministically with the same LCG constants as Java/Go so the generated arrays are consistent across implementations.
- This project is a work in progress.
