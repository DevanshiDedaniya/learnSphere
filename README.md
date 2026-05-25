# 📚 LearnSphere – Learning Management System

LearnSphere is a comprehensive, full-stack Learning Management System (LMS) built using the MERN stack. It provides a robust platform for both students and instructors, facilitating seamless course creation, enrollment, progress tracking, and certification.

## 🌟 Key Features

### 🔐 Authentication & Authorization
*   **JWT-based Authentication**: Secure login and session management.
*   **Password Hashing**: Passwords encrypted using `bcryptjs`.
*   **Role-Based Access Control (RBAC)**: Distinct dashboards and permissions for **Students** and **Instructors**.

### 🎓 Course & Learning Management
*   **Course Creation**: Instructors can easily build and publish detailed courses.
*   **Direct Media Uploads**: Highly optimized frontend-to-Cloudinary pipeline for direct video and media uploads, reducing backend load and improving performance.
*   **Progress Tracking**: Students can track their learning journey across video lessons and resources.
*   **Interactive Dashboard**: Personalized views for both students and instructors to track enrollments, courses, and overall performance.

### 💳 Payments & Enrollment
*   **Secure Checkout**: Integrated with **Stripe** for processing course purchases securely.
*   **Automated Enrollment**: Real-time **Stripe Webhooks** automatically grant access to students upon successful payment.

### 📜 Certification & Notifications
*   **Dynamic Certificates**: Automated generation of customized PDF certificates upon course completion using **PDFKit**.
*   **Cloud Storage**: Certificates and course assets are reliably stored and served via **Cloudinary**.
*   **Email Notifications**: Automated email delivery for important user actions via **Nodemailer**.

### 👤 User Profiles
*   **Profile Management**: Users can update personal details and seamlessly upload profile pictures (handled natively via `multer` on the backend and `FormData` on the frontend).

### 🛡️ Security & Reliability
*   **Data Validation**: Strict payload validation using **Joi** to ensure data integrity and prevent bad requests.
*   **Centralized Logging**: Comprehensive API request and error logging powered by **Winston**.

## 🛠 Tech Stack

### Frontend
*   **Framework**: React.js
*   **State Management**: Redux Toolkit & React-Redux
*   **Styling**: Tailwind CSS & DaisyUI
*   **Routing**: React Router DOM
*   **HTTP Client**: Axios

### Backend
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB & Mongoose
*   **File Uploads**: Multer (Local storage & Profile pictures)
*   **Emailing**: Nodemailer

### Integrations & Services
*   **Payment Gateway**: Stripe API
*   **Media Storage**: Cloudinary API
*   **PDF Generation**: PDFKit
