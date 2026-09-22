import { cartItems, clearCart, updateCartIcon } from './modules/cart.js';

document.addEventListener('DOMContentLoaded', () => {
  updateCartIcon();
  const cartList = document.getElementById('cart-items-list');
  const cartTotal = document.getElementById('cart-total');
  const btnVaciar = document.getElementById('btn-vaciar');
  const btnPagar = document.getElementById('btn-pagar');

  const renderCart = () => {
    cartList.innerHTML = '';
    let total = 0;

    if (cartItems.length === 0) {
      cartList.innerHTML = '<li class="list-group-item text-center text-muted py-4">Tu carrito está vacío.</li>';
      cartTotal.textContent = '$0';
      return;
    }

    cartItems.forEach((item) => {
      total += item.precio;
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center shadow-sm mb-2 rounded';
      li.innerHTML = `
        <div class="d-flex align-items-center">
          <img src="${item.img}" alt="${item.nombre}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 15px;">
          <span class="fw-bold text-dark">${item.nombre}</span>
        </div>
        <span class="badge bg-warning text-dark fs-6 rounded-pill">$${item.precio.toLocaleString('es-CL')}</span>
      `;
      cartList.appendChild(li);
    });

    cartTotal.textContent = `$${total.toLocaleString('es-CL')}`;
  };

  if(btnVaciar) {
    btnVaciar.addEventListener('click', () => {
      if(confirm('¿Seguro que deseas vaciar el carrito?')) {
        clearCart();
        renderCart();
      }
    });
  }

  if(btnPagar) {
    btnPagar.addEventListener('click', () => {
      if (cartItems.length === 0) {
        alert('Agrega productos antes de pagar.');
        return;
      }
      alert('¡Gracias por tu compra simulada en Dulce Hogar!');
      clearCart();
      renderCart();
    });
  }

  renderCart();
});