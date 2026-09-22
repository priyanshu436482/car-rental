// ================================
// DriveEasy Car Rental
// script.js
// ================================

window.DEFAULT_CAR_SVG = window.DEFAULT_CAR_SVG || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'%3E%3Crect width='400' height='250' fill='%231e293b'/%3E%3Cpath d='M80 160 L120 100 L280 100 L320 160 Z' fill='%23ff6600' opacity='0.8'/%3E%3Crect x='60' y='150' width='280' height='45' rx='10' fill='%23334155'/%3E%3Ccircle cx='110' cy='195' r='22' fill='%230f172a' stroke='%2394a3b8' stroke-width='4'/%3E%3Ccircle cx='290' cy='195' r='22' fill='%230f172a' stroke='%2394a3b8' stroke-width='4'/%3E%3Ccircle cx='110' cy='195' r='8' fill='%23e2e8f0'/%3E%3Ccircle cx='290' cy='195' r='8' fill='%23e2e8f0'/%3E%3Cpolygon points='135,108 265,108 275,150 125,150' fill='%2338bdf8' opacity='0.6'/%3E%3Ctext x='200' y='55' fill='%23f8fafc' font-family='sans-serif' font-size='18' font-weight='bold' text-anchor='middle'%3EDriveEasy Rental%3C/text%3E%3C/svg%3E";

// Mobile Menu
const menuBtn = document.querySelector(".menu-btn");
const menu = document.querySelector("#menu");

if (menuBtn) {
    menuBtn.addEventListener("click", () => {
        menu.classList.toggle("active");
    });
}

// Close menu when a link is clicked
document.querySelectorAll("#menu a").forEach(link => {
    link.addEventListener("click", () => {
        menu.classList.remove("active");
    });
});

// Sticky Header Shadow
window.addEventListener("scroll", () => {
    const header = document.querySelector("header");
    if (header) {
        if (window.scrollY > 50) {
            header.style.boxShadow = "0 8px 20px rgba(0,0,0,.15)";
        } else {
            header.style.boxShadow = "0 5px 15px rgba(0,0,0,.1)";
        }
    }
});

// Initial Data Seed for LocalStorage
const defaultCars = [
    { id: 1, name: "Maruti Suzuki Swift", category: "Hatchback", price: 1800, transmission: "Manual", fuel: "Petrol", seats: 5, image: "images/car1.jpg", status: "Available" },
    { id: 2, name: "Maruti Suzuki Baleno", category: "Hatchback", price: 2000, transmission: "Automatic", fuel: "Petrol", seats: 5, image: "images/car2.jpg", status: "Available" },
    { id: 3, name: "Maruti Suzuki Brezza", category: "SUV", price: 2500, transmission: "Automatic", fuel: "Petrol", seats: 5, image: "images/car3.jpg", status: "Available" },
    { id: 4, name: "Hyundai Creta", category: "SUV", price: 3000, transmission: "Automatic", fuel: "Diesel", seats: 5, image: "images/car4.jpg", status: "Available" },
    { id: 5, name: "Hyundai i20", category: "Hatchback", price: 2200, transmission: "Manual", fuel: "Petrol", seats: 5, image: "images/car5.jpg", status: "Available" },
    { id: 6, name: "Mahindra Thar", category: "SUV", price: 4000, transmission: "Manual", fuel: "Diesel", seats: 4, image: "images/car6.jpg", status: "Available" },
    { id: 7, name: "Honda City", category: "Sedan", price: 2500, transmission: "Automatic", fuel: "Petrol", seats: 5, image: "images/car7.jpg", status: "Available" },
    { id: 8, name: "Toyota Fortuner", category: "SUV", price: 5500, transmission: "Automatic", fuel: "Diesel", seats: 7, image: "images/car8.jpg", status: "Available" },
    { id: 9, name: "Kia Seltos", category: "SUV", price: 3200, transmission: "Automatic", fuel: "Diesel", seats: 5, image: "images/car9.jpg", status: "Available" }
];

const defaultBookings = [
    { id: "BK1001", name: "Rajesh Sharma", phone: "9876543210", email: "rajesh@gmail.com", car: "Maruti Suzuki Swift", pickup: "Ahmedabad Airport", pickupDate: "2026-08-01", returnDate: "2026-08-05", status: "Confirmed", amount: 7200, date: "2026-07-28" },
    { id: "BK1002", name: "Priya Patel", phone: "9812345678", email: "priya@yahoo.com", car: "Hyundai Creta", pickup: "SG Highway", pickupDate: "2026-08-03", returnDate: "2026-08-06", status: "Pending", amount: 9000, date: "2026-07-29" },
    { id: "BK1003", name: "Aarav Shah", phone: "9722334455", email: "aarav@gmail.com", car: "Mahindra Thar", pickup: "Gandhinagar", pickupDate: "2026-07-30", returnDate: "2026-08-02", status: "Completed", amount: 12000, date: "2026-07-25" }
];

const defaultMessages = [
    { id: "MSG101", name: "Vikram Mehta", email: "vikram@outlook.com", phone: "9712345678", message: "Interested in renting Maruti Suzuki Brezza for 3 days trip.", status: "Unread", date: "2026-07-29" },
    { id: "MSG102", name: "Neha Joshi", email: "neha@gmail.com", phone: "9898989898", message: "Do you offer self-drive rental for Hyundai Creta?", status: "Read", date: "2026-07-27" }
];

const defaultSettings = {
    adminUsername: "admin",
    adminPassword: "admin123",
    whatsappPhone: "919876543210",
    companyEmail: "info@driveeasy.com",
    companyPhone: "+91 9876543210",
    companyAddress: "Ahmedabad, Gujarat, India",
    currency: "₹"
};

function initStore() {
    const existingCars = localStorage.getItem("driveeasy_cars");
    if (!existingCars) {
        localStorage.setItem("driveeasy_cars", JSON.stringify(defaultCars));
    } else {
        try {
            let cars = JSON.parse(existingCars);
            cars = cars.map(car => {
                const match = defaultCars.find(dc => dc.id === car.id || dc.name === car.name);
                if (match) {
                    car.image = match.image;
                }
                return car;
            });
            localStorage.setItem("driveeasy_cars", JSON.stringify(cars));
        } catch (e) {}
    }
    if (!localStorage.getItem("driveeasy_bookings")) {
        localStorage.setItem("driveeasy_bookings", JSON.stringify(defaultBookings));
    }
    if (!localStorage.getItem("driveeasy_messages")) {
        localStorage.setItem("driveeasy_messages", JSON.stringify(defaultMessages));
    }
    if (!localStorage.getItem("driveeasy_settings")) {
        localStorage.setItem("driveeasy_settings", JSON.stringify(defaultSettings));
    }
}

function getCars() {
    initStore();
    return JSON.parse(localStorage.getItem("driveeasy_cars")) || [];
}

function getSettings() {
    initStore();
    try {
        const raw = localStorage.getItem("driveeasy_settings");
        const stored = raw ? JSON.parse(raw) : null;
        const merged = { ...defaultSettings, ...(stored || {}) };
        merged.adminUsername = String(merged.adminUsername || defaultSettings.adminUsername).trim();
        merged.adminPassword = String(merged.adminPassword || defaultSettings.adminPassword).trim();
        if (!merged.adminUsername) merged.adminUsername = defaultSettings.adminUsername;
        if (!merged.adminPassword) merged.adminPassword = defaultSettings.adminPassword;
        return merged;
    } catch (e) {
        return { ...defaultSettings };
    }
}

function resetAdminCredentials() {
    let settings = {};
    try {
        settings = JSON.parse(localStorage.getItem("driveeasy_settings") || "{}") || {};
    } catch (e) {
        settings = {};
    }
    settings.adminUsername = "admin";
    settings.adminPassword = "admin123";
    if (!settings.whatsappPhone) settings.whatsappPhone = defaultSettings.whatsappPhone;
    if (!settings.companyEmail) settings.companyEmail = defaultSettings.companyEmail;
    if (!settings.companyPhone) settings.companyPhone = defaultSettings.companyPhone;
    if (!settings.companyAddress) settings.companyAddress = defaultSettings.companyAddress;
    if (!settings.currency) settings.currency = defaultSettings.currency;
    localStorage.setItem("driveeasy_settings", JSON.stringify(settings));
    return settings;
}

// Render dynamic cars on client pages
function renderClientCars() {
    const carContainer = document.querySelector(".car-container");
    if (!carContainer) return;

    const cars = getCars();
    const settings = getSettings();
    const path = window.location.pathname.toLowerCase();
    const isHomePage = path.includes("index.html") || path.endsWith("/") || path.endsWith("/data.csv") || !path.includes(".html");

    // Reverse array so newly created/edited admin cars appear at top
    const sortedCars = [...cars].reverse();
    const displayCars = isHomePage ? sortedCars.slice(0, 6) : sortedCars;

    if (cars.length === 0) {
        carContainer.innerHTML = `<p style="grid-column:1/-1; text-align:center; padding:30px; color:#666;">No cars currently available in fleet.</p>`;
        return;
    }

    carContainer.innerHTML = displayCars.map(car => `
        <div class="car" data-id="${car.id}">
            <div style="position: relative; overflow: hidden;">
                <img src="${car.image || 'images/car1.jpg'}" alt="${car.name}" onerror="this.onerror=null; this.src=window.DEFAULT_CAR_SVG;">
                ${car.status && car.status !== 'Available' ? `<span style="position: absolute; top: 10px; right: 10px; background: ${car.status === 'Rented' ? '#f59e0b' : '#ef4444'}; color: white; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">${car.status}</span>` : ''}
            </div>
            <h3>${car.name}</h3>
            <p>${settings.currency || '₹'}${Number(car.price).toLocaleString()} / Day</p>
            <div style="padding:0 15px 10px; font-size:13px; color:#666; display:flex; gap:10px; justify-content: center;">
                <span><i class="fa-solid fa-car"></i> ${car.category || 'Standard'}</span>
                <span><i class="fa-solid fa-gear"></i> ${car.transmission || 'Manual'}</span>
                <span><i class="fa-solid fa-users"></i> ${car.seats || 5} Seats</span>
            </div>
            <a href="booking.html?car=${encodeURIComponent(car.name)}" class="btn-book">${car.status === 'Rented' ? 'Reserve Ahead' : 'Book Now'}</a>
        </div>
    `).join("");
}

// Search form event handler
const searchBtn = document.querySelector(".search button");
if (searchBtn) {
    searchBtn.addEventListener("click", function (e) {
        e.preventDefault();

        const location = document.querySelector(".search input[type='text']").value;
        const pickup = document.querySelectorAll(".search input[type='date']")[0]?.value;
        const dropoff = document.querySelectorAll(".search input[type='date']")[1]?.value;
        const car = document.querySelector(".search select")?.value;

        if (!location || !pickup || !dropoff || car === "Select Car") {
            alert("Please fill all search fields.");
            return;
        }

        window.location.href = `booking.html?car=${encodeURIComponent(car)}&pickup=${encodeURIComponent(location)}&pickupDate=${pickup}&returnDate=${dropoff}`;
    });
}

// Smooth Scroll
document.querySelectorAll("a[href^='#']").forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
            target.scrollIntoView({ behavior: "smooth" });
        }
    });
});

// Current Year
const copy = document.querySelector(".copy p");
if (copy) {
    copy.innerHTML = `© ${new Date().getFullYear()} DriveEasy Car Rental. All Rights Reserved.`;
}

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
    initStore();
    renderClientCars();
});
