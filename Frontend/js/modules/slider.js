import { addToCart } from './cart.js';

export const initSlider = () => {
  const sliderContainer = document.getElementById('product-slider-container');
  if (!sliderContainer) return;

  // Catálogo completo con imágenes reales de repostería y panadería
  const productosDisponibles = [
    { id: 1, nombre: 'Pan Amasado Tradicional', precio: 1500, img: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=500' },
    { id: 2, nombre: 'Pan de Masa Madre', precio: 3500, img: 'https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=500' },
    { id: 3, nombre: 'Croissant Francés', precio: 2000, img: 'https://images.unsplash.com/photo-1555507036-ab1e4006aa24?w=500' },
    { id: 4, nombre: 'Torta Tres Leches', precio: 12000, img: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=500' },
    { id: 5, nombre: 'Facturas Surtidas', precio: 4500, img: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=500' },
    { id: 6, nombre: 'Empanada de Pino', precio: 2500, img: 'https://images.unsplash.com/photo-1626200419111-92e92c2f623e?w=500' },
    { id: 7, nombre: 'Pan Integral y Semillas', precio: 2800, img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500' },
    { id: 8, nombre: 'Berlín de Crema', precio: 1200, img: 'https://images.unsplash.com/photo-1612204071534-110037a50a31?w=500' }
  ];

  // Limpiamos el contenedor por seguridad
  sliderContainer.innerHTML = '';

  // Generamos cada tarjeta dinámicamente
  productosDisponibles.forEach((producto, index) => {
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-lg-3 mb-4';

    // Etiqueta destacada alterna
    const badge = index % 3 === 0 ? '<span class="badge bg-danger position-absolute top-0 end-0 m-2 px-2 py-1 fs-6 rounded-pill">¡Destacado!</span>' : '';

    col.innerHTML = `
      <div class="card card-product h-100 shadow-sm border-0" style="border-radius: 15px; overflow: hidden;">
        <div class="position-relative overflow-hidden bg-dark">
            <img src="${producto.img}" class="card-img-top product-img opacity-75" alt="${producto.nombre}" style="height: 220px; object-fit: cover; transition: transform 0.4s ease, opacity 0.4s ease;">
            ${badge}
        </div>
        <div class="card-body d-flex flex-column text-center bg-white position-relative" style="z-index: 2; margin-top: -15px; border-radius: 15px 15px 0 0;">
          <h5 class="card-title fw-bold text-dark mt-2">${producto.nombre}</h5>
          <p class="card-text text-warning fs-4 fw-bold mb-4">$${producto.precio.toLocaleString('es-CL')}</p>
          <button class="btn btn-warning mt-auto btn-add fw-bold text-dark w-100 rounded-pill shadow-sm">
            Agregar al 🛒
          </button>
        </div>
      </div>
    `;

    // Evento para agregar al carrito
    const btnAdd = col.querySelector('.btn-add');
    btnAdd.addEventListener('click', () => {
      addToCart(producto);
      // Pequeña animación visual en el botón
      btnAdd.textContent = '¡Agregado! ✔️';
      btnAdd.classList.replace('btn-warning', 'btn-success');
      setTimeout(() => {
        btnAdd.textContent = 'Agregar al 🛒';
        btnAdd.classList.replace('btn-success', 'btn-warning');
      }, 1000);
    });

    // Eventos Hover para animar la imagen vía JS (manipulación del DOM)
    const imgElement = col.querySelector('.product-img');
    col.addEventListener('mouseenter', () => {
      imgElement.style.transform = 'scale(1.15)';
      imgElement.style.opacity = '1';
    });
    col.addEventListener('mouseleave', () => {
      imgElement.style.transform = 'scale(1)';
      imgElement.style.opacity = '0.85';
    });

    sliderContainer.appendChild(col);
  });
  
  // Limpiamos el contenedor de botones extra si existe, ya que mostramos todo el catálogo
  const btnContainer = document.getElementById('btn-container');
  if (btnContainer) btnContainer.innerHTML = '';
};