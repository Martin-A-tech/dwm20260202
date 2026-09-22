import { updateCartIcon } from './modules/cart.js';
import { initContactForm } from './modules/contactForm.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mantener el número del carrito sincronizado en el Navbar
  updateCartIcon();
  
  // 2. Iniciar la lógica de validación (try/catch) del formulario
  initContactForm();

  console.log('✅ Página de Contacto inicializada correctamente.');
});