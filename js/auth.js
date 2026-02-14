import { app } from "./firebase-config.js";

import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { getFirestore, collection, getDocs, doc, setDoc }
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

// Clean Firebase error messages
function cleanError(msg) {
    return msg
        .replace("Firebase: ", "")
        .replace(/\(auth\/.*\)\.?/, "")
        .trim() || "Something went wrong";
}

// Login
window.loginUser = async function () {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    document.getElementById("error").innerText = "";
    document.getElementById("success").innerText = "";

    if (!email || !password) {
        showToast("Please enter email and password", "error");
        return;
    }

    // Disable buttons
    const buttons = document.querySelectorAll(".btn-row button");
    buttons.forEach(b => { b.disabled = true; b.textContent = "Logging in..."; });

    try {
        await signInWithEmailAndPassword(auth, email, password);

        const snapshot = await getDocs(collection(db, "users"));

        let redirected = false;
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.email === email) {
                redirected = true;
                if (data.role === "admin") {
                    window.location.href = "admin.html";
                } else {
                    window.location.href = "dashboard_user.html";
                }
            }
        });

        if (!redirected) {
            showToast("User data not found. Contact admin.", "error");
            buttons.forEach(b => { b.disabled = false; });
            buttons[0].textContent = "Login";
            buttons[1].textContent = "Register";
        }

    } catch (error) {
        showToast(cleanError(error.message), "error");
        buttons.forEach(b => { b.disabled = false; });
        buttons[0].textContent = "Login";
        buttons[1].textContent = "Register";
        console.error(error);
    }
};

// Register
window.registerUser = async function () {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    document.getElementById("error").innerText = "";
    document.getElementById("success").innerText = "";

    if (!email || !password) {
        showToast("Please enter email and password", "error");
        return;
    }

    const buttons = document.querySelectorAll(".btn-row button");
    buttons.forEach(b => { b.disabled = true; b.textContent = "Registering..."; });

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save user to Firestore with "student" role by default
        await setDoc(doc(db, "users", user.uid), {
            email: email,
            role: "student"
        });

        showToast("Registration successful! You can now log in.", "success");

    } catch (error) {
        showToast(cleanError(error.message), "error");
        console.error(error);
    }

    buttons.forEach(b => { b.disabled = false; });
    buttons[0].textContent = "Login";
    buttons[1].textContent = "Register";
};
