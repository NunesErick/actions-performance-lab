# Java benchmark app

This small Maven project runs simple CPU, memory and disk IO micro-benchmarks. It's intended to be used in CI (GitHub Actions) to compare runtime performance between different runners and languages.

Usage

1. Build:

```bash
mvn -f java/benchmark-app/pom.xml package
```

2. Run (defaults: iterations=3 cpuN=3000 memMB=50 ioMB=10):

```bash
java -jar java/benchmark-app/target/benchmark-app-1.0-SNAPSHOT-jar-with-dependencies.jar [iterations] [cpuN] [memMB] [ioMB]
```

Example:

```bash
java -jar java/benchmark-app/target/benchmark-app-1.0-SNAPSHOT-jar-with-dependencies.jar 3 3000 50 10
```

Output is printed in simple lines like:

- cpu_ms: time spent computing primes in milliseconds
- mem_ms: time spent allocating memory in milliseconds
- io_ms: time spent writing+reading file in milliseconds

Tune parameters to increase or reduce stress based on runner capacity.
