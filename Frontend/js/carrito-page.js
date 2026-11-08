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
    btnPagar.addEventListener('click', async () => {
      if (cartItems.length === 0) return alert('Agrega productos antes de pagar.');

      const token = localStorage.getItem('dulceHogarToken');
      const email = localStorage.getItem('dulceHogarEmail');

      if (!token || !email) {
        alert(' Debes iniciar sesión para poder comprar.');
        return;
      }

      const total = cartItems.reduce((acc, item) => acc + item.precio, 0);
      
      btnPagar.disabled = true;
      btnPagar.textContent = 'Procesando...';

      try {
        // 1. Crear el pedido en el Gateway
        const resOrder = await fetch('http://localhost:8000/api/orders', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({
            cliente_email: email,
            items: cartItems.map(i => ({ id: String(i.id), nombre: i.nombre, precio: i.precio })),
            total: total,
            idempotency_key: `compra-${Date.now()}` // Evita duplicados
          })
        });

        if (!resOrder.ok) throw new Error('Error al crear el pedido');
        const orderData = await resOrder.json();

        // 2. Procesar el pago en el Gateway
        const resPayment = await fetch('http://localhost:8000/api/payments', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ order_id: orderData.id, monto: total })
        });

        if (!resPayment.ok) throw new Error('Error al procesar el pago');

        alert(`¡Gracias por tu compra en Dulce Hogar! 🥐\nPedido N°: ${orderData.id}\nTotal: $${total.toLocaleString('es-CL')}`);
        
        clearCart();
        renderCart();

      } catch (error) {
        alert(` ${error.message}`);
      } finally {
        btnPagar.disabled = false;
        btnPagar.textContent = 'Proceder al Pago';
      }
    });
  }

  renderCart();
});