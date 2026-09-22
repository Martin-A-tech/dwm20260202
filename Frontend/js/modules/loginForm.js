export const initLoginForm = () => {
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  if (!loginForm || !emailInput || !passwordInput) return;

  emailInput.addEventListener('focus', () => {
    emailInput.style.border = '2px solid #FFC107';
    emailInput.style.boxShadow = '0 0 5px rgba(255, 193, 7, 0.5)';
  });

  emailInput.addEventListener('blur', () => {
    emailInput.style.border = '1px solid #ced4da';
    emailInput.style.boxShadow = 'none';
  });

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    try {
      const emailValue = emailInput.value.trim();
      const passwordValue = passwordInput.value;

      if (!emailValue.includes('@') || !emailValue.includes('.')) {
        throw new Error('El correo electrónico debe ser válido (ejemplo@correo.cl).');
      }
      if (passwordValue.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres.');
      }

      alert(`¡Bienvenido a Dulce Hogar!\nSesión iniciada con: ${emailValue}`);

      const modalElement = document.getElementById('loginModal');
      if (modalElement && window.bootstrap) {
        const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
        modalInstance.hide();
      }

      loginForm.reset();

    } catch (error) {
      alert(`❌ Error de validación: ${error.message}`);
      console.error('Error capturado:', error);
    }
  });
};