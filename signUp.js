const STORAGE_KEY = "users-data";
const form = document.querySelector(".form");
const email = document.querySelector("#email");
const restOfForm = document.querySelector(".password-container");
const errorMsg = document.querySelector(".error-description");
const btn = document.querySelector(".continue-btn");
const firstName = document.querySelector("#first-name");
const lastName = document.querySelector("#last-name");
const password = document.querySelector("#password");

//deberiamos hacer mas form validation pero es funcional esto

btn.addEventListener("click", () => {
  const userList = loadUser();

  if (restOfForm.dataset.visible === "true") return;
  if (email.value.includes(".com" || (".COM" && "@"))) {
    if (userList.find((user) => user.email === email.value)) {
      errorMsg.innerText = "Email alredy in use.";
      errorMsg.dataset.visible = "true";
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

form.addEventListener("submit", () => {
  createNewUser();
});

function resetStates() {
  errorMsg.dataset.visible = "false";
  email.dataset.error = "false";
  errorMsg.innerText = " ";
  firstName.value = "";
  lastName.value = "";
}
function loadUser() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}
function createNewUser() {
  const userList = loadUser();

  const newUser = {
    name: firstName.value,
    lastname: lastName.value,
    password: password.value,
    email: email.value,
  };
  userList.push(newUser);
  saveUsers(userList);
}

function saveUsers(users) {
  if (users == []) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}
