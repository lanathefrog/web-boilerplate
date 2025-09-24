import { validUsers } from "./lab02.js";

// === Глобальні змінні ===
let teachers = [...validUsers];
let favorites = new Set();

// === Рендер списку викладачів ===
function renderTeachers(list = teachers) {
    const container = document.getElementById("teachers-list");
    container.innerHTML = "";

    list.forEach((t) => {
        const card = document.createElement("div");
        card.className = "teacher-card";

        card.innerHTML = `
      <div class="avatar">${t.full_name[0]}</div>
      <div class="info">
        <h3>${t.full_name}</h3>
        <p>${t.course}</p>
        <p>${t.country}, ${t.age} років</p>
      </div>
      <div class="actions">
        <button class="details-btn">Детальніше</button>
        <button class="fav-btn">${favorites.has(t.id) ? "⭐" : "☆"}</button>
      </div>
    `;

        // Деталі
        card.querySelector(".details-btn").addEventListener("click", () => {
            showDetails(t);
        });

        // Додавання у вибрані
        card.querySelector(".fav-btn").addEventListener("click", () => {
            if (favorites.has(t.id)) {
                favorites.delete(t.id);
            } else {
                favorites.add(t.id);
            }
            renderTeachers();
        });

        container.appendChild(card);
    });
}

// === Модалка деталей ===
function showDetails(t) {
    const modal = document.getElementById("teacher-details");
    modal.querySelector(".modal-body").innerHTML = `
    <h2>${t.full_name}</h2>
    <p><b>Курс:</b> ${t.course}</p>
    <p><b>Країна:</b> ${t.country}</p>
    <p><b>Вік:</b> ${t.age}</p>
    <p><b>Коментар:</b> ${t.note || "-"}</p>
  `;
    modal.style.display = "block";
}

document.getElementById("close-details").addEventListener("click", () => {
    document.getElementById("teacher-details").style.display = "none";
});

// === Фільтрація ===
function applyFilters() {
    let filtered = [...teachers];

    const country = document.getElementById("filter-country").value;
    const gender = document.getElementById("filter-gender").value;
    const favOnly = document.getElementById("filter-fav").checked;
    const age = document.getElementById("filter-age").value;

    if (country) filtered = filtered.filter((t) => t.country === country);
    if (gender) filtered = filtered.filter((t) => t.gender === gender);
    if (favOnly) filtered = filtered.filter((t) => favorites.has(t.id));
    if (age) filtered = filtered.filter((t) => t.age == age);

    renderTeachers(filtered);
}

document.querySelectorAll(".filter").forEach((el) => {
    el.addEventListener("input", applyFilters);
});

// === Сортування таблиці статистики ===
document.querySelectorAll("#stats-table th").forEach((th) => {
    th.addEventListener("click", () => {
        const key = th.dataset.sort;
        teachers.sort((a, b) => {
            if (typeof a[key] === "string") {
                return a[key].localeCompare(b[key]);
            } else {
                return a[key] - b[key];
            }
        });
        renderTeachers();
        renderStats();
    });
});

// === Пошук ===
document.getElementById("search").addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = teachers.filter(
        (t) =>
            t.full_name.toLowerCase().includes(q) ||
            (t.note && t.note.toLowerCase().includes(q)) ||
            t.age.toString().includes(q)
    );
    renderTeachers(filtered);
});

// === Додавання викладача ===
document.getElementById("add-teacher-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    const newTeacher = {
        id: Date.now(),
        full_name: form.full_name.value,
        course: form.course.value,
        country: form.country.value,
        gender: form.gender.value,
        b_day: form.b_day.value,
        age: new Date().getFullYear() - new Date(form.b_day.value).getFullYear(),
        note: form.note.value,
    };
    teachers.push(newTeacher);
    renderTeachers();
    form.reset();
    document.getElementById("teach_add_popup").style.display = "none";
});

// === Рендер статистики ===
function renderStats() {
    const tbody = document.querySelector("#stats-table tbody");
    tbody.innerHTML = "";
    teachers.forEach((t) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td>${t.full_name}</td>
      <td>${t.course}</td>
      <td>${t.age}</td>
      <td>${t.b_day}</td>
      <td>${t.country}</td>
    `;
        tbody.appendChild(tr);
    });
}

// === Старт ===
renderTeachers();
renderStats();
