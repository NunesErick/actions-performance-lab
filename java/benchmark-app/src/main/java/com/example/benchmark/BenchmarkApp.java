package com.example.benchmark;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.Arrays;

public class BenchmarkApp {

    public static void main(String[] args) throws Exception {
        int iterations = 3;
        int cpuN = 3000;
        int memMB = 50;
        int ioMB = 10;

        if (args.length >= 1) iterations = Integer.parseInt(args[0]);
        if (args.length >= 2) cpuN = Integer.parseInt(args[1]);
        if (args.length >= 3) memMB = Integer.parseInt(args[2]);
        if (args.length >= 4) ioMB = Integer.parseInt(args[3]);

        System.out.println("BenchmarkApp start: iterations=" + iterations + " cpuN=" + cpuN + " memMB=" + memMB + " ioMB=" + ioMB);

        for (int i = 1; i <= iterations; i++) {
            System.out.println("--- iteration " + i + " ---");

            long tCpu = cpuTask(cpuN);
            System.out.printf("cpu_ms:%d\n", tCpu / 1_000_000);

            long tMem = memTask(memMB);
            System.out.printf("mem_ms:%d\n", tMem / 1_000_000);

            long tIo = ioTask(ioMB);
            System.out.printf("io_ms:%d\n", tIo / 1_000_000);

            Thread.sleep(200);
        }

        System.out.println("BenchmarkApp done");
    }

    static long cpuTask(int n) {
        long start = System.nanoTime();
        
        int size = Math.max(16, Math.min(n, 20000));
        int repeats = 3;

        int state = 0;
        for (int r = 0; r < repeats; r++) {
            int[] arr = new int[size];
            for (int i = 0; i < size; i++) {
                state = state * 1664525 + 1013904223;
                arr[i] = state;
            }
            bubbleSort(arr);
        }

        
        StringBuilder sb = new StringBuilder(size * 8);
        for (int i = 0; i < size * 8; i++) sb.append((char) ('a' + (i % 26)));
        String big = sb.toString();
        Pattern p = Pattern.compile("(a+b+)+c?");
        
        for (int i = 0; i < 100; i++) {
            Matcher m = p.matcher(big);
            while (m.find()) {
                
            }
        }

        long elapsed = System.nanoTime() - start;
        return elapsed;
    }

    static void bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            boolean swapped = false;
            for (int j = 0; j < n - 1 - i; j++) {
                if (arr[j] > arr[j + 1]) {
                    int t = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = t;
                    swapped = true;
                }
            }
            if (!swapped) break;
        }
    }

    static long memTask(int memMB) {
        long start = System.nanoTime();
        int chunk = 1024 * 1024;
        List<byte[]> list = new ArrayList<>();
        try {
            for (int i = 0; i < memMB; i++) {
                byte[] b = new byte[chunk];
                for (int j = 0; j < b.length; j += 4096) b[j] = 1;
                list.add(b);
            }
        } catch (OutOfMemoryError e) {
            System.out.println("mem_out_of_memory");
        }
        long elapsed = System.nanoTime() - start;
        list = null;
        return elapsed;
    }

    static long ioTask(int ioMB) {
        long start = System.nanoTime();
        Path tmp = null;
        try {
            tmp = Files.createTempFile("bench-io", ".dat");
            File f = tmp.toFile();
            try (FileOutputStream out = new FileOutputStream(f)) {
                byte[] buf = new byte[1024 * 1024];
                for (int i = 0; i < buf.length; i += 4096) buf[i] = 1;
                for (int i = 0; i < ioMB; i++) {
                    out.write(buf);
                }
                out.getFD().sync();
            }
            // read back
            byte[] readBuf = Files.readAllBytes(tmp);
            if (readBuf.length == 0) System.out.println("io_read_zero_bytes");
        } catch (IOException e) {
            System.out.println("io_error:" + e.getMessage());
        } finally {
            if (tmp != null) try { Files.deleteIfExists(tmp); } catch (IOException ignored) {}
        }
        long elapsed = System.nanoTime() - start;
        return elapsed;
    }
}
