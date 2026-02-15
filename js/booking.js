import { app } from "./firebase-config.js";

import { getAuth, signOut, onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    doc,
    addDoc,
    query,
    where,
    runTransaction,
    onSnapshot,
    getDocs
}
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

// Show user email in welcome text
onAuthStateChanged(auth, (user) => {
    const welcomeEl = document.getElementById("welcomeText");
    if (user && welcomeEl) {
        welcomeEl.textContent = `Welcome, ${user.email}`;
    }
});

// Logout
window.logoutUser = async function () {
    await signOut(auth);
    window.location.href = "index.html";
};

// Booking with Transaction
window.bookEvent = async function (eventId, title) {
    const user = auth.currentUser;

    if (!user) {
        showToast("Please log in first", "error");
        return;
    }

    // Disable the clicked button
    const btn = document.querySelector(`[data-event-id="${eventId}"]`);
    if (btn) {
        btn.disabled = true;
        btn.textContent = "Booking...";
    }

    try {
        // Duplicate check
        const q = query(
            collection(db, "bookings"),
            where("eventId", "==", eventId),
            where("userEmail", "==", user.email)
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            showToast("You have already booked this event", "error");
            if (btn) { btn.disabled = false; btn.textContent = "Book Now"; }
            return;
        }

        const eventRef = doc(db, "events", eventId);

        await runTransaction(db, async (transaction) => {
            const eventDoc = await transaction.get(eventRef);

            if (!eventDoc.exists()) {
                throw "Event does not exist!";
            }

            const currentSeats = eventDoc.data().seatsLeft;

            if (currentSeats <= 0) {
                throw "Event is fully booked";
            }

            transaction.update(eventRef, {
                seatsLeft: currentSeats - 1
            });
        });

        await addDoc(collection(db, "bookings"), {
            eventId: eventId,
            userEmail: user.email,
            eventTitle: title
        });

        // 🔥 ONLY CHANGE: redirect to confirmation page
        window.location.href = `confirmation.html?event=${eventId}`;

    } catch (error) {
        showToast(typeof error === "string" ? error : "Booking failed", "error");
        console.error(error);
        if (btn) { btn.disabled = false; btn.textContent = "Book Now"; }
    }
};

// Fallback SVG for events without image
const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' fill='%231a1a2e'%3E%3Crect width='400' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Inter,sans-serif' font-size='18' fill='%2364748b'%3E🎫 Event%3C/text%3E%3C/svg%3E";

// Seat badge helper
function seatBadge(seats) {
    if (seats <= 0) return `<span class="badge badge-full">Sold Out</span>`;
    if (seats <= 5) return `<span class="badge badge-limited">${seats} left</span>`;
    return `<span class="badge badge-open">${seats} available</span>`;
}

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
                    <div class="empty-icon">📅</div>
                    <p>No events available right now. Check back later!</p>
                </div>
            `;
            return;
        }

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();

            const image = data.imageUrl && data.imageUrl.trim() !== ""
                ? data.imageUrl
                : FALLBACK_IMAGE;

            const isFull = data.seatsLeft <= 0;

            const card = document.createElement("div");
            card.className = "event-card";

            card.innerHTML = `
                <img class="event-card-img" src="${image}" alt="${data.title}" onerror="this.src='${FALLBACK_IMAGE}'">
                <div class="event-card-body">
                    <div class="event-card-title">${data.title}</div>
                    <div class="event-card-info">
                        <p><span class="info-icon">📍</span> ${data.venue || "TBA"}</p>
                        <p><span class="info-icon">📅</span> ${data.date || "—"}</p>
                        <p><span class="info-icon">🕐</span> ${data.time || "—"}</p>
                        <p>${seatBadge(data.seatsLeft)}</p>
                    </div>
                    <button class="book-btn"
                        data-event-id="${docSnap.id}"
                        onclick="bookEvent('${docSnap.id}', '${data.title.replace(/'/g, "\\'")}')"
                        ${isFull ? 'disabled' : ''}>
                        ${isFull ? 'Sold Out' : 'Book Now'}
                    </button>
                </div>
            `;

            eventList.appendChild(card);
        });
    });
}

loadEventsRealtime();
