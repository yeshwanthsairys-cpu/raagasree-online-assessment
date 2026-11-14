
const API_URL = "https://script.google.com/macros/s/AKfycbyzutEAMnW_97VZpPvGqKGiZa3psQHwUE_AB3Yxvby1f0l6APEE7gWnGMt20wGkHIGs/exec";

const STUDENT_TOKEN_KEY = "RAAGASREE_STUDENT_TOKEN";
const STUDENT_DATA_KEY = "RAAGASREE_STUDENT_DATA";

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

async function studentApi(payload) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Server returned HTTP " + response.status);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "Login failed.");
  }

  return data;
}

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const hallTicketNumber = document
    .getElementById("hallTicket")
    .value.trim()
    .toUpperCase();

  const password = document
    .getElementById("password")
    .value.trim();

  const loginButton = loginForm.querySelector(
    'button[type="submit"]'
  );

  if (!hallTicketNumber || !password) {
    loginMessage.textContent =
      "Please enter your Hall Ticket Number and password.";
    return;
  }

  loginButton.disabled = true;
  loginButton.textContent = "VERIFYING...";
  loginMessage.textContent = "Verifying your details...";
  loginMessage.className = "message";

  sessionStorage.removeItem(STUDENT_TOKEN_KEY);
  sessionStorage.removeItem(STUDENT_DATA_KEY);

  try {
    const data = await studentApi({
      action: "studentLogin",
      hallTicketNumber: hallTicketNumber,
      password: password
    });

    if (!data.token || !data.student) {
      throw new Error("Invalid login response from the server.");
    }

    sessionStorage.setItem(STUDENT_TOKEN_KEY, data.token);

    sessionStorage.setItem(
      STUDENT_DATA_KEY,
      JSON.stringify(data.student)
    );

    loginMessage.textContent =
      "Login successful! Redirecting to your dashboard...";

    loginMessage.className = "message success";

    loginButton.textContent = "LOGIN SUCCESSFUL";

    window.location.href = "exam.html";

  } catch (error) {
    loginMessage.textContent =
      error.message || "Unable to connect. Please try again.";

    loginMessage.className = "message error";

    loginButton.disabled = false;
    loginButton.textContent = "CONTINUE TO LOGIN →";
  }
});
