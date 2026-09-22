export let cartItems = JSON.parse(localStorage.getItem('dulceHogarCart')) || [];

const saveCart = () => localStorage.setItem('dulceHogarCart', JSON.stringify(cartItems));

export const updateCartIcon = () => {
  const cartIcon = document.getElementById('cart-icon');
  if (!cartIcon) return;
  // Actualizamos el número dentro del span
  const spanNum = cartIcon.querySelector('span');
  if (spanNum) {
      spanNum.textContent = `(${cartItems.length})`;
  } else {
      cartIcon.textContent = `🛒 (${cartItems.length})`;
  }
};

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

export const clearCart = () => {
  cartItems = [];
  saveCart();
  updateCartIcon();
};