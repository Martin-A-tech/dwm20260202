import { addToCart } from './cart.js';

export const initSlider = () => {
  const sliderContainer = document.getElementById('product-slider-container');
  if (!sliderContainer) return;

  const productosDisponibles = [
    { id: 1, nombre: 'Pan Amasado Tradicional', precio: 1500, img: './img/pan_amasado.jpg' },
    { id: 2, nombre: 'Pan de Masa Madre', precio: 3500, img: './img/PanMasaMadre.jpg' },
    { id: 3, nombre: 'Croissant Francés', precio: 2000, img: './img/CroissantFrances.jpg' },
    { id: 4, nombre: 'Torta Tres Leches', precio: 12000, img: './img/Torta3leches.jpg' },
    { id: 5, nombre: 'Facturas Surtidas', precio: 4500, img: './img/Facturassurtidas.jpg' },
    { id: 6, nombre: 'Empanada de Pino', precio: 2500, img: './img/Empanada de pino.jpg' },
    { id: 7, nombre: 'Pan Integral y Semillas', precio: 2800, img: './img/Panintegralysemilla.jpg' },
    { id: 8, nombre: 'Berlín de Crema', precio: 1200, img: './img/Berlinesdecrema.jpg' }
  ];

  sliderContainer.innerHTML = '';

  productosDisponibles.forEach((producto, index) => {
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-lg-3 mb-4';

    const badge = index % 3 === 0 ? '<span class="badge bg-danger position-absolute top-0 end-0 m-2 px-2 py-1 fs-6 rounded-pill z-3">¡Destacado!</span>' : '';

    col.innerHTML = `
      <div class="card card-product h-100 shadow-sm border-0" style="border-radius: 15px; overflow: hidden;">
        <div class="position-relative overflow-hidden bg-white" style="height: 220px;">
            <img src="${producto.img}" class="card-img-top product-img w-100 h-100" alt="${producto.nombre}" style="object-fit: cover; transition: transform 0.4s ease;">
            ${badge}
        </div>
        <div class="card-body d-flex flex-column text-center bg-white position-relative" style="z-index: 2; border-radius: 15px 15px 0 0;">
          <h5 class="card-title fw-bold text-dark mt-2">${producto.nombre}</h5>
          <p class="card-text text-warning fs-4 fw-bold mb-4">$${producto.precio.toLocaleString('es-CL')}</p>
          <button class="btn btn-warning mt-auto btn-add fw-bold text-dark w-100 rounded-pill shadow-sm">
            Agregar al 🛒
          </button>
        </div>
      </div>
    `;

    const btnAdd = col.querySelector('.btn-add');
    btnAdd.addEventListener('click', () => {
      addToCart(producto);
      btnAdd.textContent = '¡Agregado! ✔️';
      btnAdd.classList.replace('btn-warning', 'btn-success');
      setTimeout(() => {
        btnAdd.textContent = 'Agregar al 🛒';
        btnAdd.classList.replace('btn-success', 'btn-warning');
      }, 1000);
    });

    const imgElement = col.querySelector('.product-img');
    col.addEventListener('mouseenter', () => {
      imgElement.style.transform = 'scale(1.15)';
    });
    col.addEventListener('mouseleave', () => {
      imgElement.style.transform = 'scale(1)';
    });

    sliderContainer.appendChild(col);
  });
};