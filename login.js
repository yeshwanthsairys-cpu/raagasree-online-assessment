
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

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      "Server HTTP " + response.status + ": " + responseText
    );
  }

  let data;

  try {
    data = JSON.parse(responseText);
  } catch (error) {
    throw new Error(
      "Server returned an invalid response. Check Apps Script deployment."
    );
  }

  if (!data.success) {
    throw new Error(
      data.message || data.error || "Login verification failed."
    );
  }

  return data;
}

loginForm.addEventListener("submit", async function(event) {
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
    loginMessage.className = "message error";
    return;
  }

  loginButton.disabled = true;
  loginButton.textContent = "VERIFYING...";

  loginMessage.textContent = "Verifying your details...";
  loginMessage.className = "message";

  localStorage.removeItem(STUDENT_TOKEN_KEY);
  localStorage.removeItem(STUDENT_DATA_KEY);

  sessionStorage.removeItem(STUDENT_TOKEN_KEY);
  sessionStorage.removeItem(STUDENT_DATA_KEY);

  try {
    const data = await studentApi({
      action: "studentLogin",
      hallTicketNumber: hallTicketNumber,
      password: password
    });

    console.log("Student login response:", data);

    if (!data.token) {
      throw new Error(
        "Login response does not contain a student token."
      );
    }

    if (!data.student) {
      throw new Error(
        "Login response does not contain student details."
      );
    }

    localStorage.setItem(
      STUDENT_TOKEN_KEY,
      data.token
    );

    localStorage.setItem(
      STUDENT_DATA_KEY,
      JSON.stringify(data.student)
    );

    // Verify that the login information was saved.
    const savedToken = localStorage.getItem(STUDENT_TOKEN_KEY);
    const savedStudent = localStorage.getItem(STUDENT_DATA_KEY);

    if (!savedToken || !savedStudent) {
      throw new Error(
        "Unable to save login details in this browser."
      );
    }

    loginMessage.textContent =
      "Login successful! Opening your examination dashboard...";

    loginMessage.className = "message success";

    loginButton.textContent = "LOGIN SUCCESSFUL";

    window.location.href = "./exam.html";

  } catch (error) {
    console.error("STUDENT LOGIN ERROR:", error);

    loginMessage.textContent =
      "LOGIN ERROR: " +
      (error.message || String(error));

    loginMessage.className = "message error";

    loginButton.disabled = false;
    loginButton.textContent = "CONTINUE TO LOGIN →";
  }
});
