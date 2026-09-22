require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB, getDB, getDefaultSettings } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.static(__dirname));

function stripMongoId(doc) {
    if (!doc) return doc;
    const { _id, ...rest } = doc;
    return rest;
}

// ---------- Health ----------
app.get("/api/health", async (req, res) => {
    try {
        await getDB().command({ ping: 1 });
        res.json({ ok: true, database: "mongodb" });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

// ---------- Cars ----------
app.get("/api/cars", async (req, res) => {
    try {
        const cars = await getDB().collection("cars").find({}).sort({ id: 1 }).toArray();
        res.json(cars.map(stripMongoId));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/cars", async (req, res) => {
    try {
        const car = { ...req.body };
        if (!car.id) car.id = Date.now();
        car.id = Number(car.id);
        await getDB().collection("cars").insertOne(car);
        res.status(201).json(stripMongoId(car));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/api/cars/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const data = { ...req.body, id };
        delete data._id;
        await getDB().collection("cars").updateOne({ id }, { $set: data }, { upsert: true });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/api/cars/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        await getDB().collection("cars").deleteOne({ id });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---------- Bookings ----------
app.get("/api/bookings", async (req, res) => {
    try {
        const bookings = await getDB().collection("bookings").find({}).toArray();
        res.json(bookings.map(stripMongoId));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/bookings", async (req, res) => {
    try {
        const booking = { ...req.body };
        if (!booking.id) booking.id = "BK" + Math.floor(1000 + Math.random() * 9000);
        await getDB().collection("bookings").insertOne(booking);
        res.status(201).json(stripMongoId(booking));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/api/bookings/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const data = { ...req.body, id };
        delete data._id;
        await getDB().collection("bookings").updateOne({ id }, { $set: data }, { upsert: true });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/api/bookings/:id", async (req, res) => {
    try {
        await getDB().collection("bookings").deleteOne({ id: req.params.id });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---------- Messages ----------
app.get("/api/messages", async (req, res) => {
    try {
        const messages = await getDB().collection("messages").find({}).toArray();
        res.json(messages.map(stripMongoId));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/messages", async (req, res) => {
    try {
        const message = { ...req.body };
        if (!message.id) message.id = "MSG" + Math.floor(100 + Math.random() * 900);
        await getDB().collection("messages").insertOne(message);
        res.status(201).json(stripMongoId(message));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/api/messages/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const data = { ...req.body, id };
        delete data._id;
        await getDB().collection("messages").updateOne({ id }, { $set: data }, { upsert: true });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/api/messages/:id", async (req, res) => {
    try {
        await getDB().collection("messages").deleteOne({ id: req.params.id });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---------- Settings ----------
app.get("/api/settings", async (req, res) => {
    try {
        const settings = await getDB().collection("settings").findOne({ _id: "main" });
        res.json(stripMongoId(settings || getDefaultSettings()));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/api/settings", async (req, res) => {
    try {
        const data = { ...getDefaultSettings(), ...req.body, _id: "main" };
        await getDB().collection("settings").updateOne(
            { _id: "main" },
            { $set: data },
            { upsert: true }
        );
        res.json(stripMongoId(data));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

async function start() {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`DriveEasy running at http://localhost:${PORT}`);
            console.log(`Admin panel: http://localhost:${PORT}/admin.html`);
        });
    } catch (err) {
        console.error("Failed to start server:", err.message);
        process.exit(1);
    }
}

// Local: npm start | Vercel: serverless via export
if (require.main === module) {
    start();
} else {
    module.exports = async (req, res) => {
        try {
            await connectDB();
        } catch (err) {
            // Allow static pages to load; only API routes hard-fail
            if (req.url && req.url.startsWith("/api/")) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ ok: false, error: "Database connection failed: " + err.message }));
                return;
            }
            console.error("DB unavailable:", err.message);
        }
        return app(req, res);
    };
}
