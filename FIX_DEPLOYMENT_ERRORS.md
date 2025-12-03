# Fix Deployment Errors

You are seeing two specific errors. Here is how to fix them permanently.

## 1. Fix "auth/unauthorized-domain" Error

This error happens because Firebase blocks sign-ins from unknown domains for security. You must explicitly allow your Vercel website.

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your project (**Bus-FMS**).
3.  In the left menu, click **Build** > **Authentication**.
4.  Click on the **Settings** tab.
5.  Click on **Authorized domains**.
6.  Click **Add domain**.
7.  Enter your Vercel domain (e.g., `bus-fms.vercel.app`).
    *   *Tip: You can copy this from your browser address bar when you are on the error page.*
8.  Click **Add**.

**Result:** The Google Sign-In popup will now work.

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
