// ================================
// DriveEasy Car Rental
// script.js (UI helpers — data lives in api.js + MongoDB)
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

document.querySelectorAll("#menu a").forEach(link => {
    link.addEventListener("click", () => {
        menu.classList.remove("active");
    });
});

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

function renderClientCars() {
    const carContainer = document.querySelector(".car-container");
    if (!carContainer) return;

    const cars = getCars();
    const settings = getSettings();
    const path = window.location.pathname.toLowerCase();
    const isHomePage = path.includes("index.html") || path.endsWith("/") || path.endsWith("/data.csv") || !path.includes(".html");

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

document.querySelectorAll("a[href^='#']").forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
            target.scrollIntoView({ behavior: "smooth" });
        }
    });
});

const copy = document.querySelector(".copy p");
if (copy) {
    copy.innerHTML = `© ${new Date().getFullYear()} DriveEasy Car Rental. All Rights Reserved.`;
}

document.addEventListener("DOMContentLoaded", async () => {
    await initStore();
    renderClientCars();
});
