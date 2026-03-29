// VERİ DEPOLAMA (LocalStorage ile kalıcılık sağlanıyor)
let ads = JSON.parse(localStorage.getItem('luxOTO_ads')) || [];
let users = JSON.parse(localStorage.getItem('luxOTO_users')) || [];
let currentUser = JSON.parse(localStorage.getItem('luxOTO_session')) || null;

window.onload = () => {
    if(currentUser) updateUI(true);
    renderAds(ads);
    updateBrandSidebar();
};

// MODAL KONTROLLERİ
function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

// BAŞARI BİLDİRİMİ
function showStatus(text, success = true) {
    const box = document.getElementById('status-box');
    const icon = document.getElementById('status-icon');
    document.getElementById('status-text').innerText = text;
    icon.className = success ? "fas fa-check-circle" : "fas fa-times-circle";
    icon.style.color = success ? "#2ecc71" : "#e74c3c";
    box.style.display = 'flex';
    setTimeout(() => { box.style.display = 'none'; }, 2500);
}

// KAYIT VE GİRİŞ
function signup() {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const phone = document.getElementById('reg-phone').value;
    const pass = document.getElementById('reg-pass').value;

    if(!name || !email || !pass) return alert("Eksik alan bırakmayın!");

    const user = { name, email, phone, pass, pic: 'https://via.placeholder.com/120/333/FFD700?text=Profil' };
    users.push(user);
    localStorage.setItem('luxOTO_users', JSON.stringify(users));
    showStatus("Kayıt Başarılı!");
    closeModal('signup-modal');
}

function login() {
    const mail = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    const user = users.find(u => u.email === mail && u.pass === pass);

    if(user) {
        currentUser = user;
        localStorage.setItem('luxOTO_session', JSON.stringify(user));
        updateUI(true);
        closeModal('login-modal');
        showStatus("Giriş Başarılı!");
    } else {
        alert("Hatalı e-posta veya şifre!");
    }
}

function updateUI(isLogin) {
    document.getElementById('auth-section').style.display = isLogin ? 'none' : 'flex';
    document.getElementById('user-section').style.display = isLogin ? 'flex' : 'none';
    if(isLogin) {
        document.getElementById('prof-name').value = currentUser.name;
        document.getElementById('prof-mail').value = currentUser.email;
        document.getElementById('prof-img-display').src = currentUser.pic;
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('luxOTO_session');
    location.reload();
}

// İLAN VERME (Dosya okuma dahil)
function checkAuthForAd() {
    if(!currentUser) {
        alert("Önce Giriş Yapmalısın!");
        openModal('login-modal');
    } else {
        openModal('add-ad-modal');
    }
}

function postAd() {
    const file = document.getElementById('car-img').files[0];
    if(!file) return alert("Fotoğraf seçmelisiniz!");

    const reader = new FileReader();
    reader.onload = function(e) {
        const newAd = {
            id: Date.now(),
            brand: document.getElementById('car-brand').value,
            model: document.getElementById('car-model').value,
            year: document.getElementById('car-year').value,
            km: document.getElementById('car-km').value,
            status: document.getElementById('car-status').value,
            damage: document.getElementById('car-damage').value,
            hp: document.getElementById('car-hp').value,
            img: e.target.result,
            sellerPhone: currentUser.phone
        };
        ads.unshift(newAd);
        localStorage.setItem('luxOTO_ads', JSON.stringify(ads));
        renderAds(ads);
        updateBrandSidebar();
        closeModal('add-ad-modal');
        showStatus("İlanınız Yayınlandı!");
    };
    reader.readAsDataURL(file);
}

// GÖRÜNTÜLEME VE ARAMA
function renderAds(data) {
    const main = document.getElementById('main-ads');
    const side = document.getElementById('side-ads');
    main.innerHTML = ''; side.innerHTML = '';

    data.forEach(ad => {
        const cardHtml = `
            <div class="ilan-card" onclick="showDetail(${ad.id})">
                <img src="${ad.img}">
                <div class="ilan-info">
                    <h4>${ad.brand} ${ad.model}</h4>
                    <p>${ad.year} | ${ad.km} KM</p>
                </div>
            </div>
        `;
        main.innerHTML += cardHtml;
        side.innerHTML += cardHtml;
    });
}

function searchAds() {
    const val = document.getElementById('searchInput').value.toLowerCase();
    const filtered = ads.filter(a => a.brand.toLowerCase().includes(val) || a.model.toLowerCase().includes(val));
    renderAds(filtered);
}

function filterByBrand(brandName) {
    if(brandName === 'All') renderAds(ads);
    else renderAds(ads.filter(a => a.brand === brandName));
}

function updateBrandSidebar() {
    const list = document.getElementById('brand-filters');
    const brands = [...new Set(ads.map(a => a.brand))];
    list.innerHTML = `<li onclick="filterByBrand('All')">Tüm İlanlar</li>`;
    brands.forEach(b => {
        list.innerHTML += `<li onclick="filterByBrand('${b}')">${b}</li>`;
    });
}

function showDetail(id) {
    const ad = ads.find(a => a.id === id);
    document.getElementById('det-title').innerText = ad.brand + " " + ad.model;
    document.getElementById('det-img').src = ad.img;
    document.getElementById('det-specs').innerHTML = `
        <div class="spec-item"><b>Yıl:</b> ${ad.year}</div>
        <div class="spec-item"><b>KM:</b> ${ad.km}</div>
        <div class="spec-item"><b>Durum:</b> ${ad.status}</div>
        <div class="spec-item"><b>Güç:</b> ${ad.hp} HP</div>
        <div class="spec-item"><b>Hasar:</b> ${ad.damage}</div>
    `;
    document.getElementById('det-wa').href = `https://wa.me/90${ad.sellerPhone}`;
    openModal('detail-modal');
}

function changeProfilePic(e) {
    const reader = new FileReader();
    reader.onload = (event) => {
        currentUser.pic = event.target.result;
        document.getElementById('prof-img-display').src = event.target.result;
        localStorage.setItem('luxOTO_session', JSON.stringify(currentUser));
    };
    reader.readAsDataURL(e.target.files[0]);
}