import { app } from "./firebase-config.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const db = getFirestore(app);
const auth = getAuth(app);

// Check auth - redirect if not logged in
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "index.html";
    }
});

// Display details
async function loadConfirmation() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('event');

    if (!eventId) {
        // If no event ID, just go back to dashboard
        window.location.href = "dashboard_user.html";
        return;
    }

    const detailsDiv = document.getElementById("confirmationDetails");

    try {
        const docRef = doc(db, "events", eventId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();

            detailsDiv.innerHTML = `
                <div style="text-align: center; margin-bottom: 24px;">
                    <div style="font-size: 64px; margin-bottom: 16px;">✅</div>
                    <h3 style="color: var(--success); margin-bottom: 8px; font-size: 24px;">Booking Confirmed!</h3>
                    <p style="color: var(--text-secondary);">Your spot has been successfully reserved.</p>
                </div>
                
                <div style="background: var(--bg-secondary); padding: 24px; border-radius: var(--radius-md); border: 1px solid var(--border);">
                    <h4 style="color: var(--text-primary); margin-bottom: 16px; font-size: 20px; font-weight: 600;">${data.title}</h4>
                    
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <div style="display: flex; align-items: center; gap: 10px; color: var(--text-secondary);">
                            <span style="font-size: 18px;">📍</span>
                            <span>${data.venue}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px; color: var(--text-secondary);">
                            <span style="font-size: 18px;">📅</span>
                            <span>${data.date}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px; color: var(--text-secondary);">
                            <span style="font-size: 18px;">🕐</span>
                            <span>${data.time}</span>
                        </div>
                    </div>

                    ${data.instructions ? `
                        <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-light);">
                            <p style="font-style: italic; color: var(--text-muted); font-size: 14px;">
                                📝 Note: ${data.instructions}
                            </p>
                        </div>
                    ` : ''}
                </div>
            `;
        } else {
            detailsDiv.innerHTML = `<p style="text-align:center; color: var(--danger);">Event details not found.</p>`;
        }
    } catch (error) {
        console.error("Error getting document:", error);
        detailsDiv.innerHTML = `<p style="text-align:center; color: var(--danger);">Error loading booking details.</p>`;
    }
}

// Back button handler
const backBtn = document.getElementById("backBtn");
if (backBtn) {
    backBtn.addEventListener("click", () => {
        window.location.href = "dashboard_user.html";
    });
}

loadConfirmation();
