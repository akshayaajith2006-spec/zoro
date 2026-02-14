Wi-Fi Based College Event Booking System
Project Proposal
1. Problem Statement

In many colleges, event registrations are managed through Google Forms, paper lists, or informal messaging groups. This often leads to:

Overbooking of seats

Manual errors in tracking participants

No real-time visibility of seat availability

Lack of centralized monitoring

There is a need for a structured, role-based, real-time event booking system within a campus environment.

2. Proposed Solution

We propose a Wi-Fi Based College Event Booking System that allows:

Students to log in and book seats for events

Admin to create and manage events

Real-time seat tracking to prevent overbooking

The system runs as a web application accessible within a campus Wi-Fi network and uses Firebase for backend services.

3. Objectives

Implement role-based authentication (Admin & Student)

Allow admin to create events with seat limits

Allow students to book seats securely

Prevent overbooking using controlled seat validation logic

Provide real-time seat updates

Deliver a working prototype within hackathon constraints

4. Scope
Included Features

Email/Password login

Role-based redirection

Admin event creation

Student event booking

Real-time seat updates using Firestore listeners

Basic overbooking prevention using transaction logic

Local Wi-Fi demo deployment

Excluded Features

Payment integration

QR-based ticketing

Email notifications

Advanced analytics dashboard

Complex filtering and categorization

5. Target Users
Admin

Create events

Set seat limits

View bookings

Student

Log in

View available events

Book seats

See updated seat availability

6. Technology Stack
Frontend

HTML

CSS

JavaScript (ES Modules)

Backend

Firebase Authentication

Cloud Firestore

Deployment

Local hosting using Live Server

Accessible via local IP within Wi-Fi network

7. System Architecture
Client (Browser)
        ↓
Frontend (HTML + JavaScript)
        ↓
Firebase Authentication
        ↓
Cloud Firestore Database
        ↓
Real-time listener updates UI


The system follows a client–backend architecture using Backend-as-a-Service (Firebase).

8. Core Functional Workflow

User logs in using email and password

System verifies role from Firestore

Admin → redirected to Admin Dashboard

Student → redirected to Student Dashboard

Student books event

Firestore transaction validates and reduces seat count

Real-time listener updates seat availability instantly

9. Expected Outcome

A fully functional prototype demonstrating:

Secure authentication

Role-based access control

Real-time event booking

Seat limit enforcement

Multi-user interaction simulation

10. Future Enhancements

QR code ticket generation

Booking cancellation system

Email confirmations

Analytics dashboard

Full cloud deployment

11. Team Roles

Member 1 – Frontend Development (UI & Page Structure)

Member 2 – Backend Development (Firebase Integration & Logic)