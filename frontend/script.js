// Ganti dengan URL Render nanti saat sudah di-deploy
const BACKEND_URL = "http://localhost:3001"; 
let socket;
let currentUser = ""; 

// Daftar warna untuk username
const userColors = [
    '#ef4444', '#f97316', '#ca8a04', '#16a34a', '#0d9488', 
    '#2563eb', '#7c3aed', '#db2777', '#9f1239'
];

function getUsernameColor(username) {
    // Pertahanan: Jika username kosong/undefined, gunakan nama "Anonim"
    const safeName = username || "Anonim"; 
    
    let hash = 0;
    for (let i = 0; i < safeName.length; i++) {
        hash = safeName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % userColors.length;
    return userColors[index];
}

// 1. FITUR AUTO-LOGIN: Cek apakah user sudah login sebelumnya
document.addEventListener("DOMContentLoaded", () => {
    const savedToken = localStorage.getItem('chatToken');
    const savedUser = localStorage.getItem('chatUser');
    
    if (savedToken && savedUser) {
        currentUser = savedUser;
        document.getElementById('authPanel').style.display = 'none';
        document.getElementById('chatPanel').style.display = 'block';
        document.getElementById('userGreeting').innerText = `Halo, ${currentUser}`;
        connectSocket(savedToken);
        loadChatHistory();
        loadUserCount();
    }
});

async function handleAuth(endpoint) {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const authMessage = document.getElementById('authMessage');
    const btnGroup = document.querySelector('.btn-group');

    if(!usernameInput.value || !passwordInput.value) {
        authMessage.style.color = 'var(--error-color)';
        authMessage.innerText = "Username dan password harus diisi.";
        return;
    }

    // 2. FITUR ANTI-SPAM: Simpan tombol asli dan ganti jadi loading
    const originalBtnHTML = btnGroup.innerHTML;
    btnGroup.innerHTML = `<button disabled style="width: 100%; opacity: 0.7; cursor: not-allowed;">Memproses...</button>`;
    authMessage.innerText = "";

    try {
        const res = await fetch(BACKEND_URL + endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username: usernameInput.value, 
                password: passwordInput.value 
            })
        });
        const data = await res.json();
        
        if (data.success) {
            if (endpoint === '/api/login') {
                // Simpan token ke LocalStorage agar tidak hilang saat di-refresh
                localStorage.setItem('chatToken', data.token);
                localStorage.setItem('chatUser', data.username);
                currentUser = data.username; 
                
                document.getElementById('authPanel').style.display = 'none';
                document.getElementById('chatPanel').style.display = 'block';
                document.getElementById('userGreeting').innerText = `Halo, ${currentUser}`;
                connectSocket(data.token);
                loadChatHistory();
                loadUserCount();
            } else {
                authMessage.style.color = '#10b981'; 
                authMessage.innerText = data.message || "Registrasi berhasil, silakan login.";
                // Kembalikan tombol seperti semula setelah berhasil daftar
                btnGroup.innerHTML = originalBtnHTML;
            }
        } else {
            authMessage.style.color = 'var(--error-color)';
            authMessage.innerText = data.message;
            // Kembalikan tombol jika gagal login/daftar
            btnGroup.innerHTML = originalBtnHTML;
        }
    } catch (error) {
        console.error("Error API", error);
        authMessage.style.color = 'var(--error-color)';
        authMessage.innerText = "Terjadi kesalahan koneksi ke server.";
        btnGroup.innerHTML = originalBtnHTML;
    }
}

// Fungsi baru untuk menarik riwayat dari MongoDB
async function loadChatHistory() {
    try {
        const res = await fetch(BACKEND_URL + '/api/messages');
        const historyData = await res.json();
        
        const messages = document.getElementById('messages');
        messages.innerHTML = ''; // Bersihkan layar sebelum memuat ulang
        
        // Pastikan historyData adalah array sebelum di-loop
        if (Array.isArray(historyData)) {
            historyData.forEach(data => {
                const li = document.createElement('li');
                const isMyMessage = data.username === currentUser;
                li.classList.add(isMyMessage ? 'my-message' : 'other-message');
                
                const dateObj = new Date(data.createdAt || Date.now());
                const timeString = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                
                const nameStyle = isMyMessage ? '' : `style="color: ${getUsernameColor(data.username)};"`;

                li.innerHTML = `
                    <strong ${nameStyle}>${data.username}</strong> 
                    <span class="message-text"></span>
                    <span class="time-stamp">${timeString}</span>
                `;
                
                li.querySelector('.message-text').textContent = data.text;
                messages.appendChild(li);
            });
            
            // Otomatis gulir ke pesan paling bawah
            messages.scrollTop = messages.scrollHeight;
        }
    } catch (error) {
        console.error("Gagal memuat riwayat obrolan", error);
    }
}

// --- Logout dengan Konfirmasi ---
function showLogoutConfirm() {
    document.getElementById('logoutModal').classList.add('active');
}

function hideLogoutConfirm() {
    document.getElementById('logoutModal').classList.remove('active');
}

function confirmLogout() {
    clearSession();
}

// Logout paksa (dipakai saat token invalid/expired, tanpa dialog)
function clearSession() {
    localStorage.removeItem('chatToken');
    localStorage.removeItem('chatUser');
    location.reload();
}

function connectSocket(token) {
    socket = io(BACKEND_URL, {
        auth: { token: token }
    });

    socket.on('receive_message', (data) => {
        const messages = document.getElementById('messages');
        const li = document.createElement('li');
        
        const isMyMessage = data.username === currentUser;
        li.classList.add(isMyMessage ? 'my-message' : 'other-message');
        
        const now = new Date();
        const timeString = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const nameStyle = isMyMessage ? '' : `style="color: ${getUsernameColor(data.username)};"`;

        // 3. FITUR ANTI-XSS: Kerangka HTML dipisah dari teks input user
        li.innerHTML = `
            <strong ${nameStyle}>${data.username}</strong> 
            <span class="message-text"></span>
            <span class="time-stamp">${timeString}</span>
        `;
        
        // Memasukkan pesan dengan textContent (mengubah script jahat menjadi teks biasa)
        li.querySelector('.message-text').textContent = data.text;
        
        messages.appendChild(li);
        messages.scrollTop = messages.scrollHeight;
    });

    socket.on('connect_error', (err) => {
        alert("Sesi obrolan bermasalah atau token kedaluwarsa. Silakan login ulang.");
        clearSession();
    });
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    if (input.value.trim() && socket) {
        // Tambahkan username ke dalam payload yang dikirim
        socket.emit('send_message', { 
            text: input.value,
            username: currentUser 
        });
        input.value = '';
    }
}

async function loadUserCount() {
    try {
        const res = await fetch(BACKEND_URL + '/api/users/count');
        const data = await res.json();
        
        if (data.success) {
            // Mengubah teks dari "1 Online" menjadi total user terdaftar
            document.getElementById('onlineCount').innerText = `${data.count} Terdaftar`;
        }
    } catch (error) {
        console.error("Gagal memuat jumlah user:", error);
    }
}

function handleEnter(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function updateClock() {
    const now = new Date();
    const timeEl = document.getElementById("liveClock");
    const dateEl = document.getElementById("liveDate");

    if (timeEl) {
        timeEl.textContent = now.toLocaleTimeString("id-ID", { hour12: false });
    }
    if (dateEl) {
        dateEl.textContent = now.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
        });
    }
}

updateClock();
setInterval(updateClock, 1000);

// --- Interaksi tambahan untuk modal logout ---
document.addEventListener('click', (e) => {
    const modal = document.getElementById('logoutModal');
    if (e.target === modal) hideLogoutConfirm();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideLogoutConfirm();
});