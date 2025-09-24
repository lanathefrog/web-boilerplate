import { randomUserMock } from "./mock.js";
import { additionalUsers } from "./mock.js";

// ------- TASK 1 --------

const courses = [
    "Mathematics","Physics","English","Computer Science","Dancing","Chess",
    "Biology","Chemistry","Law","Art","Medicine","Statistics"
];

function generateID() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = Math.floor(Math.random() * (20 - 15 + 1)) + 15;
    let id = '';
    for (let i = 0; i < length; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

function generateBackgroundColor() {
    const hex = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += hex[Math.floor(Math.random() * 16)];
    }
    return color;
}

function pickRandomCourse() {
    return courses[Math.floor(Math.random() * courses.length)];
}

function pickRandomBoolean() {
    return Math.random() < 0.5;
}

function normName(fullName) {
    return fullName ? String(fullName).trim().toLowerCase() : null;
}

function formatUser(raw) {
    const formatted = {
        gender: raw.gender,
        title: raw.name?.title || raw.title,
        full_name: raw.name ? `${raw.name.first} ${raw.name.last}` : raw.full_name,
        city: raw.location?.city || raw.city,
        state: raw.location?.state || raw.state,
        country: raw.location?.country || raw.country,
        postcode: raw.location?.postcode || raw.postcode,
        coordinates: raw.location?.coordinates || raw.coordinates,
        timezone: raw.location?.timezone || raw.timezone,
        email: raw.email,
        b_date: raw.dob?.date || raw.b_day,
        age: raw.dob?.age || raw.age,
        phone: raw.phone,
        picture_large: raw.picture?.large || raw.picture_large,
        picture_thumbnail: raw.picture?.thumbnail || raw.picture_thumbnail,
        id: raw.id?.value ? raw.id.value : generateID(),
        favorite: (raw.favorite === undefined || raw.favorite === null) ? pickRandomBoolean() : raw.favorite,
        course: (raw.course === undefined || raw.course === null) ? pickRandomCourse() : raw.course,
        bg_color: raw.bg_color || generateBackgroundColor(),
        note: (raw.note === undefined || raw.note === null) ? '' : raw.note
    };

    return formatted;
}

function mergeAndFormatUsers(arrA, arrB) {
    const formattedA = arrA.map(formatUser);
    const formattedB = arrB.map(formatUser);

    const result = [];
    const mapById = new Map();
    const mapByName = new Map();

    for (const u of formattedA) {
        result.push(u);
        if (u.id) mapById.set(u.id, u);
        const n = normName(u.full_name);
        if (n) mapByName.set(n, u);
    }

    for (const u of formattedB) {
        let existing = null;

        if (u.id && mapById.has(u.id)) {
            existing = mapById.get(u.id);
        } else {
            const n = normName(u.full_name);
            if (n && mapByName.has(n)) existing = mapByName.get(n);
        }

        if (existing) {
            for (const key of Object.keys(u)) {
                const valExisting = existing[key];
                const valNew = u[key];

                if (valExisting === undefined || valExisting === null || valExisting === '') {
                    existing[key] = valNew;
                }
            }

            if (!existing.id) existing.id = generateID();
            if (existing.favorite === undefined || existing.favorite === null) existing.favorite = pickRandomBoolean();
            if (existing.course === undefined || existing.course === null) existing.course = pickRandomCourse();
            if (!existing.bg_color) existing.bg_color = generateBackgroundColor();
            if (existing.note === undefined || existing.note === null) existing.note = '';
        } else {
            result.push(u);
            if (u.id) mapById.set(u.id, u);
            const n = normName(u.full_name);
            if (n) mapByName.set(n, u);
        }
    }

    return result;
}
console.log("--------- TASK 1 ---------");
const allUsers = mergeAndFormatUsers(randomUserMock, additionalUsers);
console.log("total users:", allUsers.length);
console.log("first user:", allUsers[0]);
console.log("last user:", allUsers[allUsers.length - 1]);


// --------- TASK 2 ---------

function normalizeCapitalizedString(value) {
    if (value === undefined) return value;
    if (typeof value !== "string") return value;
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function isValidEmail(value) {
    if (value === undefined) return false;

    return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizePhone(phone) {
    if (phone === undefined) return phone;
    return phone.replace(/\D/g, "");
}

function isValidPhone(phone) {
    if (phone === undefined) return true;
    const normalized = normalizePhone(phone);
    return /^\d{7,15}$/.test(normalized);
}

function normalizeFullName(fullName) {
    if (!fullName || typeof fullName !== "string") return fullName;

    return fullName
        .split(" ")
        .map(word =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
}

function validateUser(user) {
    if (isNaN(user.age)) {
        console.error("Invalid age for user:", user.id, " ", user.full_name);
        return false;
    }

    user.full_name = normalizeFullName(user.full_name);
    user.gender = normalizeCapitalizedString(user.gender);
    user.note = normalizeCapitalizedString(user.note);
    user.state = normalizeCapitalizedString(user.state);
    user.city = normalizeCapitalizedString(user.city);
    user.country = normalizeCapitalizedString(user.country);

    if (user.phone) {
        user.phone = normalizePhone(user.phone);
    }
    if (!isValidPhone(user.phone)) {
        console.error("Invalid phone for user:", user.id, " ", user.full_name);
        return false;
    }

    if (!isValidEmail(user.email)) {
        console.error("Invalid email for user:", user.id, " ", user.full_name);
        return false;
    }
    return true;
}

function validateUsers(users) {
    return users.filter(validateUser);
}
console.log("--------- TASK 2 ---------");
const validUsers = validateUsers(allUsers);
console.log("valid users:", validUsers.length);
console.log("first valid:", validUsers[0]);
console.log("last valid:", validUsers[validUsers.length - 1]);

// --------- TASK 3 ---------

function filterUsers(users, filters) {
    return users.filter(user => {
        for (const key in filters) {
            const filterValue = filters[key];
            const userValue = user[key];

            if (typeof filterValue === "string") {
                if (userValue !== filterValue) return false;

            } else if (Array.isArray(filterValue)) {
                if (!filterValue.includes(userValue)) return false;

            } else if (typeof filterValue === "object" && filterValue !== null) {
                const { min, max } = filterValue;
                if (typeof userValue !== "number") return false;
                if (min !== undefined && userValue < min) return false;
                if (max !== undefined && userValue > max) return false;
            }
        }
        return true;
    });
}

console.log("--------- TASK 3 ---------");
const filtered1 = filterUsers(allUsers, {
    country: "Norway",
    gender: "female"
});
console.log("Filtered users (Norway + female):", filtered1.length);

const filtered2 = filterUsers(allUsers, {
    country: ["Germany", "France", "Norway"]
});
console.log("Filtered users (several countries):", filtered2.length);

const filtered3 = filterUsers(allUsers, {
    age: { min: 20, max: 30 }
});
console.log("Filtered users (20-30):", filtered3.length);

// --------- TASK 4 ---------

function sortUsers(users, key, order = "asc") {
    const sorted = [...users];

    sorted.sort((a, b) => {
        const valA = a[key];
        const valB = b[key];

        if (typeof valA === "number" && typeof valB === "number") {
            return order === "asc" ? valA - valB : valB - valA;
        }

        if (typeof valA === "string" && typeof valB === "string") {
            return order === "asc"
                ? valA.localeCompare(valB, undefined, { sensitivity: "base" })
                : valB.localeCompare(valA, undefined, { sensitivity: "base" });
        }

        return 0;
    });

    return sorted;
}

console.log("--------- TASK 4 ---------");
const sortedByAge = sortUsers(allUsers, "age", "asc");
console.log("First 5 users sorted by age ascending:", sortedByAge.slice(0, 5));

function findUsers(users, criteria) {
    return users.filter(user => {
        for (const key in criteria) {
            if (user[key] !== criteria[key]) {
                return false;
            }
        }
        return true;
    });
}
console.log("--------- TASK 5 ---------");

const users28 = findUsers(allUsers, { age: 28 });
console.log("Users with age 28:", users28);

function getPercentage(users, predicate) {
    const total = users.length;
    const matched = users.filter(predicate).length;
    return (matched / total) * 100;
}
console.log("--------- TASK 6 ---------");
const percentOver30 = getPercentage(allUsers, user => user.age > 30);
console.log("Percentage of users over 30:", percentOver30.toFixed(2) + "%");

export {validUsers};