import { app } from "./firebase-config.js";

import { getAuth, signOut }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { getFirestore, collection, addDoc, onSnapshot }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

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

// Add Event
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
    btn.textContent = "Creating...";

    try {
        await addDoc(collection(db, "events"), {
            title: title,
            seatsLeft: seats,
            venue: venue,
            date: date,
            time: time,
            instructions: instructions || "",
            imageUrl: imageUrl || ""
        });

        showToast("Event created successfully!", "success");

        // Clear form
        document.getElementById("title").value = "";
        document.getElementById("seats").value = "";
        document.getElementById("venue").value = "";
        document.getElementById("date").value = "";
        document.getElementById("time").value = "";
        document.getElementById("instructions").value = "";
        document.getElementById("imageUrl").value = "";

    } catch (error) {
        showToast("Error creating event", "error");
        console.error("Error adding event:", error);
    }

    btn.disabled = false;
    btn.textContent = "🚀 Create Event";
};

// Load Events (Real-Time with onSnapshot)
function loadEventsRealtime() {
    const eventList = document.getElementById("eventList");
    const loading = document.getElementById("loading");

    onSnapshot(collection(db, "events"), (snapshot) => {
        // Hide loading spinner
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
            `;

            eventList.appendChild(div);
        });
    });
}

loadEventsRealtime();
