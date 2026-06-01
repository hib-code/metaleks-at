/* =========================
   GLOBAL STATE
========================= */

let state = {
    basePrice: 490,
    qty: 1,
    selectedSize: "30x40",
    finish: "glossy",
    imageUrl: null,
    isPlaying: true
};

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let discount = 0;

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    renderCart();
    updateTotal();
});

/* =========================
   ROTATION SYSTEM
========================= */

let manualAngle = null;

const wrapper = document.getElementById("panelWrapper");
const rotLabel = document.getElementById("rotLabel");

document.getElementById("btnRotLeft")?.addEventListener("click", () => {
    if (manualAngle === null) manualAngle = -25;
    manualAngle -= 30;
    applyRotation();
});

document.getElementById("btnRotRight")?.addEventListener("click", () => {
    if (manualAngle === null) manualAngle = -25;
    manualAngle += 30;
    applyRotation();
});

function applyRotation(){
    wrapper.style.animation = "none";
    wrapper.style.transform = `rotateY(${manualAngle}deg) rotateX(3deg)`;
    state.isPlaying = false;
    document.getElementById("btnPlayPause").textContent = "▶";
    rotLabel.textContent =
        `${Math.round(((manualAngle % 360) + 360) % 360)}°`;
}

/* PLAY/PAUSE */
document.getElementById("btnPlayPause")?.addEventListener("click", () => {
    state.isPlaying = !state.isPlaying;

    if(state.isPlaying){
        manualAngle = null;
        wrapper.style.animation = "autoRotate 12s ease-in-out infinite";
        document.getElementById("btnPlayPause").textContent = "⏸";
        rotLabel.textContent = "Auto-rotation";
    } else {
        wrapper.style.animation = "none";
        document.getElementById("btnPlayPause").textContent = "▶";
    }
});

/* =========================
   DRAG ROTATION
========================= */

let isDragging = false;
let startX = 0;
let startAngle = 0;

wrapper?.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX;
    startAngle = manualAngle ?? -25;
    wrapper.style.animation = "none";
});

window.addEventListener("mousemove", (e) => {
    if(!isDragging) return;

    const delta = (e.clientX - startX) * 0.5;
    manualAngle = startAngle + delta;

    wrapper.style.transform =
        `rotateY(${manualAngle}deg) rotateX(3deg)`;

    rotLabel.textContent =
        `${Math.round(((manualAngle % 360) + 360) % 360)}°`;
});

window.addEventListener("mouseup", () => {
    isDragging = false;
});

/* =========================
   IMAGE UPLOAD
========================= */

function handleImageUpload(input){
    if(!input.files?.[0]) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
        state.imageUrl = e.target.result;

        const canvas = document.getElementById("panelCanvas");
        const placeholder = document.getElementById("panelPlaceholder");

        placeholder.style.display = "none";
        canvas.style.backgroundImage = `url(${state.imageUrl})`;
        canvas.style.backgroundSize = "cover";

        document.getElementById("uploadName").textContent =
            "✓ " + file.name;

        showToast("Photo chargée !");
    };

    reader.readAsDataURL(file);
}

/* =========================
   CONFIG
========================= */

function selectSize(el){
    document.querySelectorAll(".size-option")
        .forEach(o => o.classList.remove("active"));

    el.classList.add("active");

    state.basePrice = parseInt(el.dataset.price);
    state.selectedSize = el.dataset.size;

    updatePrice();
}

function selectFinish(el){
    document.querySelectorAll(".finish-option")
        .forEach(o => o.classList.remove("active"));

    el.classList.add("active");
    state.finish = el.dataset.finish;
}

function changeQtyItem(id, delta){

    let item = cart.find(i => i.id == id);
    if(!item) return;

    item.qty += delta;

    if(item.qty < 1) item.qty = 1;

    item.total = item.qty * item.price;

    saveCart();
}
function updatePrice(){
    state.qty = parseInt(document.getElementById("qtyVal").value) || 1;

    document.getElementById("priceNum").textContent =
        (state.basePrice * state.qty).toLocaleString("fr-MA");
}

/* =========================
   CART CORE (FIXED 100%)
========================= */

function addItemToCart(item){

    item.id = Date.now();
    item.qty = item.qty || 1;
    item.price = item.price || 0;
    item.total = item.price * item.qty;

    cart.push(item);
    saveCart();

    showToast("Ajouté au panier ✅");
}

/* FROM GALLERY */
function addGalleryItem(name, size, price = 490){

    addItemToCart({
        name,
        size,
        qty: 1,
        price: price
    });
}
/* FROM CONFIGURATOR */
function addToCart(){

    if(!state.imageUrl){
        showToast("Upload image d'abord !");
        return;
    }

    addItemToCart({
        name: "Tableau personnalisé",
        size: state.selectedSize,
        qty: state.qty,
        price: state.basePrice,
        image: state.imageUrl
    });
}

/* =========================
   REMOVE + QTY FIX
========================= */

function removeItem(id){
    cart = cart.filter(i => i.id !== id);
    saveCart();
}

function changeQtyItem(id, delta){

    let item = cart.find(i => i.id == id);
    if(!item) return;

    item.qty += delta;

    if(item.qty < 1) item.qty = 1;

    item.total = item.price * item.qty;

    saveCart();   
}
/* ======================
   SAVE + UPDATE GLOBAL
====================== */
function saveCart(){
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
    updateCartCount();
    updateTotal();
}

/* ======================
   COUNT
====================== */
function updateCartCount(){
    document.getElementById("cartCount").innerText = cart.length;
}

/* ======================
   ADD PRODUCT (IMPORTANT FIX)
====================== */
function addItemToCart(item){

    item.id = Date.now();

    item.qty = item.qty || 1;
    item.price = item.price || 0;

    item.total = item.qty * item.price;

    cart.push(item);

    saveCart();
    showToast("Produit ajouté ✔");
}

/* FROM GALLERY */
function addGalleryItem(name, size){
    addItemToCart({
        name,
        size,
        qty: 1,
        price: 490
    });
}

/* FROM CONFIGURATOR */
function addToCart(){

    if(!state.imageUrl){
        showToast("Upload image d'abord !");
        return;
    }

    addItemToCart({
        name: "Tableau personnalisé",
        size: state.selectedSize,
        qty: state.qty,
        price: state.basePrice
    });
}

/* ======================
   DELETE PRODUCT (FIXED)
====================== */
function removeItem(id){
    cart = cart.filter(i => i.id !== id);
    saveCart();
}

/* ======================
   CHANGE QTY (FIXED)
====================== */
function changeQty(id, delta){

    let item = cart.find(i => i.id === id);
    if(!item) return;

    item.qty += delta;

    if(item.qty < 1) item.qty = 1;

    item.total = item.qty * item.price;

    saveCart();
}

/* ======================
   RENDER CART (FIXED)
====================== */
function renderCart(){

    const container = document.getElementById("cartItems");

    if(cart.length === 0){
        container.innerHTML = "<p>Panier vide</p>";
        return;
    }

    container.innerHTML = "";

    cart.forEach(item => {

        container.innerHTML += `
        <div style="padding:10px;border-bottom:1px solid #444">

            <b>${item.name}</b><br>
            ${item.size}<br>

            <div style="display:flex;gap:10px;align-items:center;margin-top:5px;">

                <button onclick="changeQty(${item.id},-1)">−</button>
                <span>${item.qty}</span>
                <button onclick="changeQty(${item.id},1)">+</button>

                <span style="margin-left:auto;">
                    ${item.total} MAD
                </span>

                <button onclick="removeItem(${item.id})"
                        style="background:red;color:white;border:none;padding:4px;">
                    ✕
                </button>

            </div>
        </div>`;
    });
}

/* ======================
   TOTAL (FIXED)
====================== */
function updateTotal(){

    let total = 0;

    cart.forEach(i => {
        total += i.total;
    });

    let final = discount > 0
        ? total - (total * discount / 100)
        : total;

    document.getElementById("cartTotal").innerText =
        Math.round(final) + " MAD";

    document.getElementById("discountLine").innerText =
        discount ? `Discount: -${discount}%` : "";
}

/* ======================
   PROMO
====================== */
function applyPromo(){

    let code = document.getElementById("promoInput").value.trim();

    if(code === "METAL10") discount = 10;
    else if(code === "VIP20") discount = 20;
    else discount = 0;

    updateTotal();
}

/* ======================
   OPEN / CLOSE
====================== */
function openCart(){
    document.getElementById("cartModal").style.display = "flex";
    renderCart();
    updateTotal();
}

function closeCart(){
    document.getElementById("cartModal").style.display = "none";
}

/* ======================
   WHATSAPP
====================== */
function sendWhatsAppOrder(){

    if(cart.length === 0){
        alert("Panier vide");
        return;
    }

    let msg = "🛒 COMMANDE\n\n";

    cart.forEach((i,k)=>{
        msg += `${k+1}. ${i.name}\n`;
        msg += `${i.size}\n`;
        msg += `Qty: ${i.qty}\n`;
        msg += `Total: ${i.total} MAD\n\n`;
    });

    let total = cart.reduce((s,i)=>s+i.total,0);
    let final = discount ? total - (total*discount/100) : total;

    msg += "TOTAL: " + Math.round(final) + " MAD";

    window.open(
        "https://wa.me/212781801862?text=" + encodeURIComponent(msg),
        "_blank"
    );
}