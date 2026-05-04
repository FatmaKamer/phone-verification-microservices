const API_URL = "http://localhost:3000";

function showAlert(message, type = "error") {
  const alertBox = document.getElementById("alert-box");
  const alertText = document.getElementById("alert-text");

  alertBox.classList.remove("hidden");
  alertText.innerText = message;

  if (type === "success") {
    alertBox.style.background = "#d4f8d4";
    alertBox.style.borderLeft = "5px solid #38b000";
  } else {
    alertBox.style.background = "#ffccd5";
    alertBox.style.borderLeft = "5px solid #ff4d6d";
  }
}

function closeAlert() {
  document.getElementById("alert-box").classList.add("hidden");
}

async function submitForm() {
  closeAlert();

  const phone = document.getElementById("phone").value;
  const name = document.getElementById("name").value;
  const surname = document.getElementById("surname").value;
  const email = document.getElementById("email").value;

  if (!phone || !name || !surname || !email) {
    showAlert("Lütfen tüm alanları doldurun!");
    return;
  }

  const validateRes = await fetch(`${API_URL}/api/phone/validate`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ number: phone })
  });

  const validateData = await validateRes.json();

  if (!validateRes.ok) {
    showAlert(validateData.error);
    return;
  }

  const regRes = await fetch(`${API_URL}/api/registration`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      name: name,
      email: email,
      phone: phone + "", 
      surname: surname
    })
  });

  const regData = await regRes.json();

  if (!regRes.ok) {
    showAlert(regData.message);
    return;
  }

  showAlert("Kayıt başarılı!", "success");
}

async function loadRegistrations() {
  const res = await fetch(`${API_URL}/api/registration/list`);
  const data = await res.json();

  const tbody = document.querySelector("#records-table tbody");
  tbody.innerHTML = "";

  data.data.forEach(item => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${item.id}</td>
      <td>${item.name}</td>
      <td>${item.surname}</td>
      <td>${item.email}</td>
      <td>${item.phone}</td>
    `;

    tbody.appendChild(row);
  });
}