// DriveEasy API client — talks to MongoDB via Express (/api/*)
// Falls back to localStorage if the API is unreachable.

const API_BASE = "";

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

window.DriveEasyStore = {
    ready: false,
    usingApi: false,
    cars: [],
    bookings: [],
    messages: [],
    settings: { ...defaultSettings }
};

async function apiRequest(path, options = {}) {
    const res = await fetch(API_BASE + path, {
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        ...options
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
    }
    if (res.status === 204) return null;
    return res.json();
}

function loadLocalFallback() {
    try {
        DriveEasyStore.cars = JSON.parse(localStorage.getItem("driveeasy_cars")) || [...defaultCars];
        DriveEasyStore.bookings = JSON.parse(localStorage.getItem("driveeasy_bookings")) || [...defaultBookings];
        DriveEasyStore.messages = JSON.parse(localStorage.getItem("driveeasy_messages")) || [...defaultMessages];
        DriveEasyStore.settings = {
            ...defaultSettings,
            ...(JSON.parse(localStorage.getItem("driveeasy_settings") || "null") || {})
        };
    } catch (e) {
        DriveEasyStore.cars = [...defaultCars];
        DriveEasyStore.bookings = [...defaultBookings];
        DriveEasyStore.messages = [...defaultMessages];
        DriveEasyStore.settings = { ...defaultSettings };
    }
    DriveEasyStore.usingApi = false;
}

function syncLocalMirror() {
    try {
        localStorage.setItem("driveeasy_cars", JSON.stringify(DriveEasyStore.cars));
        localStorage.setItem("driveeasy_bookings", JSON.stringify(DriveEasyStore.bookings));
        localStorage.setItem("driveeasy_messages", JSON.stringify(DriveEasyStore.messages));
        localStorage.setItem("driveeasy_settings", JSON.stringify(DriveEasyStore.settings));
    } catch (e) {}
}

async function initStore() {
    try {
        const health = await apiRequest("/api/health");
        if (!health?.ok) throw new Error("API unhealthy");

        const [cars, bookings, messages, settings] = await Promise.all([
            apiRequest("/api/cars"),
            apiRequest("/api/bookings"),
            apiRequest("/api/messages"),
            apiRequest("/api/settings")
        ]);

        DriveEasyStore.cars = cars || [];
        DriveEasyStore.bookings = bookings || [];
        DriveEasyStore.messages = messages || [];
        DriveEasyStore.settings = { ...defaultSettings, ...(settings || {}) };
        DriveEasyStore.usingApi = true;
        syncLocalMirror();
        console.log("DriveEasy: connected to MongoDB via API");
    } catch (err) {
        console.warn("DriveEasy: API unavailable, using localStorage fallback.", err.message);
        loadLocalFallback();
    }
    DriveEasyStore.ready = true;
    return DriveEasyStore;
}

function getCars() {
    return DriveEasyStore.cars || [];
}

function getBookings() {
    return DriveEasyStore.bookings || [];
}

function getMessages() {
    return DriveEasyStore.messages || [];
}

function getSettings() {
    const s = { ...defaultSettings, ...(DriveEasyStore.settings || {}) };
    s.adminUsername = String(s.adminUsername || "admin").trim() || "admin";
    s.adminPassword = String(s.adminPassword || "admin123").trim() || "admin123";
    return s;
}

async function saveCar(car) {
    const cars = getCars();
    const idx = cars.findIndex(c => Number(c.id) === Number(car.id));
    if (idx !== -1) cars[idx] = car;
    else cars.push(car);
    DriveEasyStore.cars = cars;

    if (DriveEasyStore.usingApi) {
        const method = idx !== -1 ? "PUT" : "POST";
        const path = idx !== -1 ? `/api/cars/${car.id}` : "/api/cars";
        await apiRequest(path, { method, body: JSON.stringify(car) });
    }
    syncLocalMirror();
    return car;
}

async function deleteCarById(id) {
    DriveEasyStore.cars = getCars().filter(c => Number(c.id) !== Number(id));
    if (DriveEasyStore.usingApi) {
        await apiRequest(`/api/cars/${id}`, { method: "DELETE" });
    }
    syncLocalMirror();
}

async function saveBooking(booking) {
    const bookings = getBookings();
    const idx = bookings.findIndex(b => b.id === booking.id);
    if (idx !== -1) bookings[idx] = booking;
    else bookings.push(booking);
    DriveEasyStore.bookings = bookings;

    if (DriveEasyStore.usingApi) {
        const method = idx !== -1 ? "PUT" : "POST";
        const path = idx !== -1 ? `/api/bookings/${booking.id}` : "/api/bookings";
        await apiRequest(path, { method, body: JSON.stringify(booking) });
    }
    syncLocalMirror();
    return booking;
}

async function deleteBookingById(id) {
    DriveEasyStore.bookings = getBookings().filter(b => b.id !== id);
    if (DriveEasyStore.usingApi) {
        await apiRequest(`/api/bookings/${id}`, { method: "DELETE" });
    }
    syncLocalMirror();
}

async function saveMessage(message) {
    const messages = getMessages();
    const idx = messages.findIndex(m => m.id === message.id);
    if (idx !== -1) messages[idx] = message;
    else messages.push(message);
    DriveEasyStore.messages = messages;

    if (DriveEasyStore.usingApi) {
        const method = idx !== -1 ? "PUT" : "POST";
        const path = idx !== -1 ? `/api/messages/${message.id}` : "/api/messages";
        await apiRequest(path, { method, body: JSON.stringify(message) });
    }
    syncLocalMirror();
    return message;
}

async function deleteMessageById(id) {
    DriveEasyStore.messages = getMessages().filter(m => m.id !== id);
    if (DriveEasyStore.usingApi) {
        await apiRequest(`/api/messages/${id}`, { method: "DELETE" });
    }
    syncLocalMirror();
}

async function saveSettings(settings) {
    DriveEasyStore.settings = { ...defaultSettings, ...settings };
    if (DriveEasyStore.usingApi) {
        await apiRequest("/api/settings", {
            method: "PUT",
            body: JSON.stringify(DriveEasyStore.settings)
        });
    }
    syncLocalMirror();
    return DriveEasyStore.settings;
}

async function resetAdminCredentials() {
    const settings = getSettings();
    settings.adminUsername = "admin";
    settings.adminPassword = "admin123";
    return saveSettings(settings);
}

window.initStore = initStore;
window.getCars = getCars;
window.getBookings = getBookings;
window.getMessages = getMessages;
window.getSettings = getSettings;
window.saveCar = saveCar;
window.deleteCarById = deleteCarById;
window.saveBooking = saveBooking;
window.deleteBookingById = deleteBookingById;
window.saveMessage = saveMessage;
window.deleteMessageById = deleteMessageById;
window.saveSettings = saveSettings;
window.resetAdminCredentials = resetAdminCredentials;
window.defaultSettings = defaultSettings;
window.defaultCars = defaultCars;
