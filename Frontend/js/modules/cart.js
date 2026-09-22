// Obtener carrito guardado en el navegador o iniciar uno vacío
export let cartItems = JSON.parse(localStorage.getItem('dulceHogarCart')) || [];

// Función interna para guardar
const saveCart = () => {
  localStorage.setItem('dulceHogarCart', JSON.stringify(cartItems));
};

// Actualiza el número del icono en el Navbar
export const updateCartIcon = () => {
  const cartIcon = document.getElementById('cart-icon');
  if (!cartIcon) return;
  
  const spanNum = cartIcon.querySelector('span');
  if (spanNum) {
      spanNum.textContent = `(${cartItems.length})`;
  } else {
      cartIcon.textContent = `🛒 (${cartItems.length})`;
  }
};

// Agrega un producto y anima el icono
export const addToCart = (producto) => {
  cartItems.push(producto);
  saveCart();
  updateCartIcon();

  const cartIcon = document.getElementById('cart-icon');
  if (cartIcon) {
    cartIcon.style.transform = 'scale(1.2) rotate(-5deg)';
    cartIcon.style.transition = 'transform 0.2s ease';
    setTimeout(() => { 
        cartIcon.style.transform = 'scale(1) rotate(0deg)'; 
    }, 200);
  }
};

// Vacía el carrito por completo
export const clearCart = () => {
  cartItems = [];
  saveCart();
  updateCartIcon();
};