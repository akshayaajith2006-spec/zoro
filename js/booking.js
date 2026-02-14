import { app } from "./firebase-config.js";

import { getAuth, signOut }
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

// Logout
window.logoutUser = async function () {
    await signOut(auth);
    window.location.href = "index.html";
};

// Booking with Transaction
window.bookEvent = async function (eventId, title) {

    const user = auth.currentUser;

    if (!user) {
        alert("User not logged in");
        return;
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
            alert("You have already booked this event");
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
                throw "Event Full";
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

        alert("Booking Successful");

    } catch (error) {
        alert(error);
        console.error(error);
    }
};

// Load Events
function loadEventsRealtime() {

    const eventList = document.getElementById("eventList");

    onSnapshot(collection(db, "events"), (snapshot) => {

        eventList.innerHTML = "";

        snapshot.forEach((docSnap) => {

            const data = docSnap.data();

            eventList.innerHTML += `
                <p>
                    ${data.title} - Seats Left: ${data.seatsLeft}
                    <button onclick="bookEvent('${docSnap.id}', '${data.title}')">
                        Book
                    </button>
                </p>
            `;
        });
    });
}

loadEventsRealtime();


loadEventsRealtime();

loadEvents();
