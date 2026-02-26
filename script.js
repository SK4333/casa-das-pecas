
// script.js — gerencia menu, produtos, carrinho, busca e WhatsApp
document.getElementById('year').textContent = new Date().getFullYear();

// Menu toggle (mobile)
const menuBtn = document.getElementById('menuBtn');
const nav = document.getElementById('nav');
if (menuBtn && nav) {
  menuBtn.addEventListener('click', ()=> nav.classList.toggle('open'));
}

// WhatsApp button (uses shop number)
const waNumber = '553498017451'; // country + area + number (Brazil)
const waBtn = document.getElementById('waBtn');
function waLink(text) {
  return 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(text);
}
if (waBtn) {
  waBtn.href = waLink('Olá, tenho interesse nas peças.'); 
}

// Cart (localStorage)
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
updateCartUI();

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartUI();
}

function addToCart(item) {
  cart.push(item);
  saveCart();
}

function removeFromCart(index) {
  cart.splice(index,1);
  saveCart();
}

function clearCart() {
  cart = [];
  saveCart();
}

function updateCartUI() {
  const countEls = document.querySelectorAll('#cartCount');
  countEls.forEach(el => el.textContent = cart.length);
  // update page-specific UI
  const cartList = document.getElementById('cartList');
  const cartTotal = document.getElementById('cartTotal');
  if (cartList) {
    cartList.innerHTML = '';
    cart.forEach((it,idx)=>{
      const row = document.createElement('div');
      row.className = 'cart-row';
      row.innerHTML = `<div>${it.name} — R$ ${it.price.toFixed(2)}</div>
        <div><button class="small" data-idx="${idx}">Remover</button></div>`;
      cartList.appendChild(row);
    });
    cartList.querySelectorAll('button.small').forEach(btn=>{
      btn.addEventListener('click', (e)=>{ removeFromCart(parseInt(e.target.dataset.idx)); });
    });
  }
  if (cartTotal) {
    const total = cart.reduce((s,i)=>s+i.price,0);
    cartTotal.textContent = 'Total: R$ ' + total.toFixed(2);
  }
}

// Checkout via WhatsApp (generates message with items)
const checkoutBtn = document.getElementById('checkoutBtn');
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', ()=>{
    if (cart.length === 0) { alert('Carrinho vazio'); return; }
    let msg = 'Olá, gostaria de comprar:%0A';
    cart.forEach((it,i)=> msg += `${i+1}. ${it.name} — R$ ${it.price.toFixed(2)}%0A`);
    const total = cart.reduce((s,i)=>s+i.price,0);
    msg += `%0ATotal: R$ ${total.toFixed(2)}`;
    window.open(waLink(msg), '_blank');
  });
}

// Clear cart button
const clearBtn = document.getElementById('clearCart');
if (clearBtn) {
  clearBtn.addEventListener('click', ()=> { if(confirm('Limpar carrinho?')) { clearCart(); } });
}

// Load products and render (for index and catalog pages)
async function loadProducts() {
  try {
    const resp = await fetch('produtos.json');
    const data = await resp.json();
    return data;
  } catch(e) {
    console.error('Erro ao carregar produtos', e);
    return [];
  }
}

async function renderFeatured() {
  const el = document.getElementById('featured');
  if (!el) return;
  const products = await loadProducts();
  el.innerHTML = '';
  products.slice(0,4).forEach(p=>{
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `<img src="${p.img}" alt="${p.name}" /><h3>${p.name}</h3><div class="price">R$ ${p.price.toFixed(2)}</div>
      <div class="card-actions"><button class="addBtn" data-id="${p.id}">Adicionar</button></div>`;
    el.appendChild(card);
  });
  attachAddButtons();
}

async function renderCatalog() {
  const el = document.getElementById('products');
  if (!el) return;
  const products = await loadProducts();
  el.innerHTML = '';
  products.forEach(p=>{
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `<img src="${p.img}" alt="${p.name}" /><h3>${p.name}</h3><div class="price">R$ ${p.price.toFixed(2)}</div>
      <div class="card-actions"><button class="addBtn" data-id="${p.id}">Adicionar</button></div>`;
    el.appendChild(card);
  });
  attachAddButtons();
}

// attach event listeners to add buttons
function attachAddButtons() {
  document.querySelectorAll('.addBtn').forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      const id = parseInt(btn.dataset.id,10);
      const products = await loadProducts();
      const prod = products.find(p=>p.id===id);
      if (prod) {
        addToCart({id:prod.id,name:prod.name,price:prod.price});
        alert(prod.name + ' adicionado ao carrinho');
      }
    });
  });
}

// Search and sort (on catalog page)
const searchInput = document.getElementById('search');
const sortSel = document.getElementById('sort');
if (searchInput || sortSel) {
  const perform = async ()=>{
    const q = searchInput.value.toLowerCase();
    let data = await loadProducts();
    if (q) data = data.filter(p=> p.name.toLowerCase().includes(q));
    const sort = sortSel.value;
    if (sort === 'price-asc') data.sort((a,b)=> a.price-b.price);
    if (sort === 'price-desc') data.sort((a,b)=> b.price-a.price);
    const el = document.getElementById('products'); el.innerHTML = '';
    data.forEach(p=>{
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `<img src="${p.img}" alt="${p.name}" /><h3>${p.name}</h3><div class="price">R$ ${p.price.toFixed(2)}</div>
        <div class="card-actions"><button class="addBtn" data-id="${p.id}">Adicionar</button></div>`;
      el.appendChild(card);
    });
    attachAddButtons();
  };
  searchInput.addEventListener('input', perform);
  sortSel.addEventListener('change', perform);
  // initial render
  perform();
}

// initial renders
renderFeatured();
renderCatalog();
updateCartUI();
