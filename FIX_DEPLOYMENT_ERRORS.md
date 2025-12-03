# Fix Deployment Errors

You are seeing two specific errors. Here is how to fix them permanently.

## 1. Fix "auth/unauthorized-domain" Error (CRITICAL)

**You are seeing this error because Firebase blocks your Vercel website by default.**

1.  **Copy your Vercel Domain**: Look at your browser address bar (e.g., `https://bus-fms.vercel.app`). Copy just the domain part: `bus-fms.vercel.app`.
2.  **Go to Firebase Console**: [https://console.firebase.google.com/](https://console.firebase.google.com/)
3.  **Select Project**: Click on **Bus-FMS**.
4.  **Go to Auth Settings**:
    *   Click **Build** in the left menu.
    *   Click **Authentication**.
    *   Click the **Settings** tab (top of the page).
    *   Click **Authorized domains**.
5.  **Add Domain**:
    *   Click **Add domain**.
    *   Paste your domain (e.g., `bus-fms.vercel.app`).
    *   Click **Add**.

**Result:** The "Continue with Google" button will work immediately after this.

---

## 2. Fix "500 Internal Server Error" (Database Connection)

This error happens because your Vercel deployment doesn't know *where* your database is. The code is running, but it has no credentials to connect to MySQL.

1.  Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2.  Select your project (**bus-fms**).
3.  Click on the **Settings** tab.
4.  Click on **Environment Variables** in the left sidebar.
5.  Add the following variables one by one. You need to get these values from your Cloud Database provider (PlanetScale, Aiven, etc.) and your Firebase Project Settings.

### Database Variables (Required for Login/Signup)
| Key | Value Example |
| :--- | :--- |
| `DB_HOST` | `aws.connect.psdb.cloud` (Your cloud DB host) |
| `DB_USER` | `admin` (Your cloud DB username) |
| `DB_PASSWORD` | `********` (Your cloud DB password) |
| `DB_NAME` | `bus_fms` (Your cloud DB name) |

### Firebase Variables (Required for Frontend Config)
*Go to Firebase Console > Project Settings (gear icon) > General > Your Apps > SDK Setup and Configuration (Config) to find these.*

| Key | Value Source |
| :--- | :--- |
| `FIREBASE_API_KEY` | `apiKey` from Firebase config |
| `FIREBASE_AUTH_DOMAIN` | `authDomain` from Firebase config |
| `FIREBASE_PROJECT_ID` | `projectId` from Firebase config |
| `FIREBASE_STORAGE_BUCKET` | `storageBucket` from Firebase config |
| `FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` from Firebase config |
| `FIREBASE_APP_ID` | `appId` from Firebase config |
| `FIREBASE_MEASUREMENT_ID` | `measurementId` from Firebase config |

6.  **IMPORTANT:** After adding all variables, you must **Redeploy** for them to take effect.
    *   Go to the **Deployments** tab in Vercel.
    *   Click the three dots (`...`) next to the latest deployment.
    *   Select **Redeploy**.

**Result:** The 500 error will disappear, and you will be able to Login and Signup.
