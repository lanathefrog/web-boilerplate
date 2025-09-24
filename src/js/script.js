import { validUsers } from "./lab02.js";
console.log(validUsers.length);
console.log("validUsers IDs:", validUsers.map(u => u.id));


const teachersList = document.querySelector(".teachers-list");
const favouritesRow = document.querySelector(".favourites-row");
const viewModal = document.getElementById("viewModal");
const viewClose = document.querySelector(".view-close");

let favourites = validUsers.filter(u => u.favorite).map(u => u.id);

function createTeacherCard(user) {
    const card = document.createElement("div");
    card.classList.add("teacher-card");

    const avatarWrapper = document.createElement("div");
    avatarWrapper.classList.add("avatar-wrapper");

    if (user.picture_large) {
        const img = document.createElement("img");
        img.src = user.picture_large;
        img.alt = `${user.full_name} Photo`;
        avatarWrapper.appendChild(img);
    } else {
        avatarWrapper.classList.add("no-photo");
        const initials = document.createElement("span");
        initials.classList.add("initials");
        initials.textContent = user.full_name
            .split(" ")
            .map(w => w[0])
            .join(".") + ".";
        avatarWrapper.appendChild(initials);
    }

    const star = document.createElement("img");
    star.src = "images/Star 1.svg";
    star.alt = "Favorite Star";
    star.classList.add("favorite-star-icon");
    if (favourites.includes(user.id)) {
        star.classList.add("active");
    }
    star.addEventListener("click", e => {
        e.stopPropagation();
        toggleFavourite(user.id);
    });
    avatarWrapper.appendChild(star);

    const info = document.createElement("div");
    info.classList.add("teacher-info");
    info.innerHTML = `
        <h2>${user.full_name.replace(" ", "<br>")}</h2>
        <p class="field">${user.course}</p>
        <p class="country">${user.country}</p>
    `;

    card.appendChild(avatarWrapper);
    card.appendChild(info);

    card.addEventListener("click", () => showTeacherInfo(user));

    return card;
}

function renderTeachers(users) {
    console.log("Рендеримо викладачів:", users);
    teachersList.innerHTML = "";
    users.forEach(user => {
        console.log("Створюю картку для:", user.full_name);
        const card = createTeacherCard(user);
        teachersList.appendChild(card);
    });
    console.log("Загалом відмалювалося:", teachersList.children.length, "карток");
}


function renderFavourites() {
    favouritesRow.innerHTML = "";
    const favUsers = validUsers.filter(u => favourites.includes(u.id));
    console.log("Рендеримо favourites, знайдено користувачів:", favUsers);

    favUsers.forEach(user => {
        const card = createTeacherCard(user);
        favouritesRow.appendChild(card);
    });

    console.log("У favourites-row відмалювалось:", favouritesRow.children.length, "карток");
}


function toggleFavourite(userId) {
    console.log("favourites зараз:", favourites);
    if (favourites.includes(userId)) {
        favourites = favourites.filter(id => id !== userId);
        console.log("Прибираю з favourites:", userId);
    } else {
        favourites.push(userId);
        console.log("Додаю у favourites:", userId);
    }

    console.log("Поточний список favourites:", favourites);
    renderTeachers(validUsers);
    renderFavourites();
}


function showTeacherInfo(user) {
    document.getElementById("teacherPhoto").src = user.picture_large || "";
    document.getElementById("teacherName").textContent = user.full_name;
    document.getElementById("teacherSpeciality").textContent = user.course;
    document.getElementById("teacherLocation").textContent = `${user.city}, ${user.country}`;
    document.getElementById("teacherAgeGender").textContent = `${user.age} y.o., ${user.gender}`;
    document.getElementById("teacherEmail").textContent = user.email;
    document.getElementById("teacherPhone").textContent = user.phone;
    document.getElementById("teacherNotes").textContent = user.note || "";

    viewModal.style.display = "block";
}

viewClose.addEventListener("click", () => {
    viewModal.style.display = "none";
});

renderTeachers(validUsers);
renderFavourites();
