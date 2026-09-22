/**
 * Force-seed / upsert all default DriveEasy data into MongoDB Atlas.
 * Run: node seed.js
 */
require("dotenv").config();
const { MongoClient } = require("mongodb");

const cars = [
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

const bookings = [
    { id: "BK1001", name: "Rajesh Sharma", phone: "9876543210", email: "rajesh@gmail.com", car: "Maruti Suzuki Swift", pickup: "Ahmedabad Airport", pickupDate: "2026-08-01", returnDate: "2026-08-05", status: "Confirmed", amount: 7200, date: "2026-07-28" },
    { id: "BK1002", name: "Priya Patel", phone: "9812345678", email: "priya@yahoo.com", car: "Hyundai Creta", pickup: "SG Highway", pickupDate: "2026-08-03", returnDate: "2026-08-06", status: "Pending", amount: 9000, date: "2026-07-29" },
    { id: "BK1003", name: "Aarav Shah", phone: "9722334455", email: "aarav@gmail.com", car: "Mahindra Thar", pickup: "Gandhinagar", pickupDate: "2026-07-30", returnDate: "2026-08-02", status: "Completed", amount: 12000, date: "2026-07-25" }
];

const messages = [
    { id: "MSG101", name: "Vikram Mehta", email: "vikram@outlook.com", phone: "9712345678", message: "Interested in renting Maruti Suzuki Brezza for 3 days trip.", status: "Unread", date: "2026-07-29" },
    { id: "MSG102", name: "Neha Joshi", email: "neha@gmail.com", phone: "9898989898", message: "Do you offer self-drive rental for Hyundai Creta?", status: "Read", date: "2026-07-27" }
];

const settings = {
    _id: "main",
    adminUsername: process.env.ADMIN_USERNAME || "admin",
    adminPassword: process.env.ADMIN_PASSWORD || "admin123",
    whatsappPhone: process.env.WHATSAPP_PHONE || "919876543210",
    companyEmail: process.env.COMPANY_EMAIL || "info@driveeasy.com",
    companyPhone: process.env.COMPANY_PHONE || "+91 9876543210",
    companyAddress: process.env.COMPANY_ADDRESS || "Ahmedabad, Gujarat, India",
    currency: process.env.CURRENCY || "₹"
};

function buildUri() {
    const user = process.env.MONGODB_USER;
    const pass = process.env.MONGODB_PASSWORD;
    const host = process.env.MONGODB_HOST;
    const dbName = process.env.MONGODB_DB || "driveeasy";
    if (user && pass && host) {
        return {
            uri: `mongodb+srv://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}/${dbName}?appName=Cluster0`,
            dbName
        };
    }
    if (process.env.MONGODB_URI) {
        return { uri: process.env.MONGODB_URI, dbName };
    }
    throw new Error("Missing MongoDB env vars");
}

async function main() {
    const { uri, dbName } = buildUri();
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);

    for (const car of cars) {
        await db.collection("cars").updateOne({ id: car.id }, { $set: car }, { upsert: true });
    }
    for (const b of bookings) {
        await db.collection("bookings").updateOne({ id: b.id }, { $set: b }, { upsert: true });
    }
    for (const m of messages) {
        await db.collection("messages").updateOne({ id: m.id }, { $set: m }, { upsert: true });
    }
    await db.collection("settings").updateOne({ _id: "main" }, { $set: settings }, { upsert: true });

    const counts = {
        cars: await db.collection("cars").countDocuments(),
        bookings: await db.collection("bookings").countDocuments(),
        messages: await db.collection("messages").countDocuments(),
        settings: await db.collection("settings").countDocuments()
    };

    console.log("Synced local default data to MongoDB Atlas:");
    console.log(counts);
    await client.close();
}

main().catch((err) => {
    console.error("Seed failed:", err.message);
    process.exit(1);
});
