import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCacVmtIT1Y0NGHy43VJQf8CZ8x47Ju5M4",
  authDomain: "luxoto-19d55.firebaseapp.com",
  projectId: "luxoto-19d55",
  storageBucket: "luxoto-19d55.firebasestorage.app",
  messagingSenderId: "671208774332",
  appId: "1:671208774332:web:37f9938c52cd0db5f9ceb9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// ELEMENTLER
const mainAds = document.getElementById('main-ads');
const sideAds = document.getElementById('side-ads');

// MODAL AÇ/KAPA (Global window nesnesine ekliyoruz çünkü modül kullanıyoruz)
window.openModal = (id) => document.getElementById(id).style.display = 'flex';
window.closeModal = (id) => document.getElementById(id).style.display = 'none';

function showStatus(text) {
    const box = document.getElementById('status-box');
    document.getElementById('status-text').innerText = text;
    box.style.display = 'flex';
    setTimeout(() => box.style.display = 'none', 2500);
}

// GOOGLE İLE GİRİŞ
document.getElementById('googleLoginBtn').onclick = async () => {
    try {
        await signInWithPopup(auth, provider);
        closeModal('login-modal');
        showStatus("Google ile giriş başarılı!");
    } catch (error) {
        console.error(error);
        alert("Giriş başarısız!");
    }
};

// OTURUM DURUMU KONTROLÜ
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('user-section').style.display = 'flex';
    } else {
        document.getElementById('auth-section').style.display = 'flex';
        document.getElementById('user-section').style.display = 'none';
    }
});

// İLAN YAYINLA (Firebase Firestore'a Kaydetme)
document.getElementById('postAdBtn').onclick = async () => {
    const brand = document.getElementById('car-brand').value;
    const model = document.getElementById('car-model').value;
    const file = document.getElementById('car-img').files[0];

    if(!brand || !file) return alert("Eksik bilgi!");

    const reader = new FileReader();
    reader.onload = async (e) => {
        const adData = {
            brand,
            model,
            year: document.getElementById('car-year').value,
            km: document.getElementById('car-km').value,
            img: e.target.result,
            phone: auth.currentUser.email, // Şimdilik maili alıyoruz
            createdAt: Date.now()
        };
        await addDoc(collection(db, "ads"), adData);
        showStatus("İlan başarıyla yüklendi!");
        closeModal('add-ad-modal');
        fetchAds();
    };
    reader.readAsDataURL(file);
};

// İLANLARI ÇEK
async function fetchAds() {
    mainAds.innerHTML = '';
    const q = query(collection(db, "ads"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        const ad = doc.data();
        const card = `
            <div class="ilan-card" onclick="showAdDetail('${ad.brand} ${ad.model}', '${ad.img}', '${ad.year}', '${ad.km}')">
                <img src="${ad.img}">
                <div style="padding:10px;">
                    <h4 style="color:var(--sari);">${ad.brand} ${ad.model}</h4>
                    <p>${ad.year} | ${ad.km} KM</p>
                </div>
            </div>
        `;
        mainAds.innerHTML += card;
    });
}

window.showAdDetail = (title, img, year, km) => {
    document.getElementById('det-title').innerText = title;
    document.getElementById('det-img').src = img;
    document.getElementById('det-specs').innerHTML = `<div><b>Yıl:</b> ${year}</div><div><b>KM:</b> ${km}</div>`;
    openModal('detail-modal');
};

fetchAds();
