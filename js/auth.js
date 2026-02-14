import { app } from "./firebase-config.js";

import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { getFirestore, collection, getDocs, doc, setDoc }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

window.loginUser = async function () {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    document.getElementById("error").innerText = "";
    document.getElementById("success").innerText = "";

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
        document.getElementById("error").innerText = "Login Failed: " + error.message;
        console.error(error);
    }
};

window.registerUser = async function () {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    document.getElementById("error").innerText = "";
    document.getElementById("success").innerText = "";

    if (!email || !password) {
        document.getElementById("error").innerText = "Please enter email and password";
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save user to Firestore with "student" role by default
        await setDoc(doc(db, "users", user.uid), {
            email: email,
            role: "student"
        });

        document.getElementById("success").innerText = "Registration successful! You can now log in.";

    } catch (error) {
        document.getElementById("error").innerText = "Registration Failed: " + error.message;
        console.error(error);
    }
};
