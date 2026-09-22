# DriveEasy Car Rental

Car rental website with customer pages + admin panel. Data is stored in **MongoDB Atlas** through a Node/Express API. If the API is offline, the site falls back to browser localStorage.

---

## Admin Login Credentials

| Field    | Value      |
|----------|------------|
| Username | admin      |
| Password | admin123   |

---

## MongoDB Setup (Required)

1. In MongoDB Atlas → **Database Access**, create a user and copy username + password  
2. In **Network Access**, click **Allow Access from Anywhere** (`0.0.0.0/0`)  
3. In **Clusters** → **Connect** → **Drivers**, copy the connection string  
4. Create a `.env` file in the project root (copy from `.env.example`):

```
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster0.vg8xgoh.mongodb.net/driveeasy?appName=Cluster0
PORT=3000
```

5. Install and run:

```
npm install
npm start
```

6. Open: http://localhost:3000  
   Admin: http://localhost:3000/admin.html

### Vercel deploy

1. Add environment variable `MONGODB_URI` in Vercel project settings (same value as `.env`)  
2. Redeploy the project  
3. Atlas Network Access must allow `0.0.0.0/0`

---

## Project File Structure

`
DriveEasy/
|
+-- server.js         # Express API + static file server
+-- db.js             # MongoDB connection + seed data
+-- api.js            # Frontend API client
+-- .env              # MongoDB URI (do not commit)
+-- .env.example      # Template for .env
+-- package.json
|
+-- index.html        # Home page
+-- cars.html         # Full fleet listing
+-- booking.html      # Booking form
+-- about.html        # About Us
+-- contact.html      # Contact form
|
+-- admin.html        # Admin dashboard
+-- admin.css
+-- admin.js
|
+-- style.css
+-- script.js
+-- images/
`

---

## Features Overview

### Customer Side

| Feature | Description |
|---------|-------------|
| Home Page | Hero section, dynamic car listings, search form |
| Cars Page | Full fleet with booking buttons |
| Booking Form | Live cost estimator and WhatsApp booking |
| About Page | Company info and team section |
| Contact Page | Contact form saved to MongoDB |

### Admin Panel

| Feature | Description |
|---------|-------------|
| Dashboard | Stats: cars, bookings, messages, revenue |
| Fleet (Cars) | Add / Edit / Delete cars |
| Bookings | View bookings, update status |
| Messages | View customer messages |
| Settings | Credentials, WhatsApp, company details |

---

## Data Storage

| Data | MongoDB Collection |
|------|--------------------|
| Cars/Fleet | cars |
| Bookings | bookings |
| Messages | messages |
| Settings | settings |

---

## Tech Stack

| Technology | Usage |
|-----------|-------|
| HTML5 / CSS3 / JS | Frontend |
| Node.js + Express | Backend API |
| MongoDB Atlas | Database |
| Font Awesome 6 | Icons |
| WhatsApp API | Booking via wa.me |

---

Built for DriveEasy Car Rental
