import { app } from "./firebase-config.js";

import { getAuth, signOut }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { getFirestore, collection, addDoc, getDocs }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

window.logoutUser = async function () {
    await signOut(auth);
    window.location.href = "index.html";
};

window.addEvent = async function () {

    const title = document.getElementById("title").value;
    const seats = parseInt(document.getElementById("seats").value);

    if (!title || !seats) {
        alert("Please fill all fields");
        return;
    }

    try {
        await addDoc(collection(db, "events"), {
            title: title,
            seatsLeft: seats
        });

        alert("Event Added Successfully");
        loadEvents();

    } catch (error) {
        console.error("Error adding event:", error);
    }
};

async function loadEvents() {

    const querySnapshot = await getDocs(collection(db, "events"));

    const eventList = document.getElementById("eventList");
    eventList.innerHTML = "";

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        eventList.innerHTML += `
            <p>${data.title} - Seats: ${data.seatsLeft}</p>
        `;
    });
}

loadEvents();
