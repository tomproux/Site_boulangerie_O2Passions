const API = '/api';
const currency = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
const state = { products: [], categories: [], cart: JSON.parse(localStorage.getItem('o2-cart') || '[]'), user: null };

async function api(path, options = {}) {
  const token = localStorage.getItem('o2-token');
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error?.message || 'Une erreur est survenue.');
  return payload.data;
}

function saveCart() {
  localStorage.setItem('o2-cart', JSON.stringify(state.cart));
  document.querySelectorAll('[data-cart-count]').forEach((node) => { node.textContent = state.cart.reduce((sum, item) => sum + item.quantity, 0); });
}

function layout(content) {
  document.querySelector('#app').innerHTML = `
    <header class="site-header">
      <a class="brand" href="O2Passions.html"><span class="brand-mark">Ô2</span><span><strong>Passions</strong><small>maison boulangère</small></span></a>
      <nav><a href="O2Passions.html">Accueil</a><a href="catalogue.html">La boutique</a><a href="O2Passions.html#horaires">Horaires</a><a href="O2Passions.html#contact">Contact</a></nav>
      <div class="header-actions"><a class="icon-link" href="compte.html" aria-label="Mon compte">◯</a><a class="cart-link" href="panier.html">Panier <b data-cart-count>0</b></a></div>
    </header>
    <main>${content}</main>
    <footer class="site-footer"><div><span class="brand-mark">Ô2</span><p>Des gestes simples, des produits sincères, et le goût du fait maison.</p></div><div><strong>Nous trouver</strong><p>14 rue des trois marchands<br>02 43 98 81 40</p></div><div><strong>Horaires</strong><p>Mardi à vendredi · 7h–19h<br>Samedi · 7h–13h30</p></div></footer>`;
  saveCart();
}

function productCard(product) {
  return `<article class="product-card"><a href="produit.html?slug=${encodeURIComponent(product.slug)}"><div class="product-image"><img src="${product.image_url || 'Images/logo.png'}" alt="${product.name}" loading="lazy"><span>${product.category_name}</span></div><div class="product-info"><h3>${product.name}</h3><p>${product.description || ''}</p><strong>${currency.format(product.price)}</strong></div></a><button class="button button-small" data-add="${product.id}">Ajouter</button></article>`;
}

function bindProducts() {
  document.querySelectorAll('[data-add]').forEach((button) => button.addEventListener('click', () => {
    const product = state.products.find((item) => item.id === button.dataset.add);
    const existing = state.cart.find((item) => item.productId === product.id);
    if (existing) existing.quantity += 1; else state.cart.push({ productId: product.id, name: product.name, price: product.price, quantity: 1, image_url: product.image_url });
    saveCart(); button.textContent = 'Ajouté'; setTimeout(() => { button.textContent = 'Ajouter'; }, 1000);
  }));
}

async function renderHome() {
  state.categories = await api('/categories'); state.products = await api('/products');
  layout(`<section class="hero"><div><p class="eyebrow">Boulangerie · pâtisserie · depuis toujours</p><h1>Le goût des choses<br><em>bien faites.</em></h1><p class="hero-copy">Chaque matin, nos pains, viennoiseries et pâtisseries prennent vie dans notre fournil.</p><a class="button" href="catalogue.html">Découvrir la boutique <span>→</span></a></div><div class="hero-stamp"><strong>100%</strong><span>fait maison</span></div></section>
    <section class="section intro" id="horaires"><div><p class="eyebrow">La boutique</p><h2>Une maison ouverte<br>à toutes les envies.</h2></div><p>Chez Ô2 Passions, on vient pour le croustillant d'une baguette encore chaude, on revient pour le sourire et les recettes qui changent avec les saisons.</p><div class="hours"><strong>Nos horaires</strong><span>Mardi – Vendredi <b>7h — 19h</b></span><span>Samedi <b>7h — 13h30</b></span><span>Dimanche <b>7h — 12h30</b></span><span class="closed">Fermé le lundi</span></div></section>
    <section class="section" id="boutique"><div class="section-heading"><div><p class="eyebrow">À l'atelier</p><h2>Nos incontournables</h2></div><a href="catalogue.html">Voir toute la boutique →</a></div><div class="product-grid">${state.products.slice(0, 4).map(productCard).join('')}</div></section>
    <section class="categories section"><p class="eyebrow">Choisir son moment</p><h2>Du matin au goûter</h2><div class="category-grid">${state.categories.map((category, index) => `<a href="catalogue.html?category=${category.slug}" class="category-tile tile-${index + 1}"><span>0${index + 1}</span><h3>${category.name}</h3><small>Explorer la sélection →</small></a>`).join('')}</div></section>
    <section class="visit section" id="contact"><div><p class="eyebrow">À deux pas</p><h2>14 rue des trois marchands</h2><p>Retrouvez-nous au cœur du quartier. Pour une question ou une commande spéciale, appelez-nous.</p><a class="button button-light" href="tel:+33243988140">02 43 98 81 40</a></div><div class="map-note"><span>✦</span><strong>Ô2 Passions</strong><small>Le Mans · France</small></div></section>`);
  bindProducts();
}

async function renderCatalogue() {
  state.categories = await api('/categories'); const category = new URLSearchParams(location.search).get('category');
  state.products = await api(`/products${category ? `?category=${encodeURIComponent(category)}` : ''}`);
  layout(`<section class="page-heading"><p class="eyebrow">La boutique</p><h1>${category ? state.categories.find((item) => item.slug === category)?.name || 'Nos produits' : 'Nos produits'}</h1><p>Des recettes préparées sur place, disponibles selon les fournées.</p></section><div class="filters"><a class="${!category ? 'active' : ''}" href="catalogue.html">Tout voir</a>${state.categories.map((item) => `<a class="${item.slug === category ? 'active' : ''}" href="catalogue.html?category=${item.slug}">${item.name}</a>`).join('')}</div><section class="product-grid catalogue-grid">${state.products.length ? state.products.map(productCard).join('') : '<p class="empty">Aucun produit disponible dans cette catégorie.</p>'}</section>`); bindProducts();
}

async function renderProduct() {
  const product = await api(`/products/${encodeURIComponent(new URLSearchParams(location.search).get('slug'))}`); state.products = [product];
  layout(`<section class="detail"><div class="detail-image"><img src="${product.image_url || 'Images/logo.png'}" alt="${product.name}"></div><div class="detail-copy"><p class="eyebrow">${product.category_name}</p><h1>${product.name}</h1><p>${product.description || ''}</p><strong class="price">${currency.format(product.price)}</strong><button class="button" data-add="${product.id}">Ajouter au panier <span>→</span></button><a class="back-link" href="catalogue.html">← Retour à la boutique</a></div></section>`); bindProducts();
}

function renderCart() {
  const total = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  layout(`<section class="page-heading"><p class="eyebrow">Avant la fournée</p><h1>Votre panier</h1></section><section class="cart-layout"><div class="cart-items">${state.cart.length ? state.cart.map((item, index) => `<article class="cart-item"><img src="${item.image_url || 'Images/logo.png'}" alt=""><div><h3>${item.name}</h3><p>${currency.format(item.price)}</p></div><div class="quantity"><button data-quantity="${index}" data-delta="-1">−</button><b>${item.quantity}</b><button data-quantity="${index}" data-delta="1">+</button></div><strong>${currency.format(item.price * item.quantity)}</strong><button class="remove" data-remove="${index}" aria-label="Supprimer">×</button></article>`).join('') : '<div class="empty"><h2>Votre panier est encore vide.</h2><a href="catalogue.html">Découvrir les produits →</a></div>'}</div><aside class="summary"><p class="eyebrow">Récapitulatif</p><div><span>Sous-total</span><strong>${currency.format(total)}</strong></div><small>Le paiement est confirmé à la boutique.</small>${state.cart.length ? '<a class="button" href="checkout.html">Commander <span>→</span></a>' : ''}</aside></section>`);
  document.querySelectorAll('[data-quantity]').forEach((button) => button.addEventListener('click', () => { const item = state.cart[button.dataset.quantity]; item.quantity = Math.max(0, item.quantity + Number(button.dataset.delta)); state.cart = state.cart.filter((cartItem) => cartItem.quantity); renderCart(); }));
  document.querySelectorAll('[data-remove]').forEach((button) => button.addEventListener('click', () => { state.cart.splice(button.dataset.remove, 1); renderCart(); }));
}

function renderAuth(register = false) {
  layout(`<section class="auth-page"><div><p class="eyebrow">${register ? 'Première visite' : 'Ravi de vous revoir'}</p><h1>${register ? 'Créer un compte' : 'Se connecter'}</h1><p>${register ? 'Enregistrez vos informations pour suivre vos commandes.' : 'Accédez à vos commandes et à vos informations.'}</p></div><form id="auth-form" class="form-panel">${register ? '<div class="form-row"><label>Prénom<input name="firstName" required></label><label>Nom<input name="lastName" required></label></div>' : ''}<label>E-mail<input type="email" name="email" required></label><label>Mot de passe<input type="password" name="password" minlength="8" required></label>${register ? '<label>Téléphone <small>(optionnel)</small><input name="phone"></label>' : ''}<button class="button" type="submit">${register ? 'Créer mon compte' : 'Se connecter'} <span>→</span></button><p id="form-error" class="form-error"></p><a href="${register ? 'connexion.html' : 'inscription.html'}">${register ? 'J’ai déjà un compte' : 'Créer un compte'}</a></form></section>`);
  document.querySelector('#auth-form').addEventListener('submit', async (event) => { event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget)); try { const response = await api(`/auth/${register ? 'register' : 'login'}`, { method: 'POST', body: JSON.stringify(data) }); localStorage.setItem('o2-token', response.token); location.href = 'compte.html'; } catch (error) { document.querySelector('#form-error').textContent = error.message; } });
}

async function renderAccount() {
  try { state.user = await api('/auth/me'); const orders = await api('/orders'); layout(`<section class="page-heading"><p class="eyebrow">Espace personnel</p><h1>Bonjour ${state.user.first_name}</h1><p>${state.user.email}</p></section><section class="account-grid"><div class="account-card"><p class="eyebrow">Mes informations</p><h2>${state.user.first_name} ${state.user.last_name}</h2><p>${state.user.phone || 'Téléphone non renseigné'}</p><button class="button button-small" id="logout">Se déconnecter</button></div><div class="account-card"><p class="eyebrow">Historique</p><h2>Mes commandes</h2>${orders.length ? `<div class="order-list">${orders.map((order) => `<div><strong>#${String(order.id).slice(0, 8)}</strong><span>${new Date(order.created_at).toLocaleDateString('fr-FR')}</span><b>${currency.format(order.total_amount)}</b><small>${order.status}</small></div>`).join('')}</div>` : '<p>Aucune commande pour le moment.</p>'}</div></section>`); document.querySelector('#logout').addEventListener('click', () => { localStorage.removeItem('o2-token'); location.href = 'O2Passions.html'; }); } catch { location.href = 'connexion.html'; }
}

async function renderCheckout() {
  if (!state.cart.length) { location.href = 'panier.html'; return; }
  layout(`<section class="page-heading"><p class="eyebrow">Dernière étape</p><h1>Préparer la commande</h1></section><form id="checkout-form" class="checkout-form"><div class="form-panel"><label>Mode de réception<select name="receptionMode"><option value="PICKUP">Retrait en boutique</option><option value="DELIVERY">Livraison locale</option></select></label><label>Date souhaitée<input name="scheduledDate" type="date" min="${new Date().toISOString().split('T')[0]}" required></label><label>Créneau<select name="scheduledTimeSlot"><option>7h — 10h</option><option>10h — 13h</option><option>15h — 19h</option></select></label><label>Adresse de livraison <small>(si livraison)</small><textarea name="deliveryAddress" rows="3"></textarea></label></div><aside class="summary"><p class="eyebrow">Total</p><h2>${currency.format(state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0))}</h2><p id="checkout-error" class="form-error"></p><button class="button" type="submit">Confirmer la commande <span>→</span></button></aside></form>`);
  document.querySelector('#checkout-form').addEventListener('submit', async (event) => { event.preventDefault(); try { const form = Object.fromEntries(new FormData(event.currentTarget)); const result = await api('/orders', { method: 'POST', body: JSON.stringify({ ...form, items: state.cart.map((item) => ({ productId: item.productId, quantity: item.quantity })) }) }); state.cart = []; saveCart(); layout(`<section class="success"><span>✦</span><p class="eyebrow">Commande confirmée</p><h1>Merci, votre commande est bien enregistrée.</h1><p>Votre numéro de commande est <strong>#${result.orderId.slice(0, 8)}</strong>.</p><a class="button" href="compte.html">Voir mes commandes <span>→</span></a></section>`); } catch (error) { document.querySelector('#checkout-error').textContent = error.message; } });
}

async function renderAdmin() { try { const products = await api('/admin/products'); const orders = await api('/admin/orders'); state.products = products; layout(`<section class="page-heading"><p class="eyebrow">Administration</p><h1>Le tableau de bord</h1></section><section class="admin-grid"><div class="account-card"><p class="eyebrow">Catalogue</p><h2>${products.length} produits actifs</h2><div class="admin-list">${products.map((product) => `<div><span>${product.name}</span><b>${currency.format(product.price)}</b></div>`).join('')}</div></div><div class="account-card"><p class="eyebrow">Commandes</p><h2>${orders.length} commandes</h2><div class="admin-list">${orders.map((order) => `<div><span>#${String(order.id).slice(0, 8)} · ${order.first_name}</span><b>${order.status}</b></div>`).join('')}</div></div></section>`); } catch { location.href = 'connexion.html'; } }

const renderers = { home: renderHome, catalogue: renderCatalogue, product: renderProduct, cart: renderCart, login: () => renderAuth(false), register: () => renderAuth(true), account: renderAccount, checkout: renderCheckout, admin: renderAdmin };
(renderers[document.body.dataset.page] || renderHome)().catch((error) => { document.querySelector('#app').innerHTML = `<div class="error-page"><h1>La boutique est momentanément indisponible.</h1><p>${error.message}</p></div>`; });
