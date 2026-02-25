let products = [];
let category = "All Products";
let cart = JSON.parse(localStorage.getItem('cart')) || [];

async function loadProducts() {
    showLoader();   
    try {
        const response = await fetch('products.json');
        if (!response.ok) {
            throw new Error(`products.json load failed - status: ${response.status}`);
        }
        products = await response.json();

        renderGrids(category);
        updateCartCount();

    } catch (error) {
        console.error('Fetch error:', error);
    }finally{
        hideLoader()
    }
}

function renderProductCard(product, container) {
    if (!container || !product) return;

    const cardHTML = `
        <div class="product-card">
            <div class="product-image-wrapper">
                <img src="${product.images?.[0] || 'https://via.placeholder.com/340x420?text=No+Image'}" alt="${product.name}">
                <button class="quick-add" onclick="quickAddToCart(${product.id})">+ Cart</button>
            </div>
            <div class="product-details">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">PKR ${Number(product.price).toFixed(2)}</p>
                <div class="product-meta">
                    <span class="tag">${product.colors?.[0] || '—'}</span>
                    <span class="tag">${product.sizes?.join(', ') || '—'}</span>
                </div>
                <a href="product.html?id=${product.id}" class="btn-view">View Details</a>
            </div>
        </div>
    `;

    container.innerHTML += cardHTML;
}

function renderGrids(category) {
    const featured = document.getElementById('featured-grid');
    if (featured) {
        featured.innerHTML = '';
        products.slice(0, 6).forEach(p => renderProductCard(p, featured));
    }

    const newArrivals = document.getElementById('new-arrivals-grid');
    if (newArrivals) {
        newArrivals.innerHTML = '';
        products.slice(-6).forEach(p => renderProductCard(p, newArrivals));
    }

    const productsGrid = document.getElementById('products-grid');
    if (productsGrid) {
        productsGrid.innerHTML = '';
        if(category === "All Products"){
          products.forEach(product => renderProductCard(product, productsGrid))
        }else{
            products
                .filter(product => product.category === category)
                .forEach(product => renderProductCard(product, productsGrid))
        }

    }

    const reviewsGrid = document.getElementById('reviews-grid');
    if (reviewsGrid) {
        reviewsGrid.innerHTML = '';
        products.slice(-6).forEach(p => {
            if (p.reviews?.length > 0) {
                reviewsGrid.innerHTML += `
                    <div class="review-card">
                        <p>"${p.reviews[0]}"</p>
                        <span>— ${p.name}</span>
                    </div>
                `;
            }
        });
        if (reviewsGrid.innerHTML === '') {
            reviewsGrid.innerHTML = '<p style="text-align:center; color:#777;">No reviews yet.</p>';
        }
    }
}

function quickAddToCart(id) {
    const product = products.find(p => p.id === id);
    if (!product) return alert('Product not found!');

    const size = product.sizes?.[0] || 'M';
    const color = product.colors?.[0] || 'Default';

    cart.push({ ...product, size, color, quantity: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert(`Added ${product.name} to cart!`);
}
function addToCart() {
    const id = Number(new URLSearchParams(location.search).get('id'));
    const product = products.find(p => p.id === id);

    const size = document.getElementById('product-sizes')?.value;
    const color = document.getElementById('product-colors')?.value;

    if (!size || !color) return alert('Please select size and color');

    cart.push({ ...product, size, color, quantity: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert('Added to cart!');
}

function loadProductDetails() {
    
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get('id'));
    const product = products.find(p => p.id === id)

    if (!product) {
        document.body.innerHTML = '<h2 style="text-align:center; padding:5rem;">Product not found</h2>';
        return;
    }

    const nameEl    = document.getElementById('product-name');
    const priceEl   = document.getElementById('product-price');
    const descEl    = document.getElementById('product-description');
    const imagesEl  = document.getElementById('product-images');
    const sizesEl   = document.getElementById('product-sizes');
    const colorsEl  = document.getElementById('product-colors');
    const reviewsEl = document.getElementById('product-reviews-list');

    if (nameEl)    nameEl.textContent    = product.name;
    if (priceEl)   priceEl.textContent   = `PKR ${Number(product.price).toFixed(2)}`;
    if (descEl)    descEl.textContent    = product.description;

    if (imagesEl) {
        imagesEl.innerHTML = '';
        (product.images || [ 'https://via.placeholder.com/500?text=Product' ]).forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = product.name;
            img.style.width = '100%';
            img.style.borderRadius = '10px';
            img.style.marginBottom = '1rem';
            imagesEl.appendChild(img);
        });
    }

    if (sizesEl) {
        sizesEl.innerHTML = '';
        (product.sizes || []).forEach(s => {
            sizesEl.innerHTML += `<option value="${s}">${s}</option>`;
        });
    }

    if (colorsEl) {
        colorsEl.innerHTML = '';
        (product.colors || []).forEach(c => {
            colorsEl.innerHTML += `<option value="${c}">${c}</option>`;
        });
    }

    if (reviewsEl) {
        reviewsEl.innerHTML = '';
        (product.reviews || []).forEach(r => {
            reviewsEl.innerHTML += `<p style="background:#f9f9f9; padding:1rem; border-radius:8px; margin-bottom:1rem;">"${r}"</p>`;
        });
        if (!product.reviews || product.reviews.length === 0) {
            reviewsEl.innerHTML = '<p style="color:#777;">No reviews yet.</p>';
        }
    }
}

function loadCart() {
    const container = document.getElementById('cart-items');
    if (!container) return;
    container.innerHTML = '';
    let total = 0;

    cart.forEach((item, i) => {
        total += item.price * (item.quantity || 1);
        container.innerHTML += `
            <div class="cart-item">
                <img src="${item.images?.[0] || ''}" alt="${item.name}" width="80">
                <div>
                    <strong>${item.name}</strong><br>
                    <small>Size: ${item.size} • Color: ${item.color}</small>
                </div>
                <span>pkr ${Number(item.price).toFixed(2)}</span>
                <button id="remove_btn" onclick="removeFromCart(${i})">Remove</button>
            </div>
        `;
    });

    const cartTotalEl = document.getElementById('cart-total');
    if (cartTotalEl) cartTotalEl.textContent = total.toFixed(2);

    updateCartCount();
    hideLoader();   
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
    updateCartCount();
}

function loadCheckout() {
    const container = document.getElementById('checkout-items');
    if (!container) return;
    container.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        total += item.price * (item.quantity || 1);
        container.innerHTML += `
            <div class="checkout-item">
                ${item.name} (${item.size}, ${item.color}) — PKR ${Number(item.price).toFixed(2)}
            </div>
        `;
    });

    const checkoutTotalEl = document.getElementById('checkout-total');
    if (checkoutTotalEl) checkoutTotalEl.textContent = total.toFixed(2);

    updateCartCount();
    hideLoader();
}

// Complete purchase
function completePurchase() {
    if (cart.length === 0) return alert('Cart is empty!');
    alert('Thank you! Purchase completed successfully.');
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    location.href = 'index.html';
}

function updateCartCount() {
    document.querySelectorAll('#cart-count').forEach(el => el.textContent = cart.length);
}

document.addEventListener('DOMContentLoaded', () => {
    const path = location.pathname.toLowerCase();
    if(path.endsWith('/') || path.includes('index')){
        loadProducts();
    } else if (path.includes('products')) {
        loadProducts();
    } else if (path.includes('product')) {
        loadProducts().then(loadProductDetails);
    } else if (path.includes('cart')) {
        loadCart();
    } else if (path.includes('checkout')) {
        loadCheckout();
    }
});


document.addEventListener("click", function(e){
    if(e.target.classList.contains("ctg")){
       category = e.target.getAttribute("data-category")
       document.getElementById("product-head").innerHTML = category ;
       showLoader();
       renderGrids(category);
       hideLoader();
    }
})

const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });


function showLoader() {
    document.getElementById('loader').classList.remove('hidden');
}

function hideLoader() {
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
    }, 400);
}


document.querySelector('.btn-add-to-cart')?.addEventListener('click', () => {
    showLoader();
    setTimeout(hideLoader, 200);
})
