// Configuration de l'API
const API_BASE_URL = 'http://localhost:3000';

// État de l'application
let currentUser = null;
let authToken = null;
let cart = [];
let menu = [];

// Éléments DOM
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const userMenu = document.getElementById('userMenu');
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');
const orderNowBtn = document.getElementById('orderNowBtn');

// Nouveaux boutons
const cartBtn = document.getElementById('cartBtn');
const cartCount = document.getElementById('cartCount');
const profileBtn = document.getElementById('profileBtn');
const ordersBtn = document.getElementById('ordersBtn');

// Modales
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const closeLoginModal = document.getElementById('closeLoginModal');
const closeRegisterModal = document.getElementById('closeRegisterModal');
const switchToRegister = document.getElementById('switchToRegister');
const switchToLogin = document.getElementById('switchToLogin');

// Formulaires
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Sections
const homeContent = document.getElementById('homeContent');
const menuSection = document.getElementById('menuSection');
const cartSection = document.getElementById('cartSection');
const profileSection = document.getElementById('profileSection');
const ordersSection = document.getElementById('ordersSection');

// Toast
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkAuthStatus();
});

function initializeApp() {
    // Vérifier si l'utilisateur est déjà connecté
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedToken && savedUser) {
        authToken = savedToken;
        currentUser = JSON.parse(savedUser);
        updateUI();
    }
}

function setupEventListeners() {
    // Boutons de navigation
    loginBtn.addEventListener('click', () => showModal('login'));
    registerBtn.addEventListener('click', () => showModal('register'));
    logoutBtn.addEventListener('click', logout);
    orderNowBtn.addEventListener('click', () => showSection('menu'));
    
    // Nouveaux boutons
    cartBtn.addEventListener('click', () => showSection('cart'));
    profileBtn.addEventListener('click', () => showSection('profile'));
    ordersBtn.addEventListener('click', () => showSection('orders'));
    
    // Bouton "Voir le menu complet" sur la page d'accueil
    const orderNowBtn2 = document.getElementById('orderNowBtn2');
    if (orderNowBtn2) {
        orderNowBtn2.addEventListener('click', () => showSection('menu'));
    }

    // Fermeture des modales
    closeLoginModal.addEventListener('click', () => hideModal('login'));
    closeRegisterModal.addEventListener('click', () => hideModal('register'));
    switchToRegister.addEventListener('click', () => {
        hideModal('login');
        showModal('register');
    });
    switchToLogin.addEventListener('click', () => {
        hideModal('register');
        showModal('login');
    });

    // Formulaires
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);

    // Fermer les modales en cliquant à l'extérieur
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) hideModal('login');
        if (e.target === registerModal) hideModal('register');
    });
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            
            // Sauvegarder dans le localStorage
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            updateUI();
            hideModal('login');
            showToast('Connexion réussie !');
            
            // Charger le menu après connexion
            await loadMenu();
        } else {
            showToast(data.error || 'Erreur de connexion', 'error');
        }
    } catch (error) {
        console.error('Erreur de connexion:', error);
        showToast('Erreur de connexion', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password, role })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            
            // Sauvegarder dans le localStorage
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            updateUI();
            hideModal('register');
            showToast('Inscription réussie !');
            
            // Charger le menu après inscription
            await loadMenu();
        } else {
            showToast(data.error || 'Erreur d\'inscription', 'error');
        }
    } catch (error) {
        console.error('Erreur d\'inscription:', error);
        showToast('Erreur d\'inscription', 'error');
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    cart = [];
    
    // Supprimer du localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    updateUI();
    showToast('Déconnexion réussie');
}

function updateUI() {
    if (currentUser) {
        // Utilisateur connecté
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        userMenu.style.display = 'block';
        userName.textContent = `Bonjour ${currentUser.name}`;
        
        // Afficher les sections disponibles
        orderNowBtn.style.display = 'inline-block';
    } else {
        // Utilisateur non connecté
        loginBtn.style.display = 'inline-block';
        registerBtn.style.display = 'inline-block';
        userMenu.style.display = 'none';
        
        // Masquer les sections privées
        orderNowBtn.style.display = 'none';
        hideAllSections();
    }
    
    // Mettre à jour le compteur du panier
    updateCartCount();
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (totalItems > 0) {
        cartCount.textContent = totalItems;
        cartCount.classList.remove('hidden');
    } else {
        cartCount.classList.add('hidden');
    }
}

function showModal(type) {
    if (type === 'login') {
        loginModal.classList.remove('hidden');
    } else if (type === 'register') {
        registerModal.classList.remove('hidden');
    }
}

function hideModal(type) {
    if (type === 'login') {
        loginModal.classList.add('hidden');
        loginForm.reset();
    } else if (type === 'register') {
        registerModal.classList.add('hidden');
        registerForm.reset();
    }
}

function showSection(section) {
    hideAllSections();
    
    switch(section) {
        case 'menu':
            homeContent.classList.add('hidden');
            menuSection.classList.remove('hidden');
            loadMenu();
            break;
        case 'cart':
            homeContent.classList.add('hidden');
            cartSection.classList.remove('hidden');
            loadCart();
            break;
        case 'profile':
            homeContent.classList.add('hidden');
            profileSection.classList.remove('hidden');
            loadProfile();
            break;
        case 'orders':
            homeContent.classList.add('hidden');
            ordersSection.classList.remove('hidden');
            loadOrders();
            break;
    }
}

function hideAllSections() {
    homeContent.classList.remove('hidden');
    menuSection.classList.add('hidden');
    cartSection.classList.add('hidden');
    profileSection.classList.add('hidden');
    ordersSection.classList.add('hidden');
}

async function loadMenu() {
    try {
        const response = await fetch(`${API_BASE_URL}/plats`);
        const plats = await response.json();
        
        const menuGrid = document.getElementById('menuGrid');
        menuGrid.innerHTML = '';
        
        plats.forEach(plat => {
            const platCard = createPlatCard(plat);
            menuGrid.appendChild(platCard);
        });
        
        menu = plats;
    } catch (error) {
        console.error('Erreur lors du chargement du menu:', error);
        showToast('Erreur lors du chargement du menu', 'error');
    }
}

function createPlatCard(plat) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition';
    
    // Images directes selon l'ID du plat
    const getPlatImage = (platId) => {
        const images = {
            1: 'https://eu.ooni.com/cdn/shop/articles/20220211142754-margherita-9920_0483214a-7057-4277-9a3b-f2ab17c01e13.jpg?v=1737105958&width=1080',
            2: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSe2kYDPFLzbl4M3r_DgOGVFOIeq-3MzpmAGA&s',
            3: 'https://rians.com/wp-content/uploads/2024/04/1000038128.jpg',
            4: 'https://assets.afcdn.com/recipe/20211214/125831_w1024h1024c1cx866cy866cxt0cyt292cxb1732cyb1732.jpg'
        };
        return images[platId] || null;
    };
    
    const imageUrl = getPlatImage(plat.id);
    
    card.innerHTML = `
        <div class="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
            ${imageUrl ? 
                `<img src="${imageUrl}" alt="${plat.name}" class="w-full h-full object-cover">` : 
                `<i class="fas fa-utensils text-4xl text-gray-400"></i>`
            }
        </div>
        <div class="p-6">
            <h3 class="text-xl font-bold text-gray-900 mb-2">${plat.name}</h3>
            <p class="text-gray-600 mb-4">${plat.description}</p>
            <div class="flex justify-between items-center">
                <span class="text-2xl font-bold text-crous-red">${plat.price}€</span>
                <button onclick="addToCart(${plat.id})" class="bg-crous-red text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                    <i class="fas fa-plus mr-2"></i>Ajouter
                </button>
            </div>
        </div>
    `;
    
    return card;
}

function addToCart(platId) {
    if (!currentUser) {
        showToast('Vous devez être connecté pour ajouter des articles', 'error');
        return;
    }
    
    const plat = menu.find(p => p.id === platId);
    if (plat) {
        const existingItem = cart.find(item => item.id === platId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...plat, quantity: 1 });
        }
        
        showToast(`${plat.name} ajouté au panier !`);
        updateCartUI();
        updateCartCount();
    }
}

function updateCartUI() {
    const cartItems = document.getElementById('cartItems');
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="text-center text-gray-500">Votre panier est vide</p>';
        return;
    }
    
    let total = 0;
    cartItems.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        // Images directes selon l'ID du plat
        const getPlatImage = (platId) => {
            const images = {
                1: 'https://eu.ooni.com/cdn/shop/articles/20220211142754-margherita-9920_0483214a-7057-4277-9a3b-f2ab17c01e13.jpg?v=1737105958&width=1080',
                2: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSe2kYDPFLzbl4M3r_DgOGVFOIeq-3MzpmAGA&s',
                3: 'https://rians.com/wp-content/uploads/2024/04/1000038128.jpg',
                4: 'https://assets.afcdn.com/recipe/20211214/125831_w1024h1024c1cx866cy866cxt0cyt292cxb1732cyb1732.jpg'
            };
            return images[platId] || null;
        };
        
        const imageUrl = getPlatImage(item.id);
        
        return `
            <div class="flex justify-between items-center p-4 border-b">
                <div class="flex items-center">
                    <div class="w-16 h-16 bg-gray-200 rounded-lg mr-4 flex items-center justify-center overflow-hidden">
                        ${imageUrl ? 
                            `<img src="${imageUrl}" alt="${item.name}" class="w-full h-full object-cover">` : 
                            `<i class="fas fa-utensils text-gray-400"></i>`
                        }
                    </div>
                    <div>
                        <h4 class="font-semibold">${item.name}</h4>
                        <p class="text-gray-600">${item.price}€ × ${item.quantity}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="font-bold">${itemTotal.toFixed(2)}€</span>
                    <button onclick="removeFromCart(${item.id})" class="text-red-500 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    cartItems.innerHTML += `
        <div class="p-4 bg-gray-50">
            <div class="flex justify-between items-center">
                <span class="text-xl font-bold">Total: ${total.toFixed(2)}€</span>
                <button onclick="checkout()" class="bg-crous-green text-white px-6 py-3 rounded-lg hover:bg-green-700 transition">
                    <i class="fas fa-credit-card mr-2"></i>Commander
                </button>
            </div>
        </div>
    `;
}

function removeFromCart(platId) {
    cart = cart.filter(item => item.id !== platId);
    updateCartUI();
    updateCartCount();
    showToast('Article supprimé du panier');
}

async function checkout() {
    if (!currentUser) {
        showToast('Vous devez être connecté pour passer commande', 'error');
        return;
    }
    
    if (cart.length === 0) {
        showToast('Votre panier est vide', 'error');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const plats = cart.map(item => item.id);
    
    try {
        const response = await fetch(`${API_BASE_URL}/commande`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                plats,
                total,
                pointLivraison: 'Campus - Salle de TD'
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            cart = [];
            updateCartUI();
            updateCartCount();
            showToast('Commande passée avec succès !');
            hideAllSections();
        } else {
            showToast(data.error || 'Erreur lors de la commande', 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la commande:', error);
        showToast('Erreur lors de la commande', 'error');
    }
}

async function loadProfile() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/profile`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const user = await response.json();
        
        const profileInfo = document.getElementById('profileInfo');
        profileInfo.innerHTML = `
            <div class="text-center">
                <div class="w-24 h-24 bg-crous-red rounded-full mx-auto mb-4 flex items-center justify-center">
                    <i class="fas fa-user text-white text-2xl"></i>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-2">${user.name}</h3>
                <p class="text-gray-600 mb-4">${user.email}</p>
                <p class="text-sm text-gray-500">Rôle: ${user.role}</p>
                <p class="text-sm text-gray-500">Membre depuis: ${new Date(user.createdAt).toLocaleDateString('fr-FR')}</p>
            </div>
        `;
    } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        showToast('Erreur lors du chargement du profil', 'error');
    }
}

async function loadOrders() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/mes-commandes`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const commandes = await response.json();
        
        const ordersList = document.getElementById('ordersList');
        if (commandes.length === 0) {
            ordersList.innerHTML = '<p class="text-center text-gray-500">Aucune commande</p>';
            return;
        }
        
        ordersList.innerHTML = commandes.map(commande => `
            <div class="bg-white rounded-lg shadow-lg p-6">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="text-lg font-semibold">Commande #${commande.id}</h4>
                        <p class="text-gray-600">${new Date(commande.createdAt).toLocaleDateString('fr-FR')}</p>
                        <p class="text-gray-600">Total: ${commande.total}€</p>
                        <p class="text-gray-600">Point de livraison: ${commande.pointLivraison}</p>
                    </div>
                    <div class="flex flex-col items-end space-y-2">
                        <span class="px-3 py-1 rounded-full text-sm font-medium ${
                            commande.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
                            commande.statut === 'en_preparation' ? 'bg-blue-100 text-blue-800' :
                            commande.statut === 'livree' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                        }">
                            ${commande.statut}
                        </span>
                        <button onclick="deleteOrder(${commande.id})" class="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition text-sm">
                            <i class="fas fa-trash mr-1"></i>Supprimer
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erreur lors du chargement des commandes:', error);
        showToast('Erreur lors du chargement des commandes', 'error');
    }
}

function loadCart() {
    updateCartUI();
}

function checkAuthStatus() {
    // Cette fonction est appelée au chargement de la page
    // pour vérifier si l'utilisateur est déjà connecté
}

function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Navigation entre les sections
function showMenu() {
    showSection('menu');
}

function showCart() {
    showSection('cart');
}

function showProfile() {
    showSection('profile');
}

function showOrders() {
    showSection('orders');
}

async function deleteOrder(commandeId) {
    if (!currentUser) {
        showToast('Vous devez être connecté', 'error');
        return;
    }
    
    // Confirmation avant suppression
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/commande/${commandeId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast('Commande supprimée avec succès !');
            // Recharger la liste des commandes
            loadOrders();
        } else {
            showToast(data.error || 'Erreur lors de la suppression', 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        showToast('Erreur lors de la suppression', 'error');
    }
}

// Exposer les fonctions globalement
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.checkout = checkout;
window.showMenu = showMenu;
window.showCart = showCart;
window.showProfile = showProfile;
window.showOrders = showOrders;
window.deleteOrder = deleteOrder;
