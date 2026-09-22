const { MongoClient } = require("mongodb");

let client;
let db;

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

function getDefaultSettings() {
    return {
        _id: "main",
        adminUsername: process.env.ADMIN_USERNAME || "admin",
        adminPassword: process.env.ADMIN_PASSWORD || "admin123",
        whatsappPhone: process.env.WHATSAPP_PHONE || "919876543210",
        companyEmail: process.env.COMPANY_EMAIL || "info@driveeasy.com",
        companyPhone: process.env.COMPANY_PHONE || "+91 9876543210",
        companyAddress: process.env.COMPANY_ADDRESS || "Ahmedabad, Gujarat, India",
        currency: process.env.CURRENCY || "₹"
    };
}

const defaultSettings = getDefaultSettings();

function buildMongoUri() {
    const user = process.env.MONGODB_USER;
    const pass = process.env.MONGODB_PASSWORD;
    const host = process.env.MONGODB_HOST || "cluster0.vg8xgoh.mongodb.net";
    const dbName = process.env.MONGODB_DB || "driveeasy";

    // Preferred: separate user/password (handles @ and special chars safely)
    if (user && pass) {
        return `mongodb+srv://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}/${dbName}?appName=Cluster0`;
    }

    // Fallback: full URI (password with @ must already be encoded as %40)
    const uri = process.env.MONGODB_URI;
    if (uri) return uri;

    throw new Error(
        "MongoDB config missing. Set MONGODB_USER + MONGODB_PASSWORD (recommended) or MONGODB_URI."
    );
}

async function connectDB() {
    if (db) return db;

    const uri = buildMongoUri();
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(process.env.MONGODB_DB || undefined);
    await seedIfEmpty();
    console.log("Connected to MongoDB Atlas");
    return db;
}

async function seedIfEmpty() {
    const defaults = getDefaultSettings();

    const carsCount = await db.collection("cars").countDocuments();
    if (carsCount === 0) {
        await db.collection("cars").insertMany(defaultCars);
        console.log("Seeded default cars");
    }

    const bookingsCount = await db.collection("bookings").countDocuments();
    if (bookingsCount === 0) {
        await db.collection("bookings").insertMany(defaultBookings);
        console.log("Seeded default bookings");
    }

    const messagesCount = await db.collection("messages").countDocuments();
    if (messagesCount === 0) {
        await db.collection("messages").insertMany(defaultMessages);
        console.log("Seeded default messages");
    }

    const settings = await db.collection("settings").findOne({ _id: "main" });
    if (!settings) {
        await db.collection("settings").insertOne(defaults);
        console.log("Seeded default settings (from env)");
    } else if (process.env.ADMIN_USERNAME || process.env.ADMIN_PASSWORD) {
        // Keep env admin credentials in sync when set on Vercel / .env
        const patch = {};
        if (process.env.ADMIN_USERNAME) patch.adminUsername = process.env.ADMIN_USERNAME;
        if (process.env.ADMIN_PASSWORD) patch.adminPassword = process.env.ADMIN_PASSWORD;
        await db.collection("settings").updateOne({ _id: "main" }, { $set: patch });
    }
}

function getDB() {
    if (!db) throw new Error("Database not connected");
    return db;
}

module.exports = { connectDB, getDB, getDefaultSettings, defaultSettings: getDefaultSettings() };
