package main

import (
    "fmt"
    "io/ioutil"
    "os"
    "regexp"
    "strconv"
    "time"
)

func main() {
    iterations := 3
    cpuN := 3000
    memMB := 50
    ioMB := 10

    args := os.Args[1:]
    if len(args) >= 1 {
        if v, err := strconv.Atoi(args[0]); err == nil {
            iterations = v
        }
    }
    if len(args) >= 2 {
        if v, err := strconv.Atoi(args[1]); err == nil {
            cpuN = v
        }
    }
    if len(args) >= 3 {
        if v, err := strconv.Atoi(args[2]); err == nil {
            memMB = v
        }
    }
    if len(args) >= 4 {
        if v, err := strconv.Atoi(args[3]); err == nil {
            ioMB = v
        }
    }

    fmt.Printf("BenchmarkApp start: iterations=%d cpuN=%d memMB=%d ioMB=%d\n", iterations, cpuN, memMB, ioMB)

    for i := 1; i <= iterations; i++ {
        fmt.Printf("--- iteration %d ---\n", i)

        tCpu := cpuTask(cpuN)
        fmt.Printf("cpu_ms:%d\n", tCpu.Milliseconds())

        tMem := memTask(memMB)
        fmt.Printf("mem_ms:%d\n", tMem.Milliseconds())

        tIo := ioTask(ioMB)
        fmt.Printf("io_ms:%d\n", tIo.Milliseconds())

        time.Sleep(200 * time.Millisecond)
    }

    fmt.Println("BenchmarkApp done")
}

func cpuTask(n int) time.Duration {
    start := time.Now()

    size := n
    if size < 16 {
        size = 16
    }
    if size > 20000 {
        size = 20000
    }
    repeats := 3

    var state uint32 = 0
    for r := 0; r < repeats; r++ {
        arr := make([]int, size)
        for i := 0; i < size; i++ {
            state = state*1664525 + 1013904223
            arr[i] = int(int32(state))
        }
        bubbleSort(arr)
    }

    // regex work on a big generated string
    sb := make([]byte, size*8)
    for i := range sb {
        sb[i] = byte('a' + (i % 26))
    }
    big := string(sb)
    p := regexp.MustCompile(`(a+b+)+c?`)
    for i := 0; i < 100; i++ {
        m := p.FindAllStringIndex(big, -1)
        _ = m
    }

    return time.Since(start)
}

func bubbleSort(arr []int) {
    n := len(arr)
    for i := 0; i < n-1; i++ {
        swapped := false
        for j := 0; j < n-1-i; j++ {
            if arr[j] > arr[j+1] {
                arr[j], arr[j+1] = arr[j+1], arr[j]
                swapped = true
            }
        }
        if !swapped {
            break
        }
    }
}

func memTask(memMB int) time.Duration {
    start := time.Now()
    chunk := 1024 * 1024
    list := make([][]byte, 0, memMB)
    for i := 0; i < memMB; i++ {
        b := make([]byte, chunk)
        for j := 0; j < len(b); j += 4096 {
            b[j] = 1
        }
        list = append(list, b)
    }
    // drop reference
    list = nil
    return time.Since(start)
}

func ioTask(ioMB int) time.Duration {
    start := time.Now()
    tmpDir := os.TempDir()
    tmpFile, err := ioutil.TempFile(tmpDir, "bench-io-*.dat")
    if err != nil {
        return time.Since(start)
    }
    name := tmpFile.Name()
    buf := make([]byte, 1024*1024)
    for i := 0; i < len(buf); i += 4096 {
        buf[i] = 1
    }
    for i := 0; i < ioMB; i++ {
        _, _ = tmpFile.Write(buf)
    }
    _ = tmpFile.Sync()
    _ = tmpFile.Close()

    // read back
    _, _ = ioutil.ReadFile(name)
    _ = os.Remove(name)

    return time.Since(start)
}
