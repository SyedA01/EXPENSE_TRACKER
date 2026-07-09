// login.js
// Handles the Login form submission: sends credentials to the backend,
// and redirects to dashboard.html only if the API confirms they match.

// TODO: Replace with your actual backend endpoint (e.g. Django REST Framework route)
const API_BASE_URL = "https://expense-tracker-8bi2.onrender.com/";
const LOGIN_ENDPOINT = `${API_BASE_URL}/auth/login`;

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const rememberCheckbox = document.querySelector(".remember-me input[type='checkbox']");
  const loginBtn = document.querySelector(".btn-login");

  // Message element for errors/success, inserted just above the button
  const messageEl = document.createElement("p");
  messageEl.style.fontSize = "13px";
  messageEl.style.textAlign = "center";
  messageEl.style.marginBottom = "10px";
  loginBtn.parentNode.insertBefore(messageEl, loginBtn);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    messageEl.textContent = "";
    messageEl.style.color = "#d93025";

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      messageEl.textContent = "Please enter both email and password.";
      return;
    }

    const originalBtnText = loginBtn.textContent;
    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

    try {
      const response = await fetch(LOGIN_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));
      console.log(data);
      

      // --- Credentials did NOT match / request failed ---
      if (!response.ok) {
        const errorMsg =
          data.detail ||
          data.message ||
          data.non_field_errors?.[0] ||
          "Invalid email or password.";
        throw new Error(errorMsg);
      }

      // --- Credentials matched: backend returned a success response ---
      // Adjust these field names to whatever your DRF login view returns
      // (e.g. djoser/simplejwt typically return "access" and "refresh").
      const token = data.access_token;

      if (!token) {
        // Defensive check: a 200 OK with no token usually means the
        // response shape doesn't match what this code expects.
        throw new Error("Login succeeded but no auth token was returned. Check the API response shape.");
      }

      // "Remember me" checked -> persist across browser restarts (localStorage)
      // Unchecked -> only for this tab/session (sessionStorage)
    const storage = rememberCheckbox.checked
            ? localStorage
            : sessionStorage;

      // Save JWT
      storage.setItem("access_token", data.access_token);

      // Save logged-in user details
      storage.setItem(
          "user",
           JSON.stringify(data.user)
       );

       messageEl.style.color = "#1a7f37";
       messageEl.textContent = "Login successful! Redirecting...";

       setTimeout(() => {
            window.location.href = "dashboard.html";
     }, 800);
    } catch (err) {
      messageEl.style.color = "#d93025";
      messageEl.textContent = err.message || "Something went wrong. Please try again.";
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = originalBtnText;
    }
  });
});