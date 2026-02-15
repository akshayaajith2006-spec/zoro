BookMySlot – Wi-Fi Based Event Booking System
🎯 Basic Details

Project Name: BookMySlot
Team Name: ZORO

👥 Team Members

Member 1: AVANI BIJU  – SAINTGITS COLLEGE OF ENGINEERING

Member 2: AKSHAYA A –  SAINTGITS COLLEGE OF ENGINEERING

🌐 Hosted Project Link

Wi-Fi Hosted Demo (Local Network):
http://<your-local-ip>:8000

(Example: http://10.10.156.36:8000
)

📌 Project Description

BookMySlot is a real-time, Wi-Fi-based event booking system designed for colleges. It enables students to register for events while preventing overbooking using atomic seat transactions. The system includes role-based access control for admins and real-time participant management.

❗ The Problem Statement

College event registrations are often managed through Google Forms, paper lists, or messaging apps. These methods:

Allow overbooking

Lack real-time seat tracking

Provide no centralized admin control

Create confusion during high-demand registrations

There is a need for a structured, secure, and real-time event booking platform within campus environments.

💡 The Solution

BookMySlot provides:

Real-time event listing

Atomic seat booking using Firestore transactions

Role-based access control (Admin / Student)

Participant management dashboard

Wi-Fi-based local hosting for campus demo use

The system ensures safe booking, live seat updates, and centralized event management.

⚙ Technical Details
🖥 For Software
Languages Used

JavaScript

HTML

CSS

Frameworks Used

None (Vanilla JS architecture)

Libraries Used

Firebase SDK (Authentication + Firestore)

Tools Used

VS Code

Git & GitHub

Firebase Console

Python HTTP Server (for local hosting)

✨ Features
🎓 Student Side

Secure Email/Password Login (Firebase Auth)

Real-time Event Dashboard

Event Images with Fallback

Seat Availability Badges

Atomic Booking (Prevents Overbooking)

Duplicate Booking Prevention

Confirmation Page after Booking

Toast Notifications (No browser alerts)

Responsive UI

🛠 Admin Side

Create Events (Title, Venue, Date, Time, Seats, Instructions, Image URL)

Real-time Event Monitoring

View Participants (Toggle View)

Promote/Demote Users

Multi-Admin Support

Real-time User Management

Role-based Firestore Security

🔐 System Highlights

Firestore Transactions for seat decrement

Real-time updates using onSnapshot()

Role-based Firestore security rules

Wi-Fi multi-device hosting support

🛠 Implementation
💻 Installation

Clone the repository:

git clone <repo-link>
cd zoro


No package installation required (Firebase CDN-based project).

▶ Run (Local Wi-Fi Hosting)
Option 1 – Python HTTP Server

From project folder:

python -m http.server 8000


Open:

http://localhost:8000


For other devices on same Wi-Fi:

http://<your-ip>:8000


Example:

http://10.10.156.36:8000

📷 Project Documentation
📸 Screenshots
![WhatsApp Image 2026-02-15 at 10 19 56](https://github.com/user-attachments/assets/cf9284b3-7bf3-4748-810f-449cc6a9f2fd)
![WhatsApp Image 2026-02-15 at 10 19 56 (2)](https://github.com/user-attachments/assets/5151b7d6-7299-4239-940d-aabca06bac78)
![WhatsApp Image 2026-02-15 at 10 20 17](https://github.com/user-attachments/assets/03725d68-1559-4eda-9505-34a16d3e4003)
![WhatsApp Image 2026-02-15 at 10 23 23](https://github.com/user-attachments/assets/097fd54d-7829-4274-a58c-f02c491d10b0)
![WhatsApp Image 2026-02-15 at 10 23 23](https://github.com/user-attachments/assets/263eb01d-1802-42bc-9c00-d41b4d392614)
![WhatsApp Image 2026-02-15 at 10 27 59](https://github.com/user-attachments/assets/8203ce2f-f8c7-4d03-8837-49f80f3cc4e2)
![WhatsApp Image 2026-02-15 at 10 28 43 (1)](https://github.com/user-attachments/assets/b53bcfd3-6341-4bcc-8ce4-9f421e1533f2)

Shows event details after successful booking.

🏗 System Architecture
Architecture Diagram

Users (Laptop / Phone)
⬇ Wi-Fi Network
Local Host (Python HTTP Server)
⬇
Firebase Cloud (Authentication + Firestore)

Explanation

Frontend hosted locally via Wi-Fi

Firebase handles authentication and database

Real-time updates via Firestore listeners

Role-based access controlled via Firestore security rules

🔄 Application Workflow

User logs in (Firebase Auth)

Role is fetched from Firestore

Redirect based on role:

Admin → admin.html

Student → dashboard_user.html

Student books event

Firestore transaction reduces seat count

Booking saved to database

Confirmation page displayed

Admin sees real-time participant update

🔐 API Documentation (Logical Firebase Operations)
Base Backend

Firebase Firestore

Event Creation

Collection: events

Fields:

title (string)
seatsLeft (number)
venue (string)
date (string)
time (string)
instructions (string)
imageUrl (string)

Booking Creation

Collection: bookings

Fields:

eventId (string)
userEmail (string)
eventTitle (string)

User Roles

Collection: users

Fields:

email (string)
role (student/admin)

🎥 Project Demo

Video Link: https://drive.google.com/file/d/1czSXMihDPEXheLZdBi8e1DC6GJy002y6/view?usp=drive_link

Video Demonstrates:

Student booking flow

Real-time seat update across devices

Confirmation page

Admin event creation

Participant toggle

Role promotion/demotion

Wi-Fi multi-device demo

📡 Additional Demo

Live Wi-Fi Demo:

Connect devices to same hotspot and open:

http://<host-ip>:8000

🤖 AI Tools Used (Transparency)

Tool Used: ChatGPT
Purpose:

Debugging assistance

Firebase transaction implementation guidance

Security rule structuring

Code optimization suggestions

Approximate AI-assisted code: ~25%

Human Contributions:

Architecture design

UI/UX layout decisions

Business logic planning

Integration & testing

Wi-Fi hosting setup

👨‍💻 Team Contributions

Member 2:

Frontend UI development

Responsive layout

Confirmation page implementation

UI styling & animations

Member 1:

Firebase Authentication setup

Firestore schema design

Transaction-safe booking logic

Admin panel logic

Security rules implementation

Wi-Fi hosting configuration
