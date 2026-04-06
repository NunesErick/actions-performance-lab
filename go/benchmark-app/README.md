# Go benchmark app

Small Go program that mirrors the Java `benchmark-app` behaviour: CPU (bubble sort + regex), memory allocation, and IO write/read.

Build:

```bash
go build -o go/benchmark-app/benchmark-app ./go/benchmark-app
```

Run (defaults: iterations=3 cpuN=3000 memMB=50 ioMB=10):

```bash
./go/benchmark-app/benchmark-app [iterations] [cpuN] [memMB] [ioMB]
```

Example:

```bash
./go/benchmark-app/benchmark-app 3 3000 50 10
```

Output lines are in the form:

- cpu_ms:... (milliseconds)
- mem_ms:...
- io_ms:...
