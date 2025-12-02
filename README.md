# Bus Fleet Management System (BUS_FMS)

A comprehensive web-based application for managing bus fleets, routes, students, drivers, maintenance logs, and incidents. This system is designed to streamline operations for schools or transport companies.

## Features

- **Dashboard:** Real-time overview of students, buses, routes, and incidents.
- **Student Management:** Add, view, and delete student records.
- **Route Management:** Manage bus routes with start/end points and distances.
- **Bus Fleet:** Track bus capacity and assignments.
- **Driver Roster:** Manage driver details and licenses.
- **Maintenance Logs:** Record and track vehicle maintenance.
- **Incident Reports:** Log and monitor incidents.
- **Authentication:** Secure login and signup functionality.
- **Responsive Design:** Works on desktop and mobile devices.
- **Dark Mode:** Toggle between light and dark themes.

## Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Authentication:** Firebase (for analytics/config), Custom JWT/Session (implemented in backend)
- **Charts:** Chart.js

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MySQL](https://www.mysql.com/) (Server and Workbench recommended)
- [Git](https://git-scm.com/)

## Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/DZ1shetty/Bus_Fleet_Management_System.git
cd Bus_Fleet_Management_System/BUS_FMS
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
1. Open your MySQL client (e.g., MySQL Workbench).
2. Create a new database named `bus_fms` (or whatever you prefer).
3. Run the schema script located in `database/schema.sql` to create the tables.
4. (Optional) Run `database/dummy_data.sql` to seed the database with test data.

### 4. Environment Configuration
Create a `.env` file in the `BUS_FMS` directory (root of the project) and add your configuration. **Do not share this file.**

```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=bus_fms

# Server Port
PORT=5000

# Firebase Configuration (Get these from your Firebase Console)
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 5. Start the Server
```bash
npm start
```
The server will start at `http://localhost:5000`.

### 6. Access the Application
Open your browser and navigate to `http://localhost:5000`. You will be redirected to the login page.

## Project Structure

- `database/`: Backend server code (`server.js`) and SQL scripts.
- `homepage/`: Main dashboard frontend (`index.html`, `index.js`).
- `login/`: Login page.
- `signup/`: Signup page.
- `styles/`: CSS stylesheets.
- `images/`: Static images.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a Pull Request.

## License

This project is licensed under the ISC License.
