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

// MODALLARI PENCEREYE TANITMA
window.openModal = (id) => document.getElementById(id).style.display = 'flex';
window.closeModal = (id) => document.getElementById(id).style.display = 'none';

// OTURUM DURUMU
onAuthStateChanged(auth, (user) => {
    document.getElementById('auth-section').style.display = user ? 'none' : 'block';
    document.getElementById('user-section').style.display = user ? 'block' : 'none';
});

// GOOGLE GİRİŞ
document.getElementById('googleLoginBtn').onclick = () => {
    signInWithPopup(auth, provider).then(() => closeModal('login-modal'));
};

// ÇIKIŞ
document.getElementById('logoutBtn').onclick = () => signOut(auth);

// İLANLARI GETİR
async function loadAds() {
    const grid = document.getElementById('main-ads');
    grid.innerHTML = "Yükleniyor...";
    const q = query(collection(db, "ads"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    grid.innerHTML = "";
    snap.forEach(doc => {
        const ad = doc.data();
        grid.innerHTML += `
            <div class="ilan-card">
                <img src="${ad.img}">
                <div class="ilan-card-info">
                    <h4 style="color:var(--sari)">${ad.brand} ${ad.model}</h4>
                    <p>${ad.year} | ${ad.km} KM</p>
                </div>
            </div>`;
    });
}

// İLAN VER
document.getElementById('postAdBtn').onclick = async () => {
    const brand = document.getElementById('car-brand').value;
    const file = document.getElementById('car-img').files[0];
    if(!brand || !file) return alert("Eksik Bilgi!");

    const reader = new FileReader();
    reader.onload = async (e) => {
        await addDoc(collection(db, "ads"), {
            brand, model: document.getElementById('car-model').value,
            year: document.getElementById('car-year').value,
            km: document.getElementById('car-km').value,
            img: e.target.result,
            createdAt: Date.now()
        });
        closeModal('add-ad-modal');
        loadAds();
    };
    reader.readAsDataURL(file);
};

loadAds();
