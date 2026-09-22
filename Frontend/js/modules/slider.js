import { updateCart } from './cart.js';

export const initSlider = () => {
  const sliderContainer = document.getElementById('product-slider-container');
  if (!sliderContainer) return;

  const btnAgregarProducto = document.createElement('button');
  btnAgregarProducto.textContent = '+ Agregar Producto Nuevo';
  btnAgregarProducto.className = 'btn btn-outline-dark mt-3 w-100';
  btnAgregarProducto.setAttribute('type', 'button');
  btnAgregarProducto.setAttribute('title', 'Agrega un producto dinámicamente al slider');

  sliderContainer.parentNode.appendChild(btnAgregarProducto);

  const productosDisponibles = [
    'Pan Integral', 'Torta Tres Leches', 'Empanada de Queso',
    'Berlín de Crema', 'Milhojas', 'Pan de Pascua'
  ];
  let productoIndex = 0;

  btnAgregarProducto.addEventListener('click', () => {
    if (productoIndex >= productosDisponibles.length) {
      alert('Ya no hay más productos disponibles para agregar.');
      return;
    }

    const nuevoProducto = document.createElement('div');
    const nombreProducto = productosDisponibles[productoIndex];

    nuevoProducto.setAttribute('class', 'slider-item');
    nuevoProducto.setAttribute('title', nombreProducto);
    nuevoProducto.textContent = nombreProducto;
    nuevoProducto.style.backgroundColor = '#FFC107';
    nuevoProducto.style.border = '2px solid #333';
    nuevoProducto.style.cursor = 'pointer';

    nuevoProducto.addEventListener('click', () => {
      updateCart();
      alert(`Agregaste "${nombreProducto}" al carrito.`);
    });

    sliderContainer.appendChild(nuevoProducto);
    productoIndex++;
  });
};