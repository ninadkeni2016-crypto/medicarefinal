# 🏥 MediCare - Full Stack Healthcare Platform

MediCare is a modern full-stack healthcare web application designed to streamline the process of connecting patients with doctors. It enables users to book appointments, manage profiles, and access healthcare services through a clean and intuitive interface.

---

## 🌐 Live Demo

🚀 **Application:** https://medicaremain.vercel.app/  
⚙️ **Backend API:** Deployed on Vercel (Serverless Functions)

---

## 📸 Key Features

- 🔐 Secure User Authentication (JWT)
- 👤 User Profile Management
- 👨‍⚕️ Doctor Listings & Search
- 📅 Appointment Booking System
- 💳 Razorpay Payment Integration
- 📧 Automated Email Notifications (Confirmation & Completion)
- 🔔 Real-time Notifications
- 🤖 AI Health Assistant
- ❤️ Health Vitals Tracking
- 📱 Fully Responsive UI (Mobile Friendly)

---

## 🛠️ Tech Stack

### Frontend
- React / React Native (Expo)
- Tailwind CSS / Custom Styling

### Backend
- Node.js
- Express.js (Serverless on Vercel)
- TypeScript

### Database
- MongoDB (Mongoose)

### Deployment
- Frontend: Vercel
- Backend: Vercel (Serverless Functions)

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/medicare.git
cd medicare
```

### 2. Install Dependencies

#### Frontend
```bash
cd mobile
npm install
```

#### Backend
```bash
cd backend
npm install
```

### 3. Environment Variables

Create a `.env` file in the `backend` folder and add:

```env
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
EMAIL=your_email
APP_PASSWORD=your_app_password
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
```

### 4. Run Locally

#### Backend
```bash
npm run dev
```

#### Frontend
```bash
npx expo start
```

---

## 🚀 Deployment

The project is fully deployed on Vercel:

- Frontend hosted on Vercel
- Backend converted to serverless functions and hosted on Vercel
- MongoDB Atlas used as cloud database

---

## 📌 Future Improvements
- Advanced Doctor Recommendation System
- Video Consultation Integration
- Appointment Reminder System
- Admin Dashboard

---

## 🤝 Acknowledgements

Special thanks to the entire team for their contribution, collaboration, and dedication in making this project successful.

---

## 📄 License

This project is developed for educational and demonstration purposes.
