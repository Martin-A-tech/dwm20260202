import { initCart } from './modules/cart.js';
import { initOffers } from './modules/offers.js';
import { initSlider } from './modules/slider.js';
import { initCatalog } from './modules/catalog.js';
import { initLoginForm } from './modules/loginForm.js';
import { initContactForm } from './modules/contactForm.js';
import { initCategories } from './modules/categories.js';

document.addEventListener('DOMContentLoaded', () => {
  initCart();
  initOffers();
  initSlider();
  initCatalog();
  initLoginForm();
  initContactForm();
  initCategories();

  console.log('✅ Script de Dulce Hogar cargado e inicializado por módulos correctamente.');
});