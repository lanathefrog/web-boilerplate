import {randomUserMock} from "./mock.js";
import {additionalUsers} from "./mock.js";
const _ = window._;



const courses = [
    "Mathematics", "Physics", "English", "Computer Science", "Dancing", "Chess",
    "Biology", "Chemistry", "Law", "Art", "Medicine", "Statistics"
];

export function generateID() {
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

export async function fetchRandomUsers(count = 50) {
    const url = `https://randomuser.me/api/?results=${count}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        return data.results.map(u => formatUser(u));
    } catch (err) {
        console.error("Error fetching users:", err);
        return [];
    }
}function formatUser(raw) {
    let dobDate = null;
    let age = null;

    if (typeof raw.dob === "object" && raw.dob?.date) {
        dobDate = raw.dob.date;
        age = raw.dob.age;
    } else if (typeof raw.dob === "string") {
        dobDate = raw.dob;
        age = raw.age;
    } else if (raw.b_day || raw.b_date) {
        dobDate = raw.b_date || raw.b_day;
        age = raw.age;
    }

    return {
        gender: _.capitalize(raw.gender),
        title: _.get(raw, "name.title", raw.title),
        full_name: raw.name ? `${raw.name.first} ${raw.name.last}` : raw.full_name,
        city: _.get(raw, "location.city", raw.city),
        state: _.get(raw, "location.state", raw.state),
        country: _.get(raw, "location.country", raw.country),
        postcode: _.get(raw, "location.postcode", raw.postcode),
        coordinates: _.get(raw, "location.coordinates", raw.coordinates),
        timezone: _.get(raw, "location.timezone", raw.timezone),
        email: raw.email,
        b_date: dobDate,
        age: age,
        phone: raw.phone,
        picture_large: _.get(raw, "picture.large", raw.picture_large),
        picture_thumbnail: _.get(raw, "picture.thumbnail", raw.picture_thumbnail),
        id: _.get(raw, "id.value", raw.id || generateID()),
        favorite: _.defaultTo(raw.favorite, pickRandomBoolean()),
        course: _.defaultTo(raw.course, pickRandomCourse()),
        bg_color: _.defaultTo(raw.bg_color, generateBackgroundColor()),
        note: _.defaultTo(raw.note, "")
    };
}




function mergeAndFormatUsers(arrA, arrB) {
    const formattedA = _.map(arrA, formatUser);
    const formattedB = _.map(arrB, formatUser);

    const result = _.cloneDeep(formattedA);
    const mapById = new Map();
    const mapByName = new Map();

    _.forEach(formattedA, u => {
        if (u.id) mapById.set(u.id, u);
        const n = _.toLower(_.trim(u.full_name));
        if (n) mapByName.set(n, u);
    });

    _.forEach(formattedB, u => {
        const n = _.toLower(_.trim(u.full_name));
        let existing = mapById.get(u.id) || mapByName.get(n);

        if (existing) {
            _.forOwn(u, (val, key) => {
                if (_.isNil(existing[key]) || existing[key] === "") {
                    existing[key] = val;
                }
            });
        } else {
            result.push(u);
            if (u.id) mapById.set(u.id, u);
            if (n) mapByName.set(n, u);
        }
    });

    return result;
}

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
    if (!_.isString(fullName)) return fullName;
    return _.startCase(_.toLower(fullName));
}

function validateUser(user) {
    if (_.isNaN(user.age)) {
        console.error("Invalid age:", user.id, user.full_name);
        return false;
    }

    _.assign(user, {
        full_name: normalizeFullName(user.full_name),
        gender: _.capitalize(user.gender),
        note: _.capitalize(user.note),
        state: _.capitalize(user.state),
        city: _.capitalize(user.city),
        country: _.capitalize(user.country),
        phone: user.phone ? user.phone.replace(/\D/g, "") : user.phone
    });

    if (!/^\d{7,15}$/.test(user.phone)) return false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) return false;

    return true;
}


function validateUsers(users) {
    return _.filter(users, validateUser);
}



let validUsers = [];

(async () => {
    try {
        const apiUsers = await fetchRandomUsers(50);
        const response = await fetch("http://localhost:3002/teachers");
        const serverUsers = await response.json();

        console.log("Fetched users from API:", apiUsers.length);
        console.log("Fetched users from JSON Server:", serverUsers.length);

        const formattedUsers = mergeAndFormatUsers(apiUsers, serverUsers);
        console.log("Formatted users:", formattedUsers.length);

        validUsers = validateUsers(formattedUsers);
        console.log("Users ready:", validUsers.length);

        import("./script.js").then(module => {
            module.initApp(validUsers);
        });
    } catch (error) {
        console.error("Error fetching users:", error);
    }
})();
const FETCH_STEP = 10;

export async function fetchMoreUsers() {
    try {
        const apiUsers = await fetchRandomUsers(FETCH_STEP);
        const formattedUsers = apiUsers.map(formatUser);
        const validNewUsers = validateUsers(formattedUsers);
        validUsers.push(...validNewUsers)

        return validNewUsers;
    } catch (err) {
        console.error("Error fetching more users:", err);
        return [];
    }
}


// --------- TASK 4 ---------
export function sortUsers(users, key, order = "asc") {
    return _.orderBy(users, [key], [order]);
}

// const sortedByAge = sortUsers(validUsers, "age", "asc");
// console.log("First 5 users sorted by age ascending:", sortedByAge.slice(0, 5));
//
// function findUsers(users, criteria) {
//     return users.filter(user => {
//         for (const key in criteria) {
//             if (user[key] !== criteria[key]) {
//                 return false;
//             }
//         }
//         return true;
//     });
// }
//
// const users28 = findUsers(validUsers, { age: 28 });
// console.log("Users with age 28:", users28);
//
// function getPercentage(users, predicate) {
//     const total = users.length;
//     const matched = users.filter(predicate).length;
//     return (matched / total) * 100;
// }
// console.log("--------- TASK 6 ---------");
// const percentOver30 = getPercentage(validUsers, user => user.age > 30);
// console.log("Percentage of users over 30:", percentOver30.toFixed(2) + "%");

export {validUsers};
