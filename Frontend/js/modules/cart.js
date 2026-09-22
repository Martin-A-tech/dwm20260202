let cartCount = 0;

export const updateCart = () => {
  const cartIcon = document.getElementById('cart-icon');
  if (!cartIcon) return;

  cartCount++;
  cartIcon.textContent = `🛒(${cartCount})`;

  cartIcon.style.transform = 'scale(1.2)';
  setTimeout(() => {
    cartIcon.style.transform = 'scale(1)';
  }, 200);

  console.log(`Producto agregado. Total en carrito: ${cartCount}`);
};

export const initCart = () => {
  const cartIcon = document.getElementById('cart-icon');
  if (!cartIcon) return;

  cartIcon.addEventListener('click', updateCart);

  cartIcon.addEventListener('dblclick', () => {
    alert('¡Doble clic detectado! Tienes un 10% de descuento VIP en tu compra.');
  });
};