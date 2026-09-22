import { updateCartIcon } from './modules/cart.js';
import { initContactForm } from './modules/contactForm.js';

document.addEventListener('DOMContentLoaded', () => {
  updateCartIcon();
  initContactForm();
});