/**
 * FURNS Portfolio API Integration
 * Connects template to FastAPI backend for dynamic content
 */

const API_BASE = 'http://localhost:8001/api';
const AUTH_TOKEN = 'Bearer furns-admin-secret-2024';

// API Configuration
const apiConfig = {
    headers: {
        'Authorization': AUTH_TOKEN,
        'Content-Type': 'application/json'
    }
};

/**
 * Load products from backend API
 * @param {string} category - Optional category filter
 * @returns {Promise<Array>} Products array
 */
async function loadProducts(category = null) {
    try {
        console.log('Loading products...', category ? `Category: ${category}` : 'All products');
        
        const response = await fetch(`${API_BASE}/products`, apiConfig);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        let products = await response.json();
        
        // Filter by category if specified
        if (category && category !== 'all') {
            products = products.filter(product => 
                product.category.toLowerCase() === category.toLowerCase()
            );
        }
        
        // Only show active products
        products = products.filter(product => product.status === 'active');
        
        console.log(`Loaded ${products.length} products`);
        return products;
        
    } catch (error) {
        console.error('Error loading products:', error);
        return [];
    }
}

/**
 * Load categories from backend API
 * @returns {Promise<Array>} Categories array
 */
async function loadCategories() {
    try {
        console.log('Loading categories...');
        
        const response = await fetch(`${API_BASE}/categories`, apiConfig);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const categories = await response.json();
        console.log(`Loaded ${categories.length} categories`);
        return categories;
        
    } catch (error) {
        console.error('Error loading categories:', error);
        return [];
    }
}

/**
 * Load single product details
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} Product details
 */
async function loadProductDetails(productId) {
    try {
        console.log('Loading product details:', productId);
        
        const response = await fetch(`${API_BASE}/products/${productId}`, apiConfig);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const product = await response.json();
        console.log('Product details loaded:', product.name);
        return product;
        
    } catch (error) {
        console.error('Error loading product details:', error);
        return null;
    }
}

/**
 * Render products in the main product grid
 * @param {Array} products - Products to render
 */
function renderProducts(products) {
    const productGrid = document.querySelector('.product-items-grid, .products-grid, .product-wrapper');
    
    if (!productGrid) {
        console.warn('Product grid container not found');
        return;
    }
    
    if (products.length === 0) {
        productGrid.innerHTML = `
            <div class="col-12">
                <div class="text-center py-5">
                    <h4>No products found</h4>
                    <p class="text-muted">Try adjusting your filter criteria</p>
                </div>
            </div>
        `;
        return;
    }
    
    let productsHTML = '';
    
    products.forEach(product => {
        const imageUrl = product.images && product.images.length > 0 
            ? `${API_BASE.replace('/api', '')}/uploads/${product.images[0]}`
            : 'assets/images/placeholder-product.png';
            
        const features = product.features && product.features.length > 0 
            ? product.features.slice(0, 3).join(', ')
            : 'Premium Quality';
            
        productsHTML += `
            <div class="col-lg-4 col-md-6 col-sm-6 col-xs-6 mb-30">
                <div class="product-item">
                    <div class="product-img">
                        <a href="single-product.html?id=${product.id}">
                            <img class="default-img" src="${imageUrl}" alt="${product.name}" />
                            <img class="hover-img" src="${imageUrl}" alt="${product.name}" />
                        </a>
                        ${product.featured ? '<span class="product-flag">Featured</span>' : ''}
                    </div>
                    <div class="product-content">
                        <div class="product-content-wrap">
                            <h4><a href="single-product.html?id=${product.id}">${product.name}</a></h4>
                            <p class="product-features">${features}</p>
                            <div class="product-action">
                                <a href="single-product.html?id=${product.id}" class="view-details btn btn-primary">
                                    View Details
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    productGrid.innerHTML = productsHTML;
    console.log(`Rendered ${products.length} products`);
}

/**
 * Render category filter buttons
 * @param {Array} categories - Categories to render
 */
function renderCategories(categories) {
    const categoryFilter = document.querySelector('.category-filter, .product-filter');
    
    if (!categoryFilter) {
        console.warn('Category filter container not found');
        return;
    }
    
    let categoryHTML = `
        <button class="filter-btn active" data-category="all">All Products</button>
    `;
    
    categories.forEach(category => {
        categoryHTML += `
            <button class="filter-btn" data-category="${category.slug}">
                ${category.name}
            </button>
        `;
    });
    
    categoryFilter.innerHTML = categoryHTML;
    
    // Add click event listeners
    setupCategoryFilters();
}

/**
 * Setup category filter click handlers
 */
function setupCategoryFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', async function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            const products = await loadProducts(category === 'all' ? null : category);
            renderProducts(products);
        });
    });
}

/**
 * Initialize portfolio on page load
 */
async function initializePortfolio() {
    console.log('Initializing Furns Portfolio...');
    
    try {
        // Load and render categories first
        const categories = await loadCategories();
        renderCategories(categories);
        
        // Load and render all products
        const products = await loadProducts();
        renderProducts(products);
        
        // Setup single product page if on product detail page
        if (window.location.pathname.includes('single-product.html')) {
            setupSingleProductPage();
        }
        
        console.log('Portfolio initialized successfully!');
        
    } catch (error) {
        console.error('Error initializing portfolio:', error);
        
        // Fallback: show error message
        const productGrid = document.querySelector('.product-items-grid, .products-grid, .product-wrapper');
        if (productGrid) {
            productGrid.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-warning text-center">
                        <h4>Unable to load products</h4>
                        <p>Please check your connection and try again.</p>
                    </div>
                </div>
            `;
        }
    }
}

/**
 * Setup single product page with dynamic content
 */
async function setupSingleProductPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        console.warn('No product ID found in URL');
        return;
    }
    
    const product = await loadProductDetails(productId);
    if (!product) {
        console.error('Product not found');
        return;
    }
    
    // Update page title
    document.title = `${product.name} - Furns Portfolio`;
    
    // Update product images
    const productImages = document.querySelectorAll('.product-large-image img, .product-thumbs img');
    productImages.forEach((img, index) => {
        if (product.images && product.images[index]) {
            const imageUrl = `${API_BASE.replace('/api', '')}/uploads/${product.images[index]}`;
            img.src = imageUrl;
            img.alt = product.name;
        }
    });
    
    // Update product info
    const productTitle = document.querySelector('.product-title h1, .product-details h1');
    if (productTitle) productTitle.textContent = product.name;
    
    const productDescription = document.querySelector('.product-description, .product-content p');
    if (productDescription) productDescription.textContent = product.description;
    
    // Update features
    if (product.features && product.features.length > 0) {
        const featuresList = document.querySelector('.product-features, .pro-details-feature');
        if (featuresList) {
            const featuresHTML = product.features.map(feature => 
                `<li><i class="fa fa-check"></i> ${feature}</li>`
            ).join('');
            featuresList.innerHTML = `<ul>${featuresHTML}</ul>`;
        }
    }
}

// Global error handler
window.addEventListener('unhandledrejection', event => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePortfolio);
} else {
    initializePortfolio();
}