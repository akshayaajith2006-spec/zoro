import { app } from "./firebase-config.js";

import { getAuth, signOut }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
    getDoc,
    query,
    where,
    getDocs
}
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

let editingEventId = null;

// Toast helper
function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Logout
window.logoutUser = async function () {
    await signOut(auth);
    window.location.href = "index.html";
};

// Add or Update Event
window.addEvent = async function () {

    const title = document.getElementById("title").value.trim();
    const seats = parseInt(document.getElementById("seats").value);
    const venue = document.getElementById("venue").value.trim();
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const instructions = document.getElementById("instructions").value.trim();
    const imageUrl = document.getElementById("imageUrl").value.trim();

    if (!title || !seats || !venue || !date || !time) {
        showToast("Please fill all required fields", "error");
        return;
    }

    if (seats < 1) {
        showToast("Seat limit must be at least 1", "error");
        return;
    }

    const btn = document.querySelector(".primary-btn");
    btn.disabled = true;

    try {

        if (editingEventId) {
            // UPDATE MODE
            await updateDoc(doc(db, "events", editingEventId), {
                title,
                seatsLeft: seats,
                venue,
                date,
                time,
                instructions: instructions || "",
                imageUrl: imageUrl || ""
            });

            showToast("Event updated successfully!", "success");
            editingEventId = null;
            btn.textContent = "🚀 Create Event";

        } else {
            // CREATE MODE
            await addDoc(collection(db, "events"), {
                title,
                seatsLeft: seats,
                venue,
                date,
                time,
                instructions: instructions || "",
                imageUrl: imageUrl || ""
            });

            showToast("Event created successfully!", "success");
        }

        clearForm();

    } catch (error) {
        showToast("Operation failed", "error");
        console.error(error);
    }

    btn.disabled = false;
};

// Clear Form Helper
function clearForm() {
    document.getElementById("title").value = "";
    document.getElementById("seats").value = "";
    document.getElementById("venue").value = "";
    document.getElementById("date").value = "";
    document.getElementById("time").value = "";
    document.getElementById("instructions").value = "";
    document.getElementById("imageUrl").value = "";
}

// Edit Event
window.editEvent = async function (eventId) {

    const eventRef = doc(db, "events", eventId);
    const snapshot = await getDoc(eventRef);

    if (!snapshot.exists()) return;

    const data = snapshot.data();

    document.getElementById("title").value = data.title;
    document.getElementById("seats").value = data.seatsLeft;
    document.getElementById("venue").value = data.venue;
    document.getElementById("date").value = data.date;
    document.getElementById("time").value = data.time;
    document.getElementById("instructions").value = data.instructions;
    document.getElementById("imageUrl").value = data.imageUrl;

    editingEventId = eventId;

    document.querySelector(".primary-btn").textContent = "Update Event";

    showToast("Editing mode enabled", "info");
};

// Delete Event
window.deleteEvent = async function (eventId) {

    const confirmDelete = confirm("Are you sure you want to delete this event?");
    if (!confirmDelete) return;

    await deleteDoc(doc(db, "events", eventId));
    showToast("Event deleted", "success");
};

// Toggle View Participants
window.toggleParticipants = async function (eventId) {
    const listContainer = document.getElementById(`participants-${eventId}`);
    const btn = document.getElementById(`btn-view-${eventId}`);

    if (listContainer.style.display === "block") {
        listContainer.style.display = "none";
        listContainer.innerHTML = "";
        btn.textContent = "View Participants";
        return;
    }

    // Show loading
    listContainer.style.display = "block";
    listContainer.innerHTML = `<div style="padding:10px; text-align:center; color:var(--text-muted);">Loading...</div>`;
    btn.textContent = "Hide Participants";

    try {
        const q = query(collection(db, "bookings"), where("eventId", "==", eventId));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            listContainer.innerHTML = `<div style="padding:10px; text-align:center; color:var(--text-muted);">No participants yet.</div>`;
            return;
        }

        let html = "";
        snapshot.forEach(doc => {
            const data = doc.data();
            html += `
                <div class="participant-item">
                    <span>👤 ${data.userEmail}</span>
                </div>
            `; // Add more fields here if stored in bookings
        });

        listContainer.innerHTML = html;

    } catch (error) {
        console.error(error);
        listContainer.innerHTML = `<div style="padding:10px; text-align:center; color:var(--danger);">Error loading participants.</div>`;
    }
};

// Load Events (Real-Time)
function loadEventsRealtime() {

    const eventList = document.getElementById("eventList");
    const loading = document.getElementById("loading");

    onSnapshot(collection(db, "events"), (snapshot) => {

        if (loading) loading.style.display = "none";

        eventList.innerHTML = "";

        if (snapshot.empty) {
            eventList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📭</div>
                    <p>No events created yet</p>
                </div>
            `;
            return;
        }

        snapshot.forEach((docSnap) => {

            const data = docSnap.data();

            const div = document.createElement("div");
            div.className = "admin-event";

            div.innerHTML = `
                <div class="event-title">${data.title}</div>
                <div class="event-meta">
                    <span>📍 ${data.venue}</span>
                    <span>📅 ${data.date}</span>
                    <span>🕐 ${data.time}</span>
                    <span>💺 ${data.seatsLeft} seats</span>
                </div>
                ${data.instructions ? `<div class="event-instructions">"${data.instructions}"</div>` : ""}
                <div style="margin-top:10px;">
                    <button onclick="editEvent('${docSnap.id}')">Edit</button>
                    <button class="view-btn" id="btn-view-${docSnap.id}" onclick="toggleParticipants('${docSnap.id}')">View Participants</button>
                    <button onclick="deleteEvent('${docSnap.id}')" style="margin-left:8px; background:var(--danger);">Delete</button>
                </div>
                <div id="participants-${docSnap.id}" class="participants-list" style="display:none;"></div>
            `;

            eventList.appendChild(div);
        });
    });
}

// Toggle User Role
window.toggleRole = async function (uid, currentRole) {
    const newRole = currentRole === "admin" ? "student" : "admin";
    try {
        await updateDoc(doc(db, "users", uid), {
            role: newRole
        });
        showToast(`User ${newRole === "admin" ? "promoted" : "demoted"} successfully`, "success");
    } catch (error) {
        console.error(error);
        showToast("Failed to update role", "error");
    }
};

// Toggle User Menu Dropdown
window.toggleUserMenu = function () {
    const dropdown = document.getElementById("userDropdown");
    dropdown.classList.toggle("show");
}

// Close Dropdown when clicking outside
window.addEventListener("click", function (e) {
    const container = document.querySelector(".user-menu-container");
    if (container && !container.contains(e.target)) {
        document.getElementById("userDropdown").classList.remove("show");
    }
});

// Load Users
function loadUsers() {
    const userList = document.getElementById("userList");
    if (!userList) return;

    onSnapshot(collection(db, "users"), (snapshot) => {
        userList.innerHTML = "";

        let hasUsers = false;

        if (snapshot.empty) {
            userList.innerHTML = `<div style="padding:10px; text-align:center; color:var(--text-muted);">No registered users.</div>`;
            return;
        }

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const uid = docSnap.id;

            // FILTER: Hide main admin
            if (data.email === "admin@college.com") return;

            hasUsers = true;

            const div = document.createElement("div");
            div.className = "participant-item";

            div.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:2px;">
                     <strong style="font-size:12px;">${data.email}</strong>
                     <span class="badge ${data.role === 'admin' ? 'badge-full' : 'badge-open'}" style="text-transform:capitalize; font-size:10px; width:fit-content;">${data.role}</span>
                </div>
                <button class="secondary-btn" style="width:auto; padding: 4px 8px; font-size:11px; margin:0;" onclick="toggleRole('${uid}', '${data.role}')">
                    ${data.role === "admin" ? "Demote" : "Promote"}
                </button>
            `;

            userList.appendChild(div);
        });

        if (!hasUsers) {
            userList.innerHTML = `<div style="padding:10px; text-align:center; color:var(--text-muted);">No other users found.</div>`;
        }
    });
}

loadUsers();

loadEventsRealtime();
