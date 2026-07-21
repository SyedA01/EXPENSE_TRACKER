// signup.js
// Handles the Register form submission and sends credentials to the backend API.

// TODO: Replace with your actual backend endpoint (e.g. Django REST Framework route)
const API_BASE_URL = "https://expense-tracker-8bi2.onrender.com"; // <-- update to your deployed backend URL
const REGISTER_ENDPOINT = `${API_BASE_URL}/auth/register`;

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const fullNameInput = document.getElementById("fullname");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const termsCheckbox = document.querySelector(".terms-row input[type='checkbox']");
  const registerBtn = document.querySelector(".btn-register");

  // Create a message element to show errors/success (inserted above the button)
  const messageEl = document.createElement("p");
  messageEl.style.fontSize = "13px";
  messageEl.style.textAlign = "center";
  messageEl.style.marginBottom = "10px";
  registerBtn.parentNode.insertBefore(messageEl, registerBtn);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    messageEl.textContent = "";
    messageEl.style.color = "#d93025";

    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const agreedToTerms = termsCheckbox.checked;

    // --- Client-side validation ---
    if (!fullName || !email || !password || !confirmPassword) {
      messageEl.textContent = "Please fill in all fields.";
      return;
    }

    if (!isValidEmail(email)) {
      messageEl.textContent = "Please enter a valid email address.";
      return;
    }

    if (password.length < 8) {
      messageEl.textContent = "Password must be at least 8 characters long.";
      return;
    }

    if (password !== confirmPassword) {
      messageEl.textContent = "Passwords do not match.";
      return;
    }

    if (!agreedToTerms) {
      messageEl.textContent = "You must agree to the Terms & Conditions.";
      return;
    }

    // --- Send to API ---
    const originalBtnText = registerBtn.textContent;
    registerBtn.disabled = true;
    registerBtn.textContent = "Registering...";

    try {
      const response = await fetch(REGISTER_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: fullName,
          email: email,
          password: password,
        }),
      });

      console.log("Response status:", response.status, response.statusText);

      const rawText = await response.clone().text();
      console.log("Raw response body:", rawText);

      const data = await response.json().catch(() => ({}));
      console.log("Parsed response data:", data);

      if (!response.ok) {
        // Surface backend validation errors (e.g. "email already exists")
        const errorMsg =
          data.detail ||
          data.message ||
          (data.email && data.email[0]) ||
          "Registration failed. Please try again.";
        throw new Error(errorMsg);
      }

      // --- Success ---
      messageEl.style.color = "#1a7f37";
      messageEl.textContent = "Account created successfully! Redirecting to login...";

      // Optional: store returned token if backend issues one on signup
      if (data.token || data.access) {
        localStorage.setItem("authToken", data.token || data.access);
      }

      form.reset();

      console.log("Registration succeeded, redirecting to login.html in 1.5s...");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
    } catch (err) {
      console.error("Registration error:", err);
      messageEl.style.color = "#d93025";
      messageEl.textContent = err.message || "Something went wrong. Please try again.";
    } finally {
      registerBtn.disabled = false;
      registerBtn.textContent = originalBtnText;
    }
  });
});

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}