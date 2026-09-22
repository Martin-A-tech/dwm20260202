export const initContactForm = () => {
  const contactForm = document.getElementById('contact-form');
  const contactName = document.getElementById('contact-name');
  const contactEmail = document.getElementById('contact-email');
  const contactMessage = document.getElementById('contact-message');

  if (!contactForm) return;

  [contactName, contactEmail, contactMessage].forEach(input => {
    if(input) {
      input.addEventListener('input', () => {
        input.classList.remove('is-invalid');
      });
    }
  });

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    try {
      const nombreValue = contactName.value.trim();
      const emailValue = contactEmail.value.trim();
      const mensajeValue = contactMessage.value.trim();

      if (nombreValue === '') {
        contactName.classList.add('is-invalid');
        throw new Error('El nombre no puede estar vacío.');
      }
      if (!emailValue.includes('@') || !emailValue.includes('.')) {
        contactEmail.classList.add('is-invalid');
        throw new Error('Debes ingresar un correo electrónico válido.');
      }
      if (mensajeValue.length < 10) {
        contactMessage.classList.add('is-invalid');
        throw new Error('El mensaje debe tener al menos 10 caracteres.');
      }

      contactForm.innerHTML = `
        <div class="alert alert-success text-center p-5 shadow-sm rounded-4 border-0" style="background-color: #d1e7dd;">
          <h2 class="fw-bold mb-3 text-success">¡Mensaje Enviado! 🥐</h2>
          <p class="fs-5 text-dark mb-4">
            Gracias <strong>${nombreValue}</strong>. Hemos recibido tu consulta y te responderemos a <strong>${emailValue}</strong> lo antes posible.
          </p>
          <button class="btn btn-success rounded-pill px-4 py-2" onclick="location.reload()">
            Enviar otro mensaje
          </button>
        </div>
      `;

    } catch (error) {
      alert(`❌ Por favor corrige lo siguiente:\n${error.message}`);
    }
  });
};