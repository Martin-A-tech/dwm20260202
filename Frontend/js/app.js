import { updateCartIcon } from './modules/cart.js';
import { initOffers } from './modules/offers.js';
import { initSlider } from './modules/slider.js';
import { initCatalog } from './modules/catalog.js';
import { initLoginForm } from './modules/loginForm.js';
import { initCategories } from './modules/categories.js';

document.addEventListener('DOMContentLoaded', () => {
  updateCartIcon();
  initOffers();
  initSlider(); // Carga productos si hay contenedor en el index
  initCatalog();
  initLoginForm();
  initCategories();
});