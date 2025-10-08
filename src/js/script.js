import {sortUsers, generateID, fetchMoreUsers} from "./functions.js";
const _ = window._;


const teachersList = document.querySelector(".teachers-list");
const favouritesRow = document.querySelector(".favourites-row");
const viewModal = document.getElementById("viewModal");
const viewClose = document.querySelector(".view-close");
const filtersForm = document.querySelector(".filters");


let validUsers = [];
let favourites = [];

export function initApp(users) {
    validUsers = users;
    favourites = validUsers.filter(u => u.favorite).map(u => u.id);
    initFilters();
    renderTeachers(validUsers);
    renderFavourites();
    renderStatisticsWithPagination(validUsers);
}

const loadMoreBtn = document.getElementById("load-more-btn");

loadMoreBtn.addEventListener("click", async () => {
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = "Завантаження...";

    const newUsers = await fetchMoreUsers();
    if (newUsers.length > 0) {
        renderTeachers(applyFilters());
        const sortedUsers = sortUsers(getFilteredAndSearchedUsers(), getCurrentSortKey(), getCurrentSortOrder());
        renderStatisticsWithPagination(sortedUsers);
        renderFavourites();
    } else {
        showToast("Більше користувачів немає", "info");
    }

    loadMoreBtn.disabled = false;
    loadMoreBtn.textContent = "Далі";
});


viewClose.addEventListener("click", () => {
    viewModal.style.display = "none";
});

viewModal.addEventListener("click", (e) => {
    if (e.target === viewModal) {
        viewModal.style.display = "none";
    }
});


renderTeachers(applyFilters());
renderFavourites();

function createTeacherCard(user) {
    const card = document.createElement("div");
    card.classList.add("teacher-card");
    card.dataset.id = user.id;

    const avatarWrapper = document.createElement("div");
    avatarWrapper.classList.add("avatar-wrapper");

    if (user.picture_large) {
        const img = document.createElement("img");
        img.src = user.picture_large;
        img.alt = `${user.full_name} Photo`;
        avatarWrapper.appendChild(img);
    } else {
        avatarWrapper.classList.add("no-photo");
        console.log("No photo for user:", user.id, user.full_name);
        avatarWrapper.style.backgroundColor = user.bg_color;
        const initials = document.createElement("span");
        initials.classList.add("initials");
        initials.textContent = user.full_name
            .split(" ")
            .map(w => w[0])
            .join(".") + ".";
        avatarWrapper.appendChild(initials);
    }

    const star = document.createElement("img");
    star.src = favourites.includes(user.id) ? "images/Star 1.svg" : "images/Star 2.svg";
    star.alt = "Favorite Star";
    star.classList.add("favorite-star-icon");

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

    return card;
}

teachersList.addEventListener("click", e => {
    const card = e.target.closest(".teacher-card");
    if (!card) return;

    const userId = card.dataset.id;
    const user = validUsers.find(u => u.id === userId);
    if (!user) return;

    if (e.target.classList.contains("favorite-star-icon")) {
        e.stopPropagation();
        toggleFavourite(userId);
        return;
    }

    showTeacherInfo(user);
});

favouritesRow.addEventListener("click", e => {
    const card = e.target.closest(".teacher-card");
    if (!card) return;

    const userId = card.dataset.id;
    const user = validUsers.find(u => u.id === userId);
    if (!user) return;

    if (e.target.classList.contains("favorite-star-icon")) {
        e.stopPropagation();
        toggleFavourite(userId);
        return;
    }

    showTeacherInfo(user);
});


export function renderTeachers(users) {
    teachersList.innerHTML = "";
    users.forEach(user => {
        const card = createTeacherCard(user);
        teachersList.appendChild(card);
    });
    console.log("Відмалювалося:", teachersList.children.length, "карток");
}

function filterUsers(users) {
    const ageVal = document.getElementById("ageFilter").value;
    const countryVal = document.getElementById("countryFilter").value;
    const genderVal = document.getElementById("genderFilter").value;
    const onlyPhoto = document.getElementById("photoFilter").checked;
    const onlyFav = document.getElementById("favFilter").checked;

    return _.filter(users, user => {
        if (ageVal) {
            const [min, maxStr] = ageVal.split("-");
            const minNum = _.toNumber(min);
            const maxNum = maxStr === "Infinity" ? Infinity : _.toNumber(maxStr);
            if (user.age < minNum || user.age > maxNum) return false;
        }
        if (countryVal && user.country !== countryVal) return false;
        if (genderVal && genderVal !== "any" && _.toLower(user.gender) !== _.toLower(genderVal)) return false;
        if (onlyPhoto && !user.picture_large) return false;
        if (onlyFav && !_.includes(favourites, user.id)) return false;
        return true;
    });
}



function renderFavourites(usersToShow = validUsers) {
    favouritesRow.innerHTML = "";
    const favUsers = usersToShow.filter(u => favourites.includes(u.id));
    favUsers.forEach(user => {
        const card = createTeacherCard(user);
        favouritesRow.appendChild(card);
    });
}


function toggleFavourite(userId) {
    if (isFavourite(userId)) {
        favourites = favourites.filter(id => id !== userId);
        console.log(`Видалено з улюблених: ${userId}`);
        showToast("Викладача видалено з улюблених", "error");
    } else {
        favourites.push(userId);
        console.log(`Додано в улюблені: ${userId}`);
        showToast("Викладача додано в улюблені", "success");
    }

    updateAllStars();
    renderFavourites(getFilteredAndSearchedUsers());
}


function initFilters() {
    const ageRanges = [
        {label: "18–24", min: 18, max: 24},
        {label: "25–30", min: 25, max: 30},
        {label: "31–35", min: 31, max: 35},
        {label: "36–40", min: 36, max: 40},
        {label: "41–50", min: 41, max: 50},
        {label: "51+", min: 51, max: Infinity}
    ];

    const ageSelect = document.getElementById("ageFilter");
    ageRanges.forEach(r => {
        const opt = document.createElement("option");
        opt.value = `${r.min}-${r.max}`;
        opt.textContent = r.label;
        ageSelect.appendChild(opt);
    });

    const countries = [...new Set(validUsers.map(u => u.country).filter(Boolean))].sort();
    const countrySelect = document.getElementById("countryFilter");
    countries.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        countrySelect.appendChild(opt);
    });

    document.querySelector(".filters").addEventListener("change", () => {
        const filtered = filterUsers(validUsers);
        renderTeachers(filtered);
        renderStatisticsWithPagination(filtered);
        renderFavourites(filtered);


        if (currentStatsMode === "chart") {
            renderStatsChart(filtered);
        }

    });
}

function getFilteredAndSearchedUsers() {
    const filteredUsers = applyFilters();
    const query = searchInput.value.trim().toLowerCase();
    if (!query) return filteredUsers;

    return filteredUsers.filter(user =>
        user.full_name.toLowerCase().includes(query) ||
        user.note.toLowerCase().includes(query) ||
        user.age.toString() === query
    );


}


function updateAllStars() {
    document.querySelectorAll(".teacher-card").forEach(card => {
        const userId = card.dataset.id;
        const star = card.querySelector(".favorite-star-icon");
        if (isFavourite(userId)) {
            star.src = "images/Star 1.svg";
        } else {
            star.src = "images/Star 2.svg";
        }
    });

    const modalStar = document.getElementById("modalStar");
    if (modalStar && modalStar.dataset.id) {
        if (isFavourite(modalStar.dataset.id)) {
            modalStar.src = "images/Star 1.svg";
        } else {
            modalStar.src = "images/Star 2.svg";
        }
    }
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

    const daysLeft = daysUntilBirthday(user.b_date);


    document.getElementById("teacherBirthdayCountdown").textContent =
        daysLeft === 0
            ? "Today is the birthday!"
            : `${daysLeft} days left`;


    const modalStar = document.getElementById("modalStar");
    modalStar.dataset.id = user.id;
    modalStar.src = isFavourite(user.id) ? "images/Star 1.svg" : "images/Star 2.svg";

    modalStar.onclick = (e) => {
        e.stopPropagation();
        toggleFavourite(user.id);
    };

    // LEAFLET MAP
    const mapContainer = document.getElementById("teacherMap");
    mapContainer.style.display = "none";
    if (!window._leafletMapInstance) {
        window._leafletMapInstance = null;
    }
    let map = window._leafletMapInstance;

    function initMap(lat, lng) {

        if (map) {
            map.remove();
            map = null;
            window._leafletMapInstance = null;
        } else {
        }

        const container = document.getElementById("teacherMap");
        if (!container) {
            return;
        }

        map = L.map(container).setView([lat, lng], 6);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
        }).addTo(map);

        L.marker([lat, lng])
            .addTo(map)
            .bindPopup(`${user.full_name} — ${user.city}, ${user.country}`)
            .openPopup();

        window._leafletMapInstance = map;
    }

    const toggleMapBtn = document.getElementById("toggleMap");
    toggleMapBtn.onclick = () => {

        if (mapContainer.style.display === "none") {
            mapContainer.style.display = "block";
            const lat = parseFloat(user.coordinates?.latitude) || 50.4501;
            const lng = parseFloat(user.coordinates?.longitude) || 30.5234;
            console.log("➡️ Opening map for:", user.full_name);
            initMap(lat, lng);
            setTimeout(() => {
                if (map) {
                    map.invalidateSize();
                }
            }, 200);
        } else {
            mapContainer.style.display = "none";
        }
    };


    viewModal.style.display = "block";
}

viewClose.addEventListener("click", () => viewModal.style.display = "none");

function applyFilters() {
    const formData = new FormData(filtersForm);
    const filters = {};

    const ageVal = formData.get("age");
    if (ageVal) {
        const [min, max] = ageVal.split("-").map(Number);
        filters.age = {min, max};
    }

    const gender = formData.get("sex");
    if (gender) {
        filters.gender = gender.charAt(0).toUpperCase() + gender.slice(1);
    }

    if (formData.get("only-favourites")) {
        filters.id = favourites;
    }

    if (formData.get("only-photo")) {
        filters.picture_large = true;
    }


    return validUsers.filter(user => {
        if (filters.age) {
            if (user.age < filters.age.min || user.age > filters.age.max) return false;
        }
        if (filters.gender && user.gender !== filters.gender) return false;
        if (filters.id && filters.id.length > 0 && !filters.id.includes(user.id)) return false;
        if (filters.picture_large && !user.picture_large) return false;

        return true;
    });
}

const statsTable = document.querySelector(".statistics table");
const tbody = statsTable.querySelector("tbody");
let sortOrder = {};
const keyMap = ["full_name", "course", "age", "gender", "country"];
const ROWS_PER_PAGE = 10;
let currentPage = 1;

statsTable.querySelectorAll("th").forEach((th, index) => {
    const key = keyMap[index];
    const thContent = th.querySelector(".th-content");

    th.addEventListener("click", () => {
        sortOrder[key] = sortOrder[key] === "asc" ? "desc" : "asc";

        statsTable.querySelectorAll(".th-content").forEach(tc => {
            tc.classList.remove("sorted-asc", "sorted-desc");
        });

        thContent.classList.add(sortOrder[key] === "asc" ? "sorted-asc" : "sorted-desc");
        const currentUsers = getFilteredAndSearchedUsers();
        const sortedUsers = sortUsers(currentUsers, key, sortOrder[key]);
        currentPage = 1;
        renderStatisticsWithPagination(sortedUsers);
    });
});

function renderStatistics(users) {
    tbody.innerHTML = "";

    users.forEach(user => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${user.full_name}</td>
            <td>${user.course}</td>
            <td>${user.age}</td>
            <td>${user.gender}</td>
            <td>${user.country}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderStatisticsWithPagination(users) {
    const totalPages = Math.ceil(users.length / ROWS_PER_PAGE);
    currentPage = Math.min(currentPage, totalPages) || 1;

    const start = (currentPage - 1) * ROWS_PER_PAGE;
    const end = start + ROWS_PER_PAGE;
    const usersToShow = users.slice(start, end);

    renderStatistics(usersToShow);
    renderPaginationButtons(totalPages, users);
}

function renderPaginationButtons(totalPages, users) {
    const container = document.querySelector(".pages");
    container.innerHTML = "";

    const pageNumbers = document.createElement("div");
    pageNumbers.classList.add("page-numbers");

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;

        if (i === currentPage) btn.classList.add("active");

        btn.addEventListener("click", () => {
            currentPage = i;
            const sortedUsers = sortUsers(users, getCurrentSortKey(), getCurrentSortOrder());
            renderStatisticsWithPagination(sortedUsers);
        });

        pageNumbers.appendChild(btn);
    }

    container.appendChild(pageNumbers);

    const arrowBtn = document.createElement("div");
    arrowBtn.classList.add("arrow-btn");
    const arrowImg = document.createElement("img");
    arrowImg.src = "images/arrow-table.svg";
    arrowImg.alt = "Next page";
    arrowBtn.appendChild(arrowImg);

    arrowBtn.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            const sortedUsers = sortUsers(users, getCurrentSortKey(), getCurrentSortOrder());
            renderStatisticsWithPagination(sortedUsers);
        }
    });

    container.appendChild(arrowBtn);
}


function getCurrentSortKey() {
    for (const key in sortOrder) return key;
    return "full_name";
}

function getCurrentSortOrder() {
    for (const key in sortOrder) return sortOrder[key] || "asc";
    return "asc";
}


const filteredAndSorted = sortUsers(applyFilters(), getCurrentSortKey(), getCurrentSortOrder());
renderStatisticsWithPagination(filteredAndSorted);


const searchInput = document.querySelector(".search-container input");
const searchButton = document.getElementById("searchButton");

function searchUsers(users, query) {
    query = _.toLower(_.trim(query));
    if (!query) return users;

    return _.filter(users, user =>
        _.some(['full_name', 'note'], field =>
            _.includes(_.toLower(_.get(user, field, "")), query)
        ) || user.age.toString() === query
    );
}


function updateViews() {
    const query = searchInput.value;

    const filteredUsers = applyFilters();
    const searchedUsers = searchUsers(filteredUsers, query);

    renderTeachers(searchedUsers);

    const sortedUsers = sortUsers(searchedUsers, getCurrentSortKey(), getCurrentSortOrder());
    currentPage = 1;
    renderStatisticsWithPagination(sortedUsers);

    favouritesRow.innerHTML = "";
    const favUsers = searchedUsers.filter(u => favourites.includes(u.id));
    favUsers.forEach(user => {
        const card = createTeacherCard(user);
        favouritesRow.appendChild(card);
    });

    if (currentStatsMode === "chart") {
        renderStatsChart(searchedUsers);
    }
}

searchButton.addEventListener("click", updateViews);

searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") updateViews();
});

function isFavourite(userId) {
    return favourites.includes(userId);
}

function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.classList.add("toast");

    if (type === "success") toast.style.background = "#52cb6d";
    if (type === "error") toast.style.background = "#c74854";

    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 100);

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 1500);
}

const addModal = document.getElementById("addModal");
const addBtns = document.querySelectorAll(".add-teacher");
const addClose = document.querySelector(".add-close");
const addForm = document.getElementById("addTeacherForm");

for (const btn of addBtns) {
    btn.addEventListener("click", () => {
        addModal.style.display = "block";
        populateSelects();

    });
}
addClose.addEventListener("click", () => {
    addModal.style.display = "none";
});

addModal.addEventListener("click", (e) => {
    if (e.target === addModal) addModal.style.display = "none";
});

function populateSelects() {
    const specialitySelect = document.getElementById("specialitySelect");
    const countrySelect = document.getElementById("countrySelect");

    const courses = [...new Set(validUsers.map(u => u.course))].sort();
    const countries = [...new Set(validUsers.map(u => u.country))].sort();

    courses.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        specialitySelect.appendChild(opt);
    });

    countries.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        countrySelect.appendChild(opt);
    });
}

addForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = addForm.querySelector("input[placeholder='Enter name']").value.trim();
    const speciality = document.getElementById("specialitySelect").value;
    const country = document.getElementById("countrySelect").value;
    const city = addForm.querySelector("input[placeholder='City']").value.trim();
    const email = addForm.querySelector("input[type='email']").value.trim();
    const phone = addForm.querySelector("input[type='tel']").value.trim();
    const dob = addForm.querySelector("input[type='date']").value;
    const sex = addForm.querySelector("input[name='sex']:checked")?.value;
    const color = addForm.querySelector("input[type='color']").value;
    const notes = addForm.querySelector("textarea").value.trim();

    if (!name || !speciality || !country || !city || !email || !phone || !dob || !sex) {
        showToast("Будь ласка, заповніть усі обов'язкові поля", "error");
        return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
        showToast("Некоректний email", "error");
        return;
    }
    if (!/^\+?\d{7,15}$/.test(phone)) {
        showToast("Некоректний номер телефону", "error");
        return;
    }

    const age = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    const newTeacher = {
        id: generateID(),
        full_name: name,
        course: speciality,
        country,
        city,
        email,
        phone,
        dob,
        age,
        gender: sex,
        note: notes,
        picture_large: "",
        favorite: false,
        bg_color: color
    };


    try {
        const response = await fetch("http://localhost:3002/teachers", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(newTeacher)
        });

        if (!response.ok) throw new Error("Помилка при додаванні");
        const savedTeacher = await response.json();
        validUsers.push(savedTeacher);
        showToast("Викладача додано!", "success");
        renderTeachers(applyFilters());
        renderFavourites();
        renderStatisticsWithPagination(sortUsers(applyFilters(), getCurrentSortKey(), getCurrentSortOrder()));

        const newCard = document.querySelector(`.teacher-card[data-id="${savedTeacher.id}"]`);
        if (newCard) {
            newCard.scrollIntoView({behavior: "smooth", block: "center"});
        }

        addModal.style.display = "none";
        addForm.reset();

    } catch (err) {
        console.error("Не вдалося додати викладача", err);
    }

});

const sections = {
    "Teachers": document.querySelector(".teachers-list"),
    "Statistics": document.querySelector(".statistics"),
    "Favourites": document.querySelector(".favourites"),
};

function scrollToSection(name) {
    const section = sections[name];
    if (!section) return;
    section.scrollIntoView({behavior: "smooth", block: "start"});
}

function handleTabClick(e) {
    const name = e.target.textContent.trim();
    scrollToSection(name);
    updateActiveTabs(name);
}

function updateActiveTabs(activeName) {
    document.querySelectorAll(".tabs .tab").forEach(tab => {
        if (tab.textContent.trim() === activeName) {
            tab.classList.add("active");
        } else {
            tab.classList.remove("active");
        }
    });
}

document.querySelectorAll(".tabs .tab").forEach(tab => {
    tab.addEventListener("click", handleTabClick);
});


// ------ LAB 05 ------

const showTableBtn = document.getElementById("showTableBtn");
const showChartBtn = document.getElementById("showChartBtn");
const statsTableSection = document.querySelector(".statistics table");
const statsChartCanvas = document.getElementById("statsChart");
const pagesContainer = document.querySelector(".statistics .pages"); // ← додаємо сюди

let statsChart = null;

function renderStatsChart(users) {
\
    const countryCounts = {};
    users.forEach(user => {
        countryCounts[user.country] = (countryCounts[user.country] || 0) + 1;
    });

    const labels = Object.keys(countryCounts);
    const data = Object.values(countryCounts);

    if (statsChart) {
        statsChart.destroy();
    }

    statsChart = new Chart(statsChartCanvas, {
        type: "pie",
        data: {
            labels,
            datasets: [{
                label: "Teachers by Country",
                data,
                backgroundColor: [
                    "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0",
                    "#9966FF", "#FF9F40", "#C9CBCF", "#7FC97F"
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "bottom"
                },
                title: {
                    display: true,
                    text: "Teachers Distribution by Country"
                }
            }
        }
    });
}
let currentStatsMode = "table"; // або "chart"
\
showTableBtn.addEventListener("click", () => {
    currentStatsMode = "table";
    showTableBtn.classList.add("active");
    byCountryBtn.classList.remove("active");
    flatTableBtn.classList.remove("active");
    showChartBtn.classList.remove("active");

    statsTableSection.style.display = "table";
    statsChartCanvas.style.display = "none";
    if (pagesContainer) pagesContainer.style.display = "flex";
});

showChartBtn.addEventListener("click", () => {
    currentStatsMode = "chart";
    showChartBtn.classList.add("active");
    showTableBtn.classList.remove("active");
    byCountryBtn.classList.remove("active");
    flatTableBtn.classList.remove("active");

    statsTableSection.style.display = "none";
    statsChartCanvas.style.display = "block";
    if (pagesContainer) pagesContainer.style.display = "none";

    const usersToShow = getFilteredAndSearchedUsers();
    renderStatsChart(usersToShow);
});

function daysUntilBirthday(b_date) {
    if (!b_date) return "—";
    const today = dayjs();
    const birth = dayjs(b_date);

    let nextBirthday = birth.year(today.year());

    if (nextBirthday.isBefore(today, "day")) {
        nextBirthday = nextBirthday.add(1, "year");
    }

    const diff = nextBirthday.diff(today, "day");
    return diff;
}
const flatTableBtn = document.getElementById("flatTableBtn");
const byCountryBtn = document.getElementById("byCountryBtn");
const teachersReport = document.getElementById("teachersReport");

let pivot = null;

function initPivot(data) {
    if (pivot) {
        pivot.dispose();
        teachersReport.innerHTML = "";
    }
    pivot = new WebDataRocks({
        container: "#teachersReport",
        toolbar: true,
        report: {
            dataSource: {
                data: data
            }
        }
    });
}

flatTableBtn.addEventListener("click", () => {
    flatTableBtn.classList.add("active");
    showTableBtn.classList.remove("active");
    showChartBtn.classList.remove("active");
    byCountryBtn.classList.remove("active");

    currentStatsMode = "flat";
    statsTableSection.style.display = "none";
    statsChartCanvas.style.display = "none";
    if (pagesContainer) pagesContainer.style.display = "none";
    teachersReport.style.display = "block";

    const users = getFilteredAndSearchedUsers();

    initPivot(users.map(u => ({
        Name: u.full_name,
        Speciality: u.course,
        Age: u.age,
        Gender: u.gender,
        Country: u.country
    })));

    pivot.setReport({
        dataSource: { data: users },
        slice: {
            reportFilters: [],
            rows: [],
            columns: [],
            measures: [
                { uniqueName: "full_name", caption: "Name" },
                { uniqueName: "course", caption: "Speciality" },
                { uniqueName: "age", caption: "Age" },
                { uniqueName: "gender", caption: "Gender" },
                { uniqueName: "country", caption: "Country" }
            ]
        },
        options: { grid: { type: "flat" } }
    });
});

byCountryBtn.addEventListener("click", () => {
    byCountryBtn.classList.add("active");
    flatTableBtn.classList.remove("active");
    showTableBtn.classList.remove("active");
    showChartBtn.classList.remove("active");
    currentStatsMode = "country";
    statsTableSection.style.display = "none";
    statsChartCanvas.style.display = "none";
    if (pagesContainer) pagesContainer.style.display = "none";
    teachersReport.style.display = "block";

    const users = getFilteredAndSearchedUsers();

    initPivot(users.map(u => ({
        Name: u.full_name,
        Speciality: u.course,
        Age: u.age,
        Gender: u.gender,
        Country: u.country
    })));

    pivot.setReport({
        dataSource: { data: users },
        slice: {
            rows: [{ uniqueName: "country", caption: "Country" }],
            measures: [
                { uniqueName: "full_name", aggregation: "count", caption: "Teachers Count" }
            ]
        }
    });
});
