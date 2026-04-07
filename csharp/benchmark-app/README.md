# C# benchmark app

This .NET console app mirrors the Java/Go/Node benchmark. It uses a deterministic 32-bit LCG to generate input arrays and then performs repeated bubble sorts, regex loops, memory allocation, and IO write/read.

Build & run

```bash
cd csharp/benchmark-app
dotnet build -c Release
dotnet run --project csharp/benchmark-app -- 3 500 50 10
```

Output lines are the same format as other implementations:

- `cpu_ms:...`
- `mem_ms:...`
- `io_ms:...`

Note: This project is a work in progress.
