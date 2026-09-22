// ====================================================
// DriveEasy Car Rental - Admin Dashboard Logic
// ====================================================

window.DEFAULT_CAR_SVG = window.DEFAULT_CAR_SVG || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'%3E%3Crect width='400' height='250' fill='%231e293b'/%3E%3Cpath d='M80 160 L120 100 L280 100 L320 160 Z' fill='%23ff6600' opacity='0.8'/%3E%3Crect x='60' y='150' width='280' height='45' rx='10' fill='%23334155'/%3E%3Ccircle cx='110' cy='195' r='22' fill='%230f172a' stroke='%2394a3b8' stroke-width='4'/%3E%3Ccircle cx='290' cy='195' r='22' fill='%230f172a' stroke='%2394a3b8' stroke-width='4'/%3E%3Ccircle cx='110' cy='195' r='8' fill='%23e2e8f0'/%3E%3Ccircle cx='290' cy='195' r='8' fill='%23e2e8f0'/%3E%3Cpolygon points='135,108 265,108 275,150 125,150' fill='%2338bdf8' opacity='0.6'/%3E%3Ctext x='200' y='55' fill='%23f8fafc' font-family='sans-serif' font-size='18' font-weight='bold' text-anchor='middle'%3EDriveEasy Rental%3C/text%3E%3C/svg%3E";

document.addEventListener("DOMContentLoaded", async () => {
    await initStore();
    initAdmin();
});

// Admin Initialization
function initAdmin() {
    checkAuthStatus();
    setupEventListeners();
    refreshAllData();
}

// Authentication Check
function checkAuthStatus() {
    const isLoggedIn = sessionStorage.getItem("driveeasy_admin_logged") === "true";
    const authScreen = document.getElementById("authScreen");
    const adminApp = document.getElementById("adminApp");

    if (isLoggedIn) {
        authScreen.style.display = "none";
        adminApp.style.display = "flex";
        loadAdminProfile();
    } else {
        authScreen.style.display = "flex";
        adminApp.style.display = "none";
        document.getElementById("loginForm")?.reset();
    }
}

function loadAdminProfile() {
    const settings = getSettings();
    const displayName = document.getElementById("adminDisplayName");
    const avatar = document.getElementById("adminAvatar");
    
    if (displayName) displayName.innerText = settings.adminUsername || "Admin";
    if (avatar) avatar.innerText = (settings.adminUsername || "A").charAt(0).toUpperCase();
}

// Event Listeners Registration
function setupEventListeners() {
    // Login Form Submit
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const user = document.getElementById("adminUser").value.trim();
            const pass = document.getElementById("adminPass").value.trim();
            const settings = getSettings();
            const storedUser = String(settings.adminUsername || "").trim();
            const storedPass = String(settings.adminPassword || "").trim();

            // Accept saved credentials OR the documented defaults (fixes stuck logins
            // when password was changed earlier in Settings / localStorage).
            const matchesStored = user === storedUser && pass === storedPass;
            const matchesDefault = user === "admin" && pass === "admin123";

            if (matchesStored || matchesDefault) {
                if (matchesDefault && !matchesStored) {
                    resetAdminCredentials();
                }
                sessionStorage.setItem("driveeasy_admin_logged", "true");
                document.getElementById("loginError").style.display = "none";
                checkAuthStatus();
                showToast("Welcome back, Admin!", "success");
            } else {
                document.getElementById("loginError").style.display = "block";
            }
        });
    }

    // Reset forgotten / changed admin credentials back to defaults
    const resetCredentialsBtn = document.getElementById("resetCredentialsBtn");
    if (resetCredentialsBtn) {
        resetCredentialsBtn.addEventListener("click", async () => {
            if (confirm("Reset admin login to default?\n\nUsername: admin\nPassword: admin123")) {
                await resetAdminCredentials();
                document.getElementById("adminUser").value = "admin";
                document.getElementById("adminPass").value = "admin123";
                document.getElementById("loginError").style.display = "none";
                alert("Credentials reset to admin / admin123. Click Sign In.");
            }
        });
    }

    // Logout
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            if (confirm("Are you sure you want to log out?")) {
                sessionStorage.removeItem("driveeasy_admin_logged");
                checkAuthStatus();
                showToast("Logged out successfully.", "info");
            }
        });
    }

    // Tab Navigation
    document.querySelectorAll(".nav-item").forEach(item => {
        item.addEventListener("click", () => {
            const targetTab = item.getAttribute("data-tab");
            switchTab(targetTab);
        });
    });

    // Mobile Sidebar Toggle
    const toggleSidebar = document.getElementById("toggleSidebar");
    if (toggleSidebar) {
        toggleSidebar.addEventListener("click", () => {
            document.getElementById("sidebar").classList.toggle("show");
        });
    }

    // Modal Events - Add Car
    const openAddCarBtn = document.getElementById("openAddCarModal");
    if (openAddCarBtn) {
        openAddCarBtn.addEventListener("click", () => openCarModal());
    }

    document.getElementById("closeCarModal")?.addEventListener("click", closeCarModal);
    document.getElementById("cancelCarModal")?.addEventListener("click", closeCarModal);
    document.getElementById("carForm")?.addEventListener("submit", handleSaveCar);
    document.getElementById("deleteCarFromModal")?.addEventListener("click", () => {
        const id = document.getElementById("carId").value;
        if (id) deleteCar(id);
    });

    // Car Image File Upload & Dropzone Handlers
    const fileInput = document.getElementById("carImageFile");
    const urlInput = document.getElementById("carImage");
    const previewImg = document.getElementById("carImagePreview");
    const dropzone = document.getElementById("carDropzone");
    const triggerFileBtn = document.getElementById("triggerFileSelect");
    const toggleUrlBtn = document.getElementById("toggleUrlInput");
    const urlContainer = document.getElementById("urlInputContainer");

    const processImageFile = (file) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target.result;
                if (urlInput) urlInput.value = dataUrl;
                if (previewImg) {
                    previewImg.src = dataUrl;
                    const container = document.getElementById("imagePreviewContainer");
                    if (container) container.style.display = "block";
                }
            };
            reader.readAsDataURL(file);
        }
    };

    if (dropzone) {
        dropzone.addEventListener("click", (e) => {
            if (e.target !== fileInput && fileInput) fileInput.click();
        });
        dropzone.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropzone.classList.add("drag-over");
        });
        dropzone.addEventListener("dragleave", () => {
            dropzone.classList.remove("drag-over");
        });
        dropzone.addEventListener("drop", (e) => {
            e.preventDefault();
            dropzone.classList.remove("drag-over");
            if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
                processImageFile(e.dataTransfer.files[0]);
            }
        });
    }

    if (triggerFileBtn && fileInput) {
        triggerFileBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            fileInput.click();
        });
    }

    if (toggleUrlBtn && urlContainer) {
        toggleUrlBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const isHidden = urlContainer.style.display === "none";
            urlContainer.style.display = isHidden ? "block" : "none";
        });
    }

    const deleteImageBtn = document.getElementById("deleteCarImageBtn");
    if (deleteImageBtn) {
        deleteImageBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (urlInput) urlInput.value = "";
            if (fileInput) fileInput.value = "";
            if (previewImg) previewImg.src = window.DEFAULT_CAR_SVG;
            showToast("Car photo removed.", "info");
        });
    }

    if (fileInput) {
        fileInput.addEventListener("change", (e) => {
            processImageFile(e.target.files[0]);
        });
    }

    if (urlInput) {
        urlInput.addEventListener("input", (e) => {
            if (previewImg) {
                previewImg.src = e.target.value || window.DEFAULT_CAR_SVG;
            }
        });
    }

    // Modal Events - Add Manual Booking
    const openAddBookingBtn = document.getElementById("openAddBookingModal");
    if (openAddBookingBtn) {
        openAddBookingBtn.addEventListener("click", () => openBookingModal());
    }

    document.getElementById("closeBookingModal")?.addEventListener("click", closeBookingModal);
    document.getElementById("cancelBookingModal")?.addEventListener("click", closeBookingModal);
    document.getElementById("manualBookingForm")?.addEventListener("submit", handleSaveManualBooking);

    // Filters and Search
    document.getElementById("filterBookingStatus")?.addEventListener("change", renderBookingsTable);
    document.getElementById("globalSearch")?.addEventListener("input", handleGlobalSearch);

    // Settings Forms
    document.getElementById("settingsSecurityForm")?.addEventListener("submit", handleSaveSecuritySettings);
    document.getElementById("settingsBusinessForm")?.addEventListener("submit", handleSaveBusinessSettings);

    // Password Toggle Listeners
    document.querySelectorAll(".toggle-password-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = btn.getAttribute("data-target");
            const input = document.getElementById(targetId);
            const icon = btn.querySelector("i");
            if (input && icon) {
                if (input.type === "password") {
                    input.type = "text";
                    icon.classList.remove("fa-eye");
                    icon.classList.add("fa-eye-slash");
                } else {
                    input.type = "password";
                    icon.classList.remove("fa-eye-slash");
                    icon.classList.add("fa-eye");
                }
            }
        });
    });
}

// Tab Switcher
function switchTab(tabId) {
    document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".tab-pane").forEach(el => el.classList.remove("active"));

    const activeNav = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
    const activePane = document.getElementById(`${tabId}Tab`);

    if (activeNav) activeNav.classList.add("active");
    if (activePane) activePane.classList.add("active");

    // Close mobile sidebar if open
    document.getElementById("sidebar").classList.remove("show");

    refreshAllData();
}

// Refresh Data across views
function refreshAllData() {
    renderDashboardOverview();
    renderFleetGrid();
    renderBookingsTable();
    renderMessagesTable();
    loadSettingsTabValues();
}

// Dashboard Overview Calculations
function renderDashboardOverview() {
    const cars = getCars();
    const bookings = getBookings();
    const messages = getMessages();
    const settings = getSettings();

    // Total Revenue (Confirmed + Completed)
    const totalRev = bookings
        .filter(b => b.status === "Confirmed" || b.status === "Completed")
        .reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

    document.getElementById("statRevenue").innerText = `${settings.currency || '₹'}${totalRev.toLocaleString()}`;
    document.getElementById("statBookings").innerText = bookings.length;
    document.getElementById("statCars").innerText = cars.length;
    document.getElementById("statMessages").innerText = messages.length;

    // Recent Bookings Table (Top 5)
    const recentTable = document.getElementById("recentBookingsTable");
    if (!recentTable) return;

    if (bookings.length === 0) {
        recentTable.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#999; padding:20px;">No bookings found.</td></tr>`;
        return;
    }

    const sortedBookings = [...bookings].reverse().slice(0, 5);

    recentTable.innerHTML = sortedBookings.map(b => `
        <tr>
            <td><strong>${b.id}</strong></td>
            <td>${b.name}</td>
            <td>${b.car}</td>
            <td>${b.pickupDate}</td>
            <td>${settings.currency || '₹'}${Number(b.amount || 0).toLocaleString()}</td>
            <td><span class="badge badge-${getBadgeClass(b.status)}">${b.status}</span></td>
        </tr>
    `).join("");
}

// Fleet Grid Management
function renderFleetGrid() {
    const container = document.getElementById("fleetContainer");
    if (!container) return;

    const cars = getCars();
    const settings = getSettings();

    if (cars.length === 0) {
        container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; background: white; border-radius: 10px;">
            <h3>No Cars in Fleet</h3>
            <p style="color: #666; margin-top: 5px;">Click "Add New Car" above to create your first vehicle listing.</p>
        </div>`;
        return;
    }

    container.innerHTML = cars.map(car => `
        <div class="admin-car-card">
            <img src="${car.image || 'images/car1.jpg'}" alt="${car.name}" class="admin-car-img" onerror="this.onerror=null; this.src=window.DEFAULT_CAR_SVG;">
            <div class="admin-car-body">
                <div class="admin-car-title">
                    <h4>${car.name}</h4>
                    <span class="badge badge-${car.status === 'Available' ? 'success' : car.status === 'Rented' ? 'warning' : 'danger'}">${car.status}</span>
                </div>
                <div class="admin-car-specs">
                    <span><i class="fa-solid fa-car"></i> ${car.category || 'SUV'}</span>
                    <span><i class="fa-solid fa-gear"></i> ${car.transmission || 'Auto'}</span>
                    <span><i class="fa-solid fa-users"></i> ${car.seats || 5} Seats</span>
                </div>
                <div class="admin-car-price">
                    ${settings.currency || '₹'}${Number(car.price).toLocaleString()} <span style="font-size: 12px; font-weight: normal; color: #777;">/ day</span>
                </div>
                <div class="admin-car-actions">
                    <button type="button" class="btn-action edit" onclick="openCarModal(${Number(car.id)})">
                        <i class="fa-solid fa-pen-to-square"></i> Edit
                    </button>
                    <button type="button" class="btn-action delete" onclick="deleteCar(${Number(car.id)})" title="Delete this car">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `).join("");
}

function getBadgeClass(status) {
    if (status === "Confirmed" || status === "Completed" || status === "Available") return "success";
    if (status === "Pending" || status === "Rented") return "warning";
    if (status === "Cancelled" || status === "Maintenance") return "danger";
    return "info";
}

// Car Modal Open / Close / Save
function openCarModal(carId = null) {
    const modal = document.getElementById("carModal");
    const title = document.getElementById("carModalTitle");
    const form = document.getElementById("carForm");
    form.reset();

    let imgVal = "images/car1.jpg";

    if (carId) {
        const cars = getCars();
        const car = cars.find(c => Number(c.id) === Number(carId));
        if (car) {
            title.innerText = "Edit Car Details";
            document.getElementById("carId").value = car.id;
            document.getElementById("carName").value = car.name;
            document.getElementById("carCategory").value = car.category || "SUV";
            document.getElementById("carPrice").value = car.price;
            document.getElementById("carTransmission").value = car.transmission || "Automatic";
            document.getElementById("carFuel").value = car.fuel || "Petrol";
            document.getElementById("carSeats").value = car.seats || 5;
            document.getElementById("carStatus").value = car.status || "Available";
            imgVal = car.image || "images/car1.jpg";
            document.getElementById("carImage").value = imgVal;
        }
    } else {
        title.innerText = "Add New Car";
        document.getElementById("carId").value = "";
        document.getElementById("carImage").value = "images/car1.jpg";
    }

    const deleteFromModalBtn = document.getElementById("deleteCarFromModal");
    if (deleteFromModalBtn) {
        deleteFromModalBtn.style.display = carId ? "inline-flex" : "none";
    }

    const previewImg = document.getElementById("carImagePreview");
    if (previewImg) previewImg.src = imgVal;

    const urlContainer = document.getElementById("urlInputContainer");
    if (urlContainer) urlContainer.style.display = "none";

    modal.classList.add("active");
}

function closeCarModal() {
    document.getElementById("carModal").classList.remove("active");
}

function handleSaveCar(e) {
    e.preventDefault();
    const idVal = document.getElementById("carId").value;

    const carData = {
        id: idVal ? Number(idVal) : Date.now(),
        name: document.getElementById("carName").value.trim(),
        category: document.getElementById("carCategory").value,
        price: Number(document.getElementById("carPrice").value),
        transmission: document.getElementById("carTransmission").value,
        fuel: document.getElementById("carFuel").value,
        seats: Number(document.getElementById("carSeats").value),
        status: document.getElementById("carStatus").value,
        image: document.getElementById("carImage").value.trim() || "images/car1.jpg"
    };

    saveCar(carData).then(() => {
        closeCarModal();
        refreshAllData();
        showToast(`Car "${carData.name}" saved successfully!`, "success");
    }).catch(err => {
        showToast("Failed to save car: " + err.message, "info");
    });
}

async function deleteCar(id) {
    const cars = getCars();
    const car = cars.find(c => Number(c.id) === Number(id));
    const carName = car ? car.name : "this car";

    if (!confirm(`Delete "${carName}" from the fleet?\n\nThis cannot be undone.`)) {
        return;
    }

    try {
        await deleteCarById(id);
        closeCarModal();
        refreshAllData();
        showToast(`"${carName}" deleted from fleet.`, "info");
    } catch (err) {
        showToast("Failed to delete car: " + err.message, "info");
    }
}

// Expose for inline onclick handlers
window.openCarModal = openCarModal;
window.deleteCar = deleteCar;

// Bookings Table Management
function renderBookingsTable() {
    const tbody = document.getElementById("bookingsTableBody");
    if (!tbody) return;

    const bookings = getBookings();
    const settings = getSettings();
    const filterStatus = document.getElementById("filterBookingStatus")?.value || "All";
    const searchQuery = (document.getElementById("globalSearch")?.value || "").toLowerCase().trim();

    let filtered = bookings.filter(b => {
        const matchesStatus = (filterStatus === "All" || b.status === filterStatus);
        const matchesSearch = !searchQuery || 
            (b.name && b.name.toLowerCase().includes(searchQuery)) ||
            (b.car && b.car.toLowerCase().includes(searchQuery)) ||
            (b.id && b.id.toLowerCase().includes(searchQuery)) ||
            (b.phone && b.phone.includes(searchQuery));
        return matchesStatus && matchesSearch;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#999; padding:25px;">No matching bookings found.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.reverse().map(b => `
        <tr>
            <td><strong>${b.id}</strong></td>
            <td>
                <div style="font-weight: 600;">${b.name}</div>
                <div style="font-size: 12px; color: #777;">${b.email || ''}</div>
            </td>
            <td>${b.phone}</td>
            <td><strong>${b.car}</strong></td>
            <td>
                <div style="font-size: 13px;">${b.pickupDate}</div>
                <div style="font-size: 11px; color: #777;">to ${b.returnDate}</div>
            </td>
            <td>${settings.currency || '₹'}${Number(b.amount || 0).toLocaleString()}</td>
            <td>
                <select class="form-input" style="padding: 4px 8px; font-size: 12px; width: auto;" onchange="changeBookingStatus('${b.id}', this.value)">
                    <option value="Pending" ${b.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Confirmed" ${b.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="Completed" ${b.status === 'Completed' ? 'selected' : ''}>Completed</option>
                    <option value="Cancelled" ${b.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
            <td>
                <button class="btn-action delete" style="padding: 6px 10px;" onclick="deleteBooking('${b.id}')">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join("");
}

async function changeBookingStatus(id, newStatus) {
    const bookings = getBookings();
    const idx = bookings.findIndex(b => b.id === id);
    if (idx === -1) return;
    const updated = { ...bookings[idx], status: newStatus };
    try {
        await saveBooking(updated);
        refreshAllData();
        showToast(`Booking ${id} updated to ${newStatus}`, "success");
    } catch (err) {
        showToast("Failed to update booking: " + err.message, "info");
    }
}

async function deleteBooking(id) {
    if (!confirm(`Delete booking record ${id}?`)) return;
    try {
        await deleteBookingById(id);
        refreshAllData();
        showToast("Booking record deleted.", "info");
    } catch (err) {
        showToast("Failed to delete booking: " + err.message, "info");
    }
}

// Manual Booking Modal
function openBookingModal() {
    const modal = document.getElementById("bookingModal");
    const carSelect = document.getElementById("mbCar");
    const cars = getCars();

    carSelect.innerHTML = cars.map(c => `<option value="${c.name}">${c.name} (${c.category}) - ₹${c.price}/day</option>`).join("");
    
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("mbPickupDate").value = today;
    document.getElementById("mbReturnDate").value = today;
    
    modal.classList.add("active");
}

function closeBookingModal() {
    document.getElementById("bookingModal").classList.remove("active");
}

function handleSaveManualBooking(e) {
    e.preventDefault();
    const cars = getCars();
    const carName = document.getElementById("mbCar").value;
    const selectedCar = cars.find(c => c.name === carName);
    
    const pDate = new Date(document.getElementById("mbPickupDate").value);
    const rDate = new Date(document.getElementById("mbReturnDate").value);
    const diffTime = Math.max(1, Math.ceil((rDate - pDate) / (1000 * 60 * 60 * 24)));
    const totalAmount = (selectedCar ? selectedCar.price : 3000) * diffTime;

    const newBooking = {
        id: "BK" + Math.floor(1000 + Math.random() * 9000),
        name: document.getElementById("mbName").value.trim(),
        phone: document.getElementById("mbPhone").value.trim(),
        email: document.getElementById("mbEmail").value.trim(),
        car: carName,
        pickup: document.getElementById("mbPickup").value.trim(),
        pickupDate: document.getElementById("mbPickupDate").value,
        returnDate: document.getElementById("mbReturnDate").value,
        status: document.getElementById("mbStatus").value,
        amount: totalAmount,
        date: new Date().toISOString().split('T')[0]
    };

    saveBooking(newBooking).then(() => {
        closeBookingModal();
        refreshAllData();
        showToast(`Manual booking ${newBooking.id} created!`, "success");
    }).catch(err => {
        showToast("Failed to create booking: " + err.message, "info");
    });
}

// Messages Management
function renderMessagesTable() {
    const tbody = document.getElementById("messagesTableBody");
    if (!tbody) return;

    const messages = getMessages();

    if (messages.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#999; padding:25px;">No customer messages received.</td></tr>`;
        return;
    }

    tbody.innerHTML = [...messages].reverse().map(m => `
        <tr>
            <td>${m.date || 'Recent'}</td>
            <td><strong>${m.name}</strong></td>
            <td>
                <div>${m.email}</div>
                <div style="font-size: 12px; color: #777;">${m.phone}</div>
            </td>
            <td style="max-width: 280px; word-break: break-word;">${m.message}</td>
            <td>
                <span class="badge badge-${m.status === 'Unread' ? 'warning' : 'success'}">${m.status}</span>
            </td>
            <td>
                <div style="display: flex; gap: 6px;">
                    <a href="https://wa.me/${m.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(m.name)},%20regarding%20your%20inquiry:" target="_blank" class="btn-action" style="background: #25D366; color: white; border: none;" onclick="markMessageRead('${m.id}')">
                        <i class="fa-brands fa-whatsapp"></i> Reply
                    </a>
                    <button class="btn-action delete" onclick="deleteMessage('${m.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join("");
}

async function markMessageRead(id) {
    const messages = getMessages();
    const idx = messages.findIndex(m => m.id === id);
    if (idx === -1) return;
    try {
        await saveMessage({ ...messages[idx], status: "Read" });
        refreshAllData();
    } catch (err) {
        showToast("Failed to update message: " + err.message, "info");
    }
}

async function deleteMessage(id) {
    if (!confirm("Delete this inquiry message?")) return;
    try {
        await deleteMessageById(id);
        refreshAllData();
        showToast("Message deleted.", "info");
    } catch (err) {
        showToast("Failed to delete message: " + err.message, "info");
    }
}

// Settings Tab Handlers
function loadSettingsTabValues() {
    const settings = getSettings();
    const userField = document.getElementById("setAdminUser");
    const waField = document.getElementById("setWhatsapp");
    const currField = document.getElementById("setCurrency");
    const emailField = document.getElementById("setCompanyEmail");

    if (userField) userField.value = settings.adminUsername || "admin";
    if (waField) waField.value = settings.whatsappPhone || "919876543210";
    if (currField) currField.value = settings.currency || "₹";
    if (emailField) emailField.value = settings.companyEmail || "info@driveeasy.com";
}

function handleSaveSecuritySettings(e) {
    e.preventDefault();
    const newUser = document.getElementById("setAdminUser").value.trim();
    const newPass = document.getElementById("setAdminPass").value.trim();
    const settings = getSettings();

    settings.adminUsername = newUser || settings.adminUsername;
    if (newPass) settings.adminPassword = newPass;

    saveSettings(settings).then(() => {
        loadAdminProfile();
        showToast("Security settings updated successfully!", "success");
    }).catch(err => {
        showToast("Failed to save settings: " + err.message, "info");
    });
}

function handleSaveBusinessSettings(e) {
    e.preventDefault();
    const settings = getSettings();

    settings.whatsappPhone = document.getElementById("setWhatsapp").value.trim();
    settings.currency = document.getElementById("setCurrency").value.trim();
    settings.companyEmail = document.getElementById("setCompanyEmail").value.trim();

    saveSettings(settings).then(() => {
        refreshAllData();
        showToast("Business configuration saved!", "success");
    }).catch(err => {
        showToast("Failed to save settings: " + err.message, "info");
    });
}

// Global Search
function handleGlobalSearch() {
    renderBookingsTable();
}

// Toast Notifications Helper
function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `
        <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-info'}" style="color: ${type === 'success' ? '#10b981' : '#3b82f6'}; font-size: 18px;"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(100%)";
        toast.style.transition = "all 0.3s ease";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
