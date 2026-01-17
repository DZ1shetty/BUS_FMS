# Bus Fleet Management System (BusFleet)


<div align="center">
  <img src="frontend/public/logo.jpg" alt="BusFleet Logo" width="150" style="border-radius: 50%; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" />
</div>

<div align="center">
  <h3>Bus Fleet Management System</h3>
  <p>Efficient Tracking • Secure Logistics • Smart Management</p>
</div>


A modern, comprehensive web application for managing bus fleets, educational institute logistics, student tracking, and maintenance logs. Built with a focus on performance, security, and a premium user experience.

## ✨ Features

-   **📊 Interactive Dashboard:** Real-time analytics with visual charts and stats for quick insights.
-   **🔐 Secure Authentication:** Robust Login/Signup flow powered by **Firebase Auth** (Email/Password & Google Sign-In).
-   **🎓 Student Management:** Efficiently manage student data, boarding points, and bus assignments.
-   **🚌 Fleet & Route Operations:** Track active buses, manage routes with distances, and optimize logistics.
-   **🛠️ Maintenance & Incidents:** Log vehicle health issues and track incident reports.
-   **🌙 Premium Dark Mode:** Fully responsive UI with a carefully crafted, high-contrast dark theme.
-   **⚡ Modern UI/UX:** Built with **React** and **Tailwind CSS** for a smooth, responsive, and beautiful experience.

## 🛠️ Tech Stack

### Frontend
-   **Framework:** [React](https://reactjs.org/) (via [Vite](https://vitejs.dev/))
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/) (Animations)
-   **Icons:** [Lucide React](https://lucide.dev/)
-   **HTTP Client:** Axios

### Backend & Database
-   **Server:** Node.js + Express.js
-   **Database:** [Turso](https://turso.tech/) (LibSQL) - Edge-hosted database
-   **API Security:** CORS & Environment Variable protection

### Infrastructure
-   **Auth:** Firebase Authentication
-   **Hosting (Frontend):** Vercel (Recommended)
-   **Hosting (Backend):** Vercel Serverless / Render / Railway

## 🚀 Getting Started

### Prerequisites
-   [Node.js](https://nodejs.org/) (v16+)
-   [Git](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/DZ1shetty/BUS_FMS.git
cd BUS_FMS
```

### 2. Environment Setup
Create a `.env` file in the **root** directory (same level as `package.json`).
**Note:** You also need a `.env` inside `frontend/` depending on your build setup, but for this monorepo structure, ensure the root has the backend config and frontend build picks up its own.

**Root `.env` (Backend & Shared):**
```env
# Database (Turso)
TURSO_DATABASE_URL=your_turso_db_url
TURSO_AUTH_TOKEN=your_turso_auth_token

# Server
PORT=5000
```

**Frontend `.env` (`frontend/.env`):**
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Install Dependencies
This project uses a root `package.json` to manage scripts but separate folders for backend and frontend code.
```bash
# Install root dependencies (concurrently, etc.)
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 4. Run the Application
We have a convenient "turbo" script to run both backend and frontend simultaneously.
```bash
# From the root directory:
npm run dev
```
-   **Frontend:** `http://localhost:5173`
-   **Backend:** `http://localhost:5000`

## 📂 Project Structure

```
BUS_FMS/
├── database/           # Backend Server & Database Logic
│   ├── server.js       # Main Express API entry point
│   └── ...
├── frontend/           # React Application
│   ├── src/
│   │   ├── components/ # Reusable UI Components
│   │   ├── App.jsx     # Main Component & Routing
│   │   └── ...
│   └── tailwind.config.js
├── package.json        # Root scripts
└── README.md
```

## 🤝 Contributing

1.  Fork the project.
2.  Create your feature branch: `git checkout -b feature/AmazingFeature`
3.  Commit your changes: `git commit -m 'Add some AmazingFeature'`
4.  Push to the branch: `git push origin feature/AmazingFeature`
5.  Open a Pull Request.

## 📄 License

This project is licensed under the ISC License.
