// Ganti dengan URL Render nanti saat sudah di-deploy
const BACKEND_URL = "https://chat.zaynorang.com";
let socket;
let currentUser = ""; 

// Daftar warna untuk username
const userColors = [
    '#ef4444', '#f97316', '#ca8a04', '#16a34a', '#0d9488', 
    '#2563eb', '#7c3aed', '#db2777', '#9f1239'
];

function getUsernameColor(username) {
    const safeName = username || "Anonim"; 
    let hash = 0;
    for (let i = 0; i < safeName.length; i++) {
        hash = safeName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % userColors.length;
    return userColors[index];
}

// 1. FITUR AUTO-LOGIN
document.addEventListener("DOMContentLoaded", () => {
    const savedToken = localStorage.getItem('chatToken');
    const savedUser = localStorage.getItem('chatUser');
    const savedPic = localStorage.getItem('chatProfilePic'); // <--- Menarik foto dari memori
    
    if (savedToken && savedUser) {
        currentUser = savedUser;
        document.getElementById('authPanel').style.display = 'none';
        document.getElementById('chatPanel').style.display = 'block';
        document.getElementById('userGreeting').innerText = `Halo, ${currentUser}`;
        
        // === KODE UNTUK MENAMPILKAN KEMBALI FOTO DI SIDEBAR ===
        if (savedPic && savedPic !== "undefined" && savedPic !== "null") {
            const kotakAvatar = document.querySelector(".profile-avatar");
            if (kotakAvatar) {
                kotakAvatar.innerHTML = `<img src="${savedPic}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            }
        }
        // ======================================================

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
                localStorage.setItem('chatToken', data.token);
                localStorage.setItem('chatUser', data.username);
                currentUser = data.username; 
                
                if (data.profilePic) {
                    const fullImageUrl = BACKEND_URL + data.profilePic;
                    localStorage.setItem("chatProfilePic", fullImageUrl);
                    
                    const kotakAvatar = document.querySelector(".profile-avatar");
                    if (kotakAvatar) {
                        kotakAvatar.innerHTML = `<img src="${fullImageUrl}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
                    }
                } else {
                    localStorage.removeItem("chatProfilePic");
                }
                
                document.getElementById('authPanel').style.display = 'none';
                document.getElementById('chatPanel').style.display = 'block';
                document.getElementById('userGreeting').innerText = `Halo, ${currentUser}`;
                connectSocket(data.token);
                loadChatHistory();
                loadUserCount();
            } else {
                authMessage.style.color = '#10b981'; 
                authMessage.innerText = data.message || "Registrasi berhasil, silakan login.";
                btnGroup.innerHTML = originalBtnHTML;
            }
        } else {
            authMessage.style.color = 'var(--error-color)';
            authMessage.innerText = data.message;
            btnGroup.innerHTML = originalBtnHTML;
        }
    } catch (error) {
        console.error("Error API", error);
        authMessage.style.color = 'var(--error-color)';
        authMessage.innerText = "Terjadi kesalahan koneksi ke server.";
        btnGroup.innerHTML = originalBtnHTML;
    }
}

// --- FUNGSI MENARIK RIWAYAT CHAT ---
async function loadChatHistory() {
    try {
        const token = localStorage.getItem('chatToken');
        
        const res = await fetch(BACKEND_URL + '/api/messages', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });
        
        const historyData = await res.json();
        
        const messages = document.getElementById('messages');
        messages.innerHTML = ''; 
        
        if (Array.isArray(historyData)) {
            historyData.forEach(data => {
                const li = document.createElement('li');
                const isMyMessage = data.username === currentUser;
                li.classList.add(isMyMessage ? 'my-message' : 'other-message');
                
                const dateObj = new Date(data.createdAt || Date.now());
                const timeString = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                const nameStyle = isMyMessage ? '' : `style="color: ${getUsernameColor(data.username)};"`;

                let imageHTML = '';
                if (data.imageUrl) {
                    imageHTML = `<br><img src="${data.imageUrl}" onclick="openImageModal(this.src)" style="max-width: 250px; border-radius: 8px; margin-top: 8px; border: 1px solid #e5e7eb; cursor: pointer;" title="Klik untuk memperbesar">`;
                }

                // Setup Avatar
                const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E";
                let finalAvatarUrl = defaultAvatar;
                
                if (data.profilePic) {
                    finalAvatarUrl = data.profilePic.startsWith('http') ? data.profilePic : BACKEND_URL + data.profilePic;
                }
                // Paksa pakai avatar dari localStorage jika ini pesan kita agar perubahannya instan
                if (isMyMessage && localStorage.getItem("chatProfilePic")) {
                    finalAvatarUrl = localStorage.getItem("chatProfilePic");
                }

                // 3. FITUR TATA LETAK WHATSAPP
                li.innerHTML = `
                    <img src="${finalAvatarUrl}" class="chat-avatar avatar-user-${data.username}" alt="Avatar">
                    <div class="message-bubble">
                        <strong ${nameStyle}>${data.username}</strong> 
                        <span class="message-text"></span>
                        ${imageHTML}
                        <span class="time-stamp">${timeString}</span>
                    </div>
                `;
                
                li.querySelector('.message-text').textContent = data.text;
                messages.appendChild(li);
            });
            
            messages.scrollTop = messages.scrollHeight;
        } else {
            console.error("Data riwayat tidak valid:", historyData);
        }
    } catch (error) {
        console.error("Gagal memuat riwayat obrolan", error);
    }
}

async function uploadImage() {
    const fileInput = document.getElementById('imageInput');
    const file = fileInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
        const res = await fetch(BACKEND_URL + '/api/messages/upload', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        
        if (data.imageUrl) {
            // Minta socket mengirimkan gambar dan foto profil ke obrolan global
            socket.emit('send_message', { 
                text: '', 
                username: currentUser,
                imageUrl: BACKEND_URL + data.imageUrl,
                profilePic: localStorage.getItem("chatProfilePic")
            });
        }
    } catch (err) {
        console.error("Gagal mengunggah gambar", err);
    } finally {
        fileInput.value = ''; 
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

function clearSession() {
    localStorage.removeItem('chatToken');
    localStorage.removeItem('chatUser');
    localStorage.removeItem('chatProfilePic'); 
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

        let imageHTML = '';
        if (data.imageUrl) {
            imageHTML = `<br><img src="${data.imageUrl}" onclick="openImageModal(this.src)" style="max-width: 250px; border-radius: 8px; margin-top: 8px; border: 1px solid #e5e7eb; cursor: pointer;" title="Klik untuk memperbesar">`;
        }

        // Setup Avatar untuk pesan yang baru masuk
        const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E";
        let finalAvatarUrl = defaultAvatar;
        
        if (data.profilePic) {
            finalAvatarUrl = data.profilePic.startsWith('http') ? data.profilePic : BACKEND_URL + data.profilePic;
        }
        if (isMyMessage && localStorage.getItem("chatProfilePic")) {
            finalAvatarUrl = localStorage.getItem("chatProfilePic");
        }

        // 3. FITUR TATA LETAK WHATSAPP
        li.innerHTML = `
            <img src="${finalAvatarUrl}" class="chat-avatar avatar-user-${data.username}" alt="Avatar">
            <div class="message-bubble">
                <strong ${nameStyle}>${data.username}</strong> 
                <span class="message-text"></span>
                ${imageHTML}
                <span class="time-stamp">${timeString}</span>
            </div>
        `;
        
        li.querySelector('.message-text').textContent = data.text || '';
        
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
        socket.emit('send_message', { 
            text: input.value,
            username: currentUser,
            profilePic: localStorage.getItem("chatProfilePic") 
        });
        input.value = '';
    }
}

async function loadUserCount() {
    try {
        const res = await fetch(BACKEND_URL + '/api/users/count');
        const data = await res.json();
        
        if (data.success) {
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

// --- FUNGSI ZOOM GAMBAR ---
function openImageModal(imgSrc) {
    const modal = document.getElementById('imageModal');
    const expandedImg = document.getElementById('expandedImg');
    expandedImg.src = imgSrc;
    modal.style.display = 'flex'; 
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    modal.style.display = 'none';
}

async function forceDownload(event) {
    event.preventDefault();  
    event.stopPropagation(); 
    
    const imgSrc = document.getElementById('expandedImg').src;
    if (!imgSrc) return;

    try {
        const response = await fetch(imgSrc);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        
        const filename = imgSrc.split('/').pop() || 'gambar_obrolan.jpg';
        a.download = filename;
        
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
    } catch (error) {
        console.error("Gagal mengunduh gambar", error);
        alert("Terjadi kesalahan saat mengunduh gambar.");
    }
}

// --- FITUR DRAG AND DROP GAMBAR ---
document.addEventListener("DOMContentLoaded", () => {
    const chatPanel = document.getElementById('chatPanel');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        chatPanel.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        chatPanel.addEventListener(eventName, () => {
            chatPanel.classList.add('drag-active');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        chatPanel.addEventListener(eventName, () => {
            chatPanel.classList.remove('drag-active');
        }, false);
    });

    chatPanel.addEventListener('drop', handleDrop, false);

    async function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files && files.length > 0) {
            const file = files[0];
            
            if (!file.type.startsWith('image/')) {
                alert('Tolong seret dan lepas file gambar saja (JPG/PNG/GIF).');
                return;
            }

            const formData = new FormData();
            formData.append('image', file);

            try {
                const res = await fetch(BACKEND_URL + '/api/messages/upload', {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                
                if (data.imageUrl) {
                    socket.emit('send_message', { 
                        text: '', 
                        username: currentUser,
                        imageUrl: BACKEND_URL + data.imageUrl,
                        profilePic: localStorage.getItem("chatProfilePic")
                    });
                }
            } catch (err) {
                console.error("Gagal mengunggah gambar dari drag & drop", err);
                alert("Gagal mengirim gambar. Periksa koneksi ke server.");
            }
        }
    }
});

// ==========================================
// LOGIKA MODAL PROFIL
// ==========================================
function bukaModalProfil() {
    document.getElementById("modal-profil").style.display = "flex";
    if (typeof currentUser !== 'undefined' && currentUser.username) {
        document.getElementById("input-new-username").value = currentUser.username;
    }
}

function tutupModalProfil() {
    document.getElementById("modal-profil").style.display = "none";
}

async function simpanProfilBaru() {
    const tombolSimpan = document.querySelector(".btn-save");
    tombolSimpan.innerText = "Menyimpan...";
    tombolSimpan.disabled = true;

    const currentUsername = localStorage.getItem("chatUser"); 
    
    if (!currentUsername) {
        alert("Sesi tidak valid, silakan login ulang.");
        return;
    }

    const inputNama = document.getElementById("input-new-username").value;
    const inputFoto = document.getElementById("input-new-photo").files[0];

    const formData = new FormData();
    formData.append("currentUsername", currentUsername);
    formData.append("newUsername", inputNama);
    if (inputFoto) {
        formData.append("profilePic", inputFoto);
    }

    try {
        // Karena API dan Frontend ada di domain yang sama (berdasarkan setup Anda sebelumnya)
        const respons = await fetch('/api/update-profile', {
            method: 'POST',
            body: formData
        });
        
        const hasil = await respons.json();
        if (hasil.success) {
            if (inputNama) {
                localStorage.setItem("chatUser", inputNama);
                const greeting = document.getElementById("userGreeting");
                if (greeting) greeting.innerText = "Halo, " + inputNama; 
            }
            
            if (hasil.user.profilePic) {
                const fullImageUrl = BACKEND_URL + hasil.user.profilePic;
                localStorage.setItem("chatProfilePic", fullImageUrl);
                
                const kotakAvatar = document.querySelector(".profile-avatar");
                if (kotakAvatar) {
                    kotakAvatar.innerHTML = `<img src="${fullImageUrl}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
                }
            }
            
            alert("Profil berhasil diperbarui!");
            tutupModalProfil();
        } else {
            alert("Gagal: " + hasil.message);
        }
    } catch (error) {
        console.error("Gagal menyimpan profil:", error);
        alert("Terjadi kesalahan pada jaringan.");
    } finally {
        tombolSimpan.innerText = "Simpan Perubahan";
        tombolSimpan.disabled = false;
    }
}

// ==========================================
// PENDENGAR PERUBAHAN REAL-TIME (SOCKET)
// ==========================================
// TYPO ssocket TELAH DIPERBAIKI MENJADI socket
socket.on("user_profile_updated", (dataBaru) => {
    const fullImageUrl = BACKEND_URL + dataBaru.profilePic;

    // Targetkan menggunakan class berdasarkan username
    const semuaAvatar = document.querySelectorAll(`.avatar-user-${dataBaru.username}`);
    semuaAvatar.forEach(img => {
        img.src = fullImageUrl; 
    });

    const semuaNama = document.querySelectorAll(`.nama-user-${dataBaru.username}`);
    semuaNama.forEach(span => {
        span.innerText = dataBaru.username;
    });

    const namaSayaSaatIni = localStorage.getItem("chatUser");
    if (dataBaru.username === namaSayaSaatIni) {
        localStorage.setItem("chatProfilePic", fullImageUrl);

        const kotakAvatar = document.querySelector(".profile-avatar");
        if (kotakAvatar) {
            kotakAvatar.innerHTML = `<img src="${fullImageUrl}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
        }
        
        const greeting = document.getElementById("userGreeting");
        if (greeting) greeting.innerText = "Halo, " + dataBaru.username;
    }
});