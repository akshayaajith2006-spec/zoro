import { app } from "./firebase-config.js";

import { getAuth, signOut, onAuthStateChanged }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    doc,
    addDoc,
    deleteDoc,
    query,
    where,
    getDoc,
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

// ========== MODAL LOGIC ==========
let pendingBookingEventId = null;
let pendingBookingTitle = null;

window.closeModal = function () {
    document.getElementById("modalOverlay").classList.remove("show");
    pendingBookingEventId = null;
    pendingBookingTitle = null;
};

function showNonCancellableWarning(eventId, title) {
    pendingBookingEventId = eventId;
    pendingBookingTitle = title;
    document.getElementById("modalOverlay").classList.add("show");

    const confirmBtn = document.getElementById("modalConfirmBtn");
    confirmBtn.onclick = async function () {
        const eid = pendingBookingEventId;
        const etitle = pendingBookingTitle;
        window.closeModal();
        await executeBooking(eid, etitle);
    };
}

// Close modal on overlay click
document.getElementById("modalOverlay")?.addEventListener("click", function (e) {
    if (e.target === this) window.closeModal();
});

// ========== BOOKING ==========
window.bookEvent = async function (eventId, title, cancellable) {
    const user = auth.currentUser;
    if (!user) {
        showToast("Please log in first", "error");
        return;
    }

    // If non-cancellable, show warning first
    if (!cancellable) {
        showNonCancellableWarning(eventId, title);
        return;
    }

    await executeBooking(eventId, title);
};

async function executeBooking(eventId, title) {
    const user = auth.currentUser;
    if (!user) return;

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

        // Redirect to confirmation page
        window.location.href = `confirmation.html?event=${eventId}`;

    } catch (error) {
        showToast(typeof error === "string" ? error : "Booking failed", "error");
        console.error(error);
        if (btn) { btn.disabled = false; btn.textContent = "Book Now"; }
    }
}

// ========== CANCEL BOOKING ==========
window.cancelBooking = async function (bookingId, eventId) {
    const user = auth.currentUser;
    if (!user) return;

    const confirmCancel = confirm("Are you sure you want to cancel this booking?");
    if (!confirmCancel) return;

    try {
        // Delete the booking
        await deleteDoc(doc(db, "bookings", bookingId));

        // Restore seat count
        const eventRef = doc(db, "events", eventId);
        await runTransaction(db, async (transaction) => {
            const eventDoc = await transaction.get(eventRef);
            if (eventDoc.exists()) {
                transaction.update(eventRef, {
                    seatsLeft: eventDoc.data().seatsLeft + 1
                });
            }
        });

        showToast("Booking cancelled successfully", "success");
    } catch (error) {
        showToast("Failed to cancel booking", "error");
        console.error(error);
    }
};

// Fallback SVG for events without image
const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' fill='%230c0c0f'%3E%3Crect width='400' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Inter,sans-serif' font-size='18' fill='%234b5563'%3E🎫 Event%3C/text%3E%3C/svg%3E";

// Seat badge helper
function seatBadge(seats) {
    if (seats <= 0) return `<span class="badge badge-full">Sold Out</span>`;
    if (seats <= 5) return `<span class="badge badge-limited">${seats} left</span>`;
    return `<span class="badge badge-open">${seats} available</span>`;
}

// ========== LOAD EVENTS (Real-Time) ==========
function loadEventsRealtime() {
    const eventList = document.getElementById("eventList");
    const loading = document.getElementById("loading");

    onSnapshot(collection(db, "events"), async (snapshot) => {
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

        // Fetch current user's bookings to check which events are already booked
        const user = auth.currentUser;
        let bookedEventIds = new Set();

        if (user) {
            try {
                const bookingsQuery = query(
                    collection(db, "bookings"),
                    where("userEmail", "==", user.email)
                );
                const bookingsSnap = await getDocs(bookingsQuery);
                bookingsSnap.forEach((b) => bookedEventIds.add(b.data().eventId));
            } catch (e) {
                console.error("Error fetching bookings:", e);
            }
        }

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const isCancellable = data.cancellable !== false;

            const image = data.imageUrl && data.imageUrl.trim() !== ""
                ? data.imageUrl
                : FALLBACK_IMAGE;

            const isFull = data.seatsLeft <= 0;
            const isBooked = bookedEventIds.has(docSnap.id);

            const card = document.createElement("div");
            card.className = "event-card";

            let buttonText, buttonDisabled, buttonClass;
            if (isBooked) {
                buttonText = "✅ Booked";
                buttonDisabled = true;
                buttonClass = "book-btn booked-btn";
            } else if (isFull) {
                buttonText = "Sold Out";
                buttonDisabled = true;
                buttonClass = "book-btn";
            } else {
                buttonText = "Book Now";
                buttonDisabled = false;
                buttonClass = "book-btn";
            }

            const cancellableBadge = isCancellable
                ? ''
                : '<span class="badge badge-full" style="margin-top: 8px;">🔒 Non-cancellable</span>';

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
                    ${cancellableBadge}
                    <button class="${buttonClass}"
                        data-event-id="${docSnap.id}"
                        onclick="bookEvent('${docSnap.id}', '${data.title.replace(/'/g, "\\\\'")}', ${isCancellable})"
                        ${buttonDisabled ? 'disabled' : ''}>
                        ${buttonText}
                    </button>
                </div>
            `;

            eventList.appendChild(card);
        });
    });
}

// ========== LOAD MY BOOKINGS (Real-Time) ==========
function loadMyBookings() {
    const myBookingsDiv = document.getElementById("myBookings");
    if (!myBookingsDiv) return;

    onAuthStateChanged(auth, (user) => {
        if (!user) return;

        const q = query(
            collection(db, "bookings"),
            where("userEmail", "==", user.email)
        );

        onSnapshot(q, async (snapshot) => {
            myBookingsDiv.innerHTML = "";

            if (snapshot.empty) {
                myBookingsDiv.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📭</div>
                        <p>No bookings yet. Browse and book events above!</p>
                    </div>
                `;
                return;
            }

            for (const bookingDoc of snapshot.docs) {
                const booking = bookingDoc.data();

                // Get event details
                let eventData = null;
                try {
                    const eventSnap = await getDoc(doc(db, "events", booking.eventId));
                    if (eventSnap.exists()) {
                        eventData = eventSnap.data();
                    }
                } catch (e) {
                    console.error("Error fetching event:", e);
                }

                const isCancellable = eventData ? eventData.cancellable !== false : true;

                const card = document.createElement("div");
                card.className = "booking-card";

                card.innerHTML = `
                    <div class="booking-card-body">
                        <div class="event-card-title">${booking.eventTitle || "Unknown Event"}</div>
                        ${eventData ? `
                            <div class="event-card-info">
                                <p><span class="info-icon">📍</span> ${eventData.venue || "TBA"}</p>
                                <p><span class="info-icon">📅</span> ${eventData.date || "—"}</p>
                                <p><span class="info-icon">🕐</span> ${eventData.time || "—"}</p>
                            </div>
                        ` : ''}
                        ${isCancellable
                        ? `<button class="cancel-btn" onclick="cancelBooking('${bookingDoc.id}', '${booking.eventId}')">Cancel Booking</button>`
                        : `<div class="non-cancellable-label">🔒 Non-cancellable</div>`
                    }
                    </div>
                `;

                myBookingsDiv.appendChild(card);
            }
        });
    });
}

loadEventsRealtime();
loadMyBookings();
