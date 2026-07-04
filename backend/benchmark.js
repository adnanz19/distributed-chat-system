import { io } from "socket.io-client";

// ==========================================
// KONFIGURASI BENCHMARK (Silakan disesuaikan)
// ==========================================
const SERVER_URL = "https://chat.zaynorang.com"; 
const TOTAL_BOTS = 5;                       // Jumlah pengguna bersamaan (Concurrency)
const MESSAGES_PER_BOT = 20;                // Jumlah pesan yang dikirim masing-masing bot
const TOTAL_MESSAGES = TOTAL_BOTS * MESSAGES_PER_BOT;

let connectedBots = 0;
let receivedCount = 0;
let totalLatency = 0;
let startTime = 0;
const botSockets = []; // Menyimpan semua koneksi robot

async function setupBot(botId) {
    const username = `bot_tester_${botId}`;
    const password = "password123";

    try {
        // 1. Robot otomatis melakukan registrasi (Abaikan jika akun sudah ada)
        await fetch(`${SERVER_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        // 2. Robot melakukan login untuk mengambil Token JWT
        const res = await fetch(`${SERVER_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const authData = await res.json();
        
        if (!authData.success) {
            console.error(`❌ ${username} gagal login.`);
            return;
        }

        // 3. Robot terhubung ke Socket.io
        const socket = io(SERVER_URL, { auth: { token: authData.token } });

        socket.on("connect", () => {
            connectedBots++;
            console.log(`🤖 ${username} bersiap! (${connectedBots}/${TOTAL_BOTS} Terhubung)`);
            
            // Masukkan soket ke dalam array
            botSockets.push({ username, socket });

            // Jika semua robot sudah terhubung, eksekusi tembakan serentak!
            if (connectedBots === TOTAL_BOTS) {
                mulaiTembakanSerentak();
            }
        });

        // 4. Robot menangkap pesan pantulan
        socket.on("receive_message", (msg) => {
            // HANYA hitung pesan milik bot ini sendiri untuk akurasi Round-Trip Time
            if (msg.username === username && msg.text.startsWith("BENCHMARK|")) {
                const parts = msg.text.split("|");
                const sentTime = parseInt(parts[1]);
                
                const latency = Date.now() - sentTime; 
                totalLatency += latency;
                receivedCount++;

                // Jika semua pesan dari semua robot telah kembali, hitung hasilnya
                if (receivedCount === TOTAL_MESSAGES) {
                    kalkulasiHasilAkhir();
                }
            }
        });

    } catch (error) {
        console.error(`Terjadi kesalahan pada ${username}:`, error.message);
    }
}

// ==========================================
// FUNGSI EKSEKUSI & KALKULASI
// ==========================================
function mulaiTembakanSerentak() {
    console.log(`\n🚀 SEMUA ROBOT SIAP! Menembakkan total ${TOTAL_MESSAGES} pesan serentak...\n`);
    startTime = Date.now();

    // Memaksa semua robot mengirim pesan di waktu yang persis bersamaan
    for (let i = 0; i < MESSAGES_PER_BOT; i++) {
        botSockets.forEach(bot => {
            bot.socket.emit("send_message", { 
                text: `BENCHMARK|${Date.now()}|${bot.username}-Pesan-${i}`,
                username: bot.username
            });
        });
    }
}

function kalkulasiHasilAkhir() {
    const totalTimeSec = (Date.now() - startTime) / 1000;
    const throughput = TOTAL_MESSAGES / totalTimeSec;
    const avgLatency = totalLatency / TOTAL_MESSAGES;

    console.log(`📊 === HASIL ANALISIS PERFORMA (MULTI-BOT) === 📊`);
    console.log(`Skenario          : ${TOTAL_BOTS} Klien x ${MESSAGES_PER_BOT} Pesan`);
    console.log(`Total Terkirim    : ${TOTAL_MESSAGES} Pesan (Menghasilkan ${TOTAL_MESSAGES * TOTAL_BOTS} data tersiar)`);
    console.log(`Waktu Total       : ${totalTimeSec.toFixed(2)} detik`);
    console.log(`Rata-rata Latensi : ${avgLatency.toFixed(2)} ms`);
    console.log(`Throughput        : ${throughput.toFixed(2)} pesan/detik`);
    console.log(`===============================================\n`);
    process.exit(0);
}

// ==========================================
// JALANKAN PROGRAM
// ==========================================
console.log(`Membangunkan ${TOTAL_BOTS} robot penguji...`);
for (let i = 1; i <= TOTAL_BOTS; i++) {
    setupBot(i);
}