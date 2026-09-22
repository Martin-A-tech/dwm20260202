import { updateCartIcon } from './modules/cart.js';
import { initSlider } from './modules/slider.js';
import { initCategories } from './modules/categories.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Actualizar el icono del carrito en el navbar (con datos de localStorage)
  updateCartIcon();
  
  // 2. Iniciar la inyección de productos (La Carta)
  initSlider();

  // 3. (Opcional) Iniciar filtros de categorías si los agregas a la vista
  initCategories();

  console.log('✅ Página de Carta inicializada correctamente.');
});