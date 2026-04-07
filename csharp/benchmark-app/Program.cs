using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Text.RegularExpressions;

class Program
{
    static int Main(string[] args)
    {
        int iterations = 3;
        int cpuN = 3000;
        int memMB = 50;
        int ioMB = 10;

        if (args.Length >= 1) int.TryParse(args[0], out iterations);
        if (args.Length >= 2) int.TryParse(args[1], out cpuN);
        if (args.Length >= 3) int.TryParse(args[2], out memMB);
        if (args.Length >= 4) int.TryParse(args[3], out ioMB);

        Console.WriteLine($"BenchmarkApp start: iterations={iterations} cpuN={cpuN} memMB={memMB} ioMB={ioMB}");

        for (int i = 1; i <= iterations; i++)
        {
            Console.WriteLine($"--- iteration {i} ---");

            var tCpu = CpuTask(cpuN);
            Console.WriteLine($"cpu_ms:{tCpu.TotalMilliseconds:0}");

            var tMem = MemTask(memMB);
            Console.WriteLine($"mem_ms:{tMem.TotalMilliseconds:0}");

            var tIo = IoTask(ioMB);
            Console.WriteLine($"io_ms:{tIo.TotalMilliseconds:0}");

            System.GC.Collect();
            System.Threading.Thread.Sleep(200);
        }

        Console.WriteLine("BenchmarkApp done");
        return 0;
    }

    static TimeSpan CpuTask(int n)
    {
        var sw = Stopwatch.StartNew();

        int size = Math.Max(16, Math.Min(n, 20000));
        int repeats = 3;

        uint state = 0u;
        for (int r = 0; r < repeats; r++)
        {
            int[] arr = new int[size];
            for (int i = 0; i < size; i++)
            {
                state = state * 1664525u + 1013904223u;
                arr[i] = (int)state;
            }
            BubbleSort(arr);
        }

        // regex work
        var sb = new System.Text.StringBuilder(size * 8);
        for (int i = 0; i < size * 8; i++) sb.Append((char)('a' + (i % 26)));
        var big = sb.ToString();
        var regex = new Regex("(a+b+)+c?");
        for (int i = 0; i < 100; i++)
        {
            var m = regex.Matches(big);
            foreach (Match _ in m) { }
        }

        sw.Stop();
        return sw.Elapsed;
    }

    static void BubbleSort(int[] arr)
    {
        int n = arr.Length;
        for (int i = 0; i < n - 1; i++)
        {
            bool swapped = false;
            for (int j = 0; j < n - 1 - i; j++)
            {
                if (arr[j] > arr[j + 1])
                {
                    int t = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = t;
                    swapped = true;
                }
            }
            if (!swapped) break;
        }
    }

    static TimeSpan MemTask(int memMB)
    {
        var sw = Stopwatch.StartNew();
        int chunk = 1024 * 1024;
        var list = new List<byte[]>();
        try
        {
            for (int i = 0; i < memMB; i++)
            {
                var b = new byte[chunk];
                for (int j = 0; j < b.Length; j += 4096) b[j] = 1;
                list.Add(b);
            }
        }
        catch (OutOfMemoryException)
        {
            Console.WriteLine("mem_out_of_memory");
        }
        sw.Stop();
        list = null;
        return sw.Elapsed;
    }

    static TimeSpan IoTask(int ioMB)
    {
        var sw = Stopwatch.StartNew();
        string tmp = Path.Combine(Path.GetTempPath(), "bench-io-" + Guid.NewGuid().ToString("N") + ".dat");
        try
        {
            using (var fs = new FileStream(tmp, FileMode.Create, FileAccess.Write, FileShare.None))
            {
                var buf = new byte[1024 * 1024];
                for (int i = 0; i < buf.Length; i += 4096) buf[i] = 1;
                for (int i = 0; i < ioMB; i++)
                {
                    fs.Write(buf, 0, buf.Length);
                }
                fs.Flush(true);
            }
            var read = File.ReadAllBytes(tmp);
            if (read.Length == 0) Console.WriteLine("io_read_zero_bytes");
        }
        catch (IOException e)
        {
            Console.WriteLine("io_error:" + e.Message);
        }
        finally
        {
            try { File.Delete(tmp); } catch { }
        }
        sw.Stop();
        return sw.Elapsed;
    }
}
