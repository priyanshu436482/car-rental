# DriveEasy Car Rental

A fully functional car rental website with a customer-facing frontend and a complete admin panel built with pure HTML, CSS, and JavaScript. No server or database required. All data is stored in the browser localStorage.

---

## Admin Login Credentials

| Field    | Value      |
|----------|------------|
| Username | admin      |
| Password | admin123   |

> Change your password after first login via Admin Panel - Settings tab.

---

## Project File Structure

`
DriveEasy/
|
+-- index.html        # Home page (car listings, search, hero section)
+-- cars.html         # Full fleet listing page
+-- booking.html      # Car booking form with WhatsApp integration
+-- about.html        # About Us page
+-- contact.html      # Contact form page
|
+-- admin.html        # Admin dashboard (login + full panel)
+-- admin.css         # Admin panel styles
+-- admin.js          # Admin panel logic
|
+-- style.css         # Global/client styles
+-- script.js         # Shared JS (data store, car rendering)
|
+-- images/
    +-- car1.jpg      # Maruti Suzuki Swift
    +-- car2.jpg      # Maruti Suzuki Baleno
    +-- car3.jpg      # Maruti Suzuki Brezza
    +-- car4.jpg      # Hyundai Creta
    +-- car5.jpg      # Hyundai i20
    +-- car6.jpg      # Mahindra Thar
    +-- car7.jpg      # Honda City
    +-- car8.jpg      # Toyota Fortuner
    +-- car9.jpg      # Kia Seltos
    +-- car.png       # Fallback car image
    +-- about.jpg     # About page hero
    +-- team1.jpg     # Team member 1
    +-- team2.jpg     # Team member 2
    +-- team3.jpg     # Team member 3
`

---

## Setup on a New Laptop (Step-by-Step)

### Option A - VS Code + Live Server (Recommended)

1. Install VS Code
   Download from: https://code.visualstudio.com/

2. Install the Live Server extension
   - Open VS Code
   - Press Ctrl + Shift + X to open Extensions
   - Search Live Server by Ritwick Dey
   - Click Install

3. Copy the project folder to your laptop
   - Copy the entire DriveEasy folder to your Desktop or any folder

4. Open the project in VS Code
   - Open VS Code > File > Open Folder > Select the project folder

5. Start the website
   - Right-click on index.html in the Explorer panel
   - Click Open with Live Server
   - Your browser will open at http://127.0.0.1:5500/index.html

6. Access the Admin Panel
   - Go to: http://127.0.0.1:5500/admin.html
   - Username: admin
   - Password: admin123

---

### Option B - Open Directly in Browser

> Some features may not work when opened as a file (file:///...). Option A is strongly recommended.

1. Copy the project folder to your laptop
2. Double-click index.html to open in your browser
3. Navigate to admin.html manually for the admin panel

---

## Features Overview

### Customer Side

| Feature | Description |
|---------|-------------|
| Home Page | Hero section, dynamic car listings (up to 6), search form |
| Cars Page | Full fleet with booking buttons |
| Booking Form | Modern form with live cost estimator and WhatsApp booking |
| About Page | Company info and team section |
| Contact Page | Contact form that saves to admin messages |

### Admin Panel

| Feature | Description |
|---------|-------------|
| Dashboard | Stats: total cars, bookings, messages, revenue |
| Fleet (Cars) | Add / Edit / Delete cars with drag-and-drop photo upload |
| Bookings | View all bookings, update status |
| Messages | View customer messages from contact form |
| Settings | Change admin credentials, WhatsApp number, company details |

---

## WhatsApp Integration

When a customer submits the booking form, the details are automatically sent to WhatsApp.

To set your own WhatsApp number:
1. Go to Admin Panel > Settings
2. Update the WhatsApp Phone field
   Format: 91XXXXXXXXXX (country code + number, no + or spaces)
3. Click Save Settings

---

## Data Storage

All data is saved in the browser localStorage. No database or internet required.

| Data | localStorage Key |
|------|-----------------|
| Cars/Fleet | driveeasy_cars |
| Bookings | driveeasy_bookings |
| Messages | driveeasy_messages |
| Settings | driveeasy_settings |

> Important: Data is stored per browser per device. On a new laptop the site loads with default sample data.
> To transfer your data: DevTools (F12) > Application > Local Storage > copy the values.

---

## Resetting to Default Data

If something goes wrong or you want a fresh start:

1. Open the website in Chrome
2. Press F12 to open DevTools
3. Go to Application > Local Storage > http://127.0.0.1:5500
4. Delete all keys starting with driveeasy_
5. Refresh the page - default data will reload automatically

---

## Customizing the Website

| What to Change | Where |
|---------------|-------|
| Company name / branding | Edit text in index.html, about.html, contact.html |
| Primary color (orange) | Search #ff6600 in style.css and admin.css |
| Default car fleet | Edit defaultCars array in script.js (line ~38) |
| Admin credentials | Admin Panel > Settings tab |
| WhatsApp number | Admin Panel > Settings tab |
| Car images | Replace files in images/ folder (keep same filenames) |

---

## Default Fleet (Pre-loaded Cars)

| # | Car Name | Category | Price/Day |
|---|----------|----------|-----------|
| 1 | Maruti Suzuki Swift | Hatchback | Rs.1,800 |
| 2 | Maruti Suzuki Baleno | Hatchback | Rs.2,000 |
| 3 | Maruti Suzuki Brezza | SUV | Rs.2,500 |
| 4 | Hyundai Creta | SUV | Rs.3,000 |
| 5 | Hyundai i20 | Hatchback | Rs.2,200 |
| 6 | Mahindra Thar | SUV | Rs.4,000 |
| 7 | Honda City | Sedan | Rs.2,500 |
| 8 | Toyota Fortuner | SUV | Rs.5,500 |
| 9 | Kia Seltos | SUV | Rs.3,200 |

---

## Known Limitations

- Auth is client-side only - not secure for production deployment
- Data is browser-specific - clearing browser cache clears all data
- No backend - no real payment processing or email sending
- No multi-user - only one admin account

---

## Tech Stack

| Technology | Usage |
|-----------|-------|
| HTML5 | Page structure and semantics |
| CSS3 | Styling, animations, glassmorphism |
| Vanilla JavaScript | All logic, localStorage, DOM manipulation |
| Font Awesome 6 | Icons throughout the site |
| Google Fonts (Poppins) | Typography |
| WhatsApp API | Booking confirmation via wa.me link |

---

Built with love for DriveEasy Car Rental
