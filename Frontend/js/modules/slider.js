import { addToCart } from './cart.js';

export const initSlider = async () => {
  const sliderContainer = document.getElementById('product-slider-container');
  if (!sliderContainer) return;

  sliderContainer.innerHTML = '<p class="text-center w-100 fw-bold text-warning">Cargando productos...</p>';

  try {
    // Trae los productos reales del Gateway
    const response = await fetch('http://localhost:8000/api/products');
    const productosDisponibles = await response.json();

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
        // OJO: Aquí se guarda el id REAL de MongoDB
        addToCart({ id: producto.id, nombre: producto.nombre, precio: producto.precio, img: producto.img });
        btnAdd.textContent = '¡Agregado! ✔️';
        btnAdd.classList.replace('btn-warning', 'btn-success');
        setTimeout(() => {
          btnAdd.textContent = 'Agregar al 🛒';
          btnAdd.classList.replace('btn-success', 'btn-warning');
        }, 1000);
      });

      sliderContainer.appendChild(col);
    });
  } catch (error) {
    console.error("Error al cargar productos:", error);
    sliderContainer.innerHTML = '<p class="text-danger w-100 text-center">Error al conectar con la panadería.</p>';
  }
};