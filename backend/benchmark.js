import { io } from "socket.io-client";

// Konfigurasi target server
const SERVER_URL = "http://localhost:3001"; 
const USERNAME = "ujang"; // Ganti dengan akun yang sudah kamu register
const PASSWORD = "12345678"; // Ganti dengan password aslinya
const TOTAL_MESSAGES = 100;     // Robot akan menembakkan 100 pesan

async function runBenchmark() {
    console.log(`🤖 Memulai robot penguji untuk ${USERNAME}...`);
    
    // 1. Robot melakukan proses Login via API
    const res = await fetch(`${SERVER_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: USERNAME, password: PASSWORD })
    });
    const authData = await res.json();
    
    if (!authData.success) {
        return console.error("❌ Login gagal. Pastikan username/password benar!");
    }

    // 2. Robot menyambungkan diri ke Socket.io membawa token JWT
    const socket = io(SERVER_URL, { auth: { token: authData.token } });
    
    let receivedCount = 0;
    let totalLatency = 0;
    const startTime = Date.now();

    socket.on("connect", () => {
        console.log(`✅ Terhubung! Menembakkan ${TOTAL_MESSAGES} pesan sekarang...\n`);
        
        // Robot menembakkan 100 pesan sekaligus secara paralel (Concurrency)
        for (let i = 0; i < TOTAL_MESSAGES; i++) {
            const sendTime = Date.now();
            // Menyisipkan waktu berangkat ke dalam teks pesan
            socket.emit("send_message", { text: `BENCHMARK|${sendTime}|Pesan ke-${i}` });
        }
    });

    // 3. Robot menangkap pantulan pesan dari server (Redis)
    socket.on("receive_message", (msg) => {
        if (msg.text.startsWith("BENCHMARK|")) {
            const parts = msg.text.split("|");
            const sentTime = parseInt(parts[1]); // Waktu berangkat
            
            // Waktu sekarang dikurangi waktu berangkat = Latency
            const latency = Date.now() - sentTime; 
            totalLatency += latency;
            receivedCount++;

            // Jika semua 100 pesan sudah kembali, kalkulasi dan cetak hasil akhirnya!
            if (receivedCount === TOTAL_MESSAGES) {
                const totalTimeSec = (Date.now() - startTime) / 1000;
                const throughput = TOTAL_MESSAGES / totalTimeSec;
                const avgLatency = totalLatency / TOTAL_MESSAGES;

                console.log(`📊 === HASIL ANALISIS PERFORMA === 📊`);
                console.log(`Total Pesan       : ${TOTAL_MESSAGES} pesan`);
                console.log(`Waktu Total       : ${totalTimeSec.toFixed(2)} detik`);
                console.log(`Rata-rata Latency : ${avgLatency.toFixed(2)} ms`);
                console.log(`Throughput        : ${throughput.toFixed(2)} pesan/detik`);
                console.log(`===================================\n`);
                process.exit(0);
            }
        }
    });
}

// Jalankan fungsi
runBenchmark();