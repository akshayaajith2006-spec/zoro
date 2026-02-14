import { app } from "./firebase-config.js";

import { getAuth, signInWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { getFirestore, collection, getDocs } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

window.loginUser = async function () {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        await signInWithEmailAndPassword(auth, email, password);

        const snapshot = await getDocs(collection(db, "users"));

        snapshot.forEach((doc) => {
            const data = doc.data();

            if (data.email === email) {
                if (data.role === "admin") {
                    window.location.href = "admin.html";
                } else {
                    window.location.href = "dashboard_user.html";
                }
            }
        });

    } catch (error) {
        document.getElementById("error").innerText = "Login Failed";
    }
};
