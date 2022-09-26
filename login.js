const STORAGE_KEY = "users-data";
const form = document.querySelector("#form");
const email = document.querySelector("#email");
const restOfForm = document.querySelector(".password-container");
const errorMsg = document.querySelector(".error-description");
const btn = document.querySelector(".continue-btn");
const password = document.querySelector("#password");
const userList = loadUser();

btn.addEventListener("click", () => {
  if (restOfForm.dataset.visible === "true") return;
  if (email.value.includes(".com" || (".COM" && "@"))) {
    if (!checkEmail()) {
      errorMsg.innerText = "Email not found";
      errorMsg.dataset.visible = "true";
      email.dataset.error = "true";
    } else {
      resetStates();
      restOfForm.dataset.visible = "true";
      email.readOnly = true;
    }
  } else {
    errorMsg.innerText = "Invalid email, try again";
    errorMsg.dataset.visible = "true";
    email.dataset.error = "true";
  }
});

form.addEventListener("submit", (e) => {
  console.log(password.value);
  if (!checkPassword()) {
    errorMsg.innerText = "Wrong password, try again.";
    errorMsg.dataset.visible = "true";
    e.preventDefault();
  } else {
    saveCurrentUser();
  }
});

function checkPassword() {
  return userList.find((user) => user.password === password.value);
}
function checkEmail() {
  return userList.find((user) => user.email === email.value);
}

function saveCurrentUser() {
  const currentUser = userList.find((user) => user.email === email.value);
  localStorage.setItem("current-user-news", JSON.stringify(currentUser));
}

function resetStates() {
  errorMsg.dataset.visible = "false";
  email.dataset.error = "false";
  errorMsg.innerText = " ";
}

function loadUser() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}
