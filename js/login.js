document.addEventListener("DOMContentLoaded", () => {
  const loginScreen = document.getElementById("financeLogin");
  const app = document.getElementById("financeApp");
  const form = document.getElementById("financeLoginForm");
  const emailInput = document.getElementById("financeLoginEmail");
  const passwordInput = document.getElementById("financeLoginPassword");
  const togglePassword = document.getElementById("financeTogglePassword");
  const errorMessage = document.getElementById("financeLoginError");

  // Credenciais de demonstração
  const DEMO_EMAIL = "demo@kompany.code";
  const DEMO_PASSWORD = "Kompany@2026";

  // Mantém a plataforma oculta até o acesso
  if (app) {
    app.style.display = "none";
  }

  if (loginScreen) {
    loginScreen.hidden = false;
    loginScreen.style.display = "flex";
  }

  // Mostrar ou ocultar senha
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
      const showing = passwordInput.type === "text";

      passwordInput.type = showing ? "password" : "text";
      togglePassword.textContent = showing ? "Mostrar" : "Ocultar";
      togglePassword.setAttribute(
        "aria-label",
        showing ? "Mostrar senha" : "Ocultar senha"
      );
    });
  }

  // Validar acesso
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const email = emailInput.value.trim().toLowerCase();
      const password = passwordInput.value;

      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        errorMessage.hidden = true;
        loginScreen.style.display = "none";
        loginScreen.hidden = true;

        app.style.display = "block";

        // Inicializa a plataforma sem alterar os dados existentes
        window.dispatchEvent(new CustomEvent("financeLoginSuccess"));
      } else {
        errorMessage.hidden = false;
        passwordInput.focus();
      }
    });
  }
});