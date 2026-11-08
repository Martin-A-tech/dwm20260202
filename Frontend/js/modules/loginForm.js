export const initLoginForm = () => {
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  if (!loginForm || !emailInput || !passwordInput) return;

  // Efectos visuales que ya tenías
  emailInput.addEventListener('focus', () => {
    emailInput.style.border = '2px solid #f59e0b';
    emailInput.style.boxShadow = '0 0 5px rgba(245, 158, 11, 0.5)';
  });

  emailInput.addEventListener('blur', () => {
    emailInput.style.border = '1px solid #ced4da';
    emailInput.style.boxShadow = 'none';
  });

  // Lógica de Login Real conectada al API Gateway
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value;

    try {
      if (!emailValue.includes('@') || !emailValue.includes('.')) {
        throw new Error('El correo electrónico debe ser válido.');
      }
      if (passwordValue.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres.');
      }

      // Petición al Gateway (Puerto 8000)
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: emailValue, password: passwordValue })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Credenciales incorrectas');
      }

      // Guardamos el token y el correo para usarlos en el carrito
      localStorage.setItem('dulceHogarToken', data.access_token);
      localStorage.setItem('dulceHogarEmail', emailValue);

      alert(`¡Bienvenido a Dulce Hogar!\nSesión iniciada como: ${data.rol}`);

      const modalElement = document.getElementById('loginModal');
      if (modalElement && window.bootstrap) {
        const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
        modalInstance.hide();
      }

      loginForm.reset();

    } catch (error) {
      alert(`Error de acceso: ${error.message}`);
    }
  });
};