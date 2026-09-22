export const initContactForm = () => {
  const contactForm = document.getElementById('contact-form');
  const contactName = document.getElementById('contact-name');
  const contactEmail = document.getElementById('contact-email');
  const contactMessage = document.getElementById('contact-message');

  if (!contactForm) return;

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    try {
      const nombreValue = contactName.value.trim();
      const emailValue = contactEmail.value.trim();
      const mensajeValue = contactMessage.value.trim();

      if (nombreValue === '') {
        throw new Error('El nombre no puede estar vacío.');
      }
      if (!emailValue.includes('@')) {
        throw new Error('Debes ingresar un correo electrónico válido.');
      }
      if (mensajeValue.length < 10) {
        throw new Error('El mensaje debe tener al menos 10 caracteres.');
      }

      alert(`¡Gracias ${nombreValue}! Hemos recibido tu mensaje y te contactaremos a ${emailValue}.`);
      contactForm.reset();

    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    }
  });
};