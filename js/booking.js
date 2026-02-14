import { app } from "./firebase-config.js";

import { getAuth }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { getFirestore, collection, getDocs, doc, updateDoc, addDoc, query, where }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

window.bookEvent = async function(eventId, seatsLeft, title) {

    if (seatsLeft <= 0) {
        alert("Event Full");
        return;
    }

    const user = auth.currentUser;

    if (!user) {
        alert("User not logged in");
        return;
    }

    try {

        // Check duplicate booking
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

        // Reduce seat
        const eventRef = doc(db, "events", eventId);

        await updateDoc(eventRef, {
            seatsLeft: seatsLeft - 1
        });

        // Add booking
        await addDoc(collection(db, "bookings"), {
            eventId: eventId,
            userEmail: user.email,
            eventTitle: title
        });

        alert("Booking Successful");

        loadEvents();

    } catch (error) {
        console.error(error);
    }
};

async function loadEvents() {

    const querySnapshot = await getDocs(collection(db, "events"));

    const eventList = document.getElementById("eventList");
    eventList.innerHTML = "";

    querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        eventList.innerHTML += `
            <p>${data.title} - Seats Left: ${data.seatsLeft}
            <button onclick="bookEvent('${docSnap.id}', ${data.seatsLeft}, '${data.title}')">Book</button>
            </p>
        `;
    });
}

loadEvents();
