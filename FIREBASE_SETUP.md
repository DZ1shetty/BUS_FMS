# Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication with Google Sign-in for the BUS Fleet Management System.

## Prerequisites

1. A Google account
2. Your project deployed on Vercel (or ready to deploy)

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `BUS-FMS` (or your preferred name)
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Register Web App

1. In your Firebase project dashboard, click the **Web icon** (`</>`)
2. Register your app:
   - App nickname: `BUS FMS Web`
   - **Important:** Check "Also set up Firebase Hosting" - **DO NOT** select this (we're using Vercel)
3. Click "Register app"
4. Copy the Firebase configuration object - you'll need this!

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:..."
};
```

## Step 3: Enable Google Authentication

1. In Firebase Console, go to **Authentication** (left sidebar)
2. Click "Get started" if this is your first time
3. Go to **Sign-in method** tab
4. Click on **Google** provider
5. Toggle "Enable"
6. Select a support email from dropdown
7. Click "Save"

## Step 4: Configure Authorized Domains

1. In **Authentication > Settings > Authorized domains**
2. Add your Vercel domain:
   - `your-app-name.vercel.app`
   - If you have a custom domain, add that too
3. `localhost` is already authorized by default for local development

## Step 5: Update Firebase Configuration

1. Open `config/firebase-config.js` in your project
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-actual-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-actual-project.appspot.com",
  messagingSenderId: "YOUR_ACTUAL_SENDER_ID",
  appId: "YOUR_ACTUAL_APP_ID"
};
```

3. **Security Note:** For production, consider using environment variables:
   - Create `.env` file (already in `.gitignore`)
   - Use the `.env.example` as template
   - In Vercel, add these as Environment Variables in Project Settings

## Step 6: Update HTML Files

1. **Update Login Page:**
   - Rename `login/login.html` to `login/login-old.html` (backup)
   - Rename `login/login-updated.html` to `login/login.html`

2. **Update Homepage** (if you want to show user profile):
   - Add this to your `homepage/homepage.html` in the header:
   ```html
   <link rel="stylesheet" href="../styles/auth-styles.css" />
   ```
   
   - Add a container for user profile (where you want it displayed):
   ```html
   <div id="user-profile"></div>
   ```
   
   - Add this script tag before closing `</body>`:
   ```html
   <script type="module" src="auth-check.js"></script>
   ```

## Step 7: Update Styles

1. Add the auth styles to your main stylesheet or link separately:
   ```html
   <link rel="stylesheet" href="../styles/auth-styles.css" />
   ```

## Step 8: Deploy to Vercel

1. **Local Testing First:**
   ```bash
   # Install a simple HTTP server if you don't have one
   npm install -g http-server
   
   # Run from your project root
   http-server -p 8080
   
   # Open http://localhost:8080/login/login.html
   ```

2. **Deploy to Vercel:**
   ```bash
   # If not already installed
   npm install -g vercel
   
   # Deploy
   vercel
   
   # Or push to GitHub and let Vercel auto-deploy
   git add .
   git commit -m "Add Firebase Authentication with Google Sign-in"
   git push
   ```

3. **Add Environment Variables in Vercel** (if using env vars):
   - Go to your project in Vercel Dashboard
   - Settings > Environment Variables
   - Add each Firebase config variable
   - Redeploy your project

## Step 9: Test the Integration

1. Visit your deployed Vercel URL
2. Go to the login page
3. Click "Continue with Google"
4. Sign in with your Google account
5. You should be redirected to the homepage
6. Your profile info should display (if configured)

## Features Included

✅ **Google Sign-In** - One-click authentication
✅ **Traditional Login** - Keep your existing username/password login
✅ **Session Management** - User stays logged in across pages
✅ **Profile Display** - Show user name, email, and photo
✅ **Sign Out** - Clean logout functionality
✅ **Route Protection** - Redirect to login if not authenticated

## File Structure

```
BUS_FMS/
├── config/
│   ├── firebase-config.js    # Firebase credentials
│   └── auth.js               # Authentication logic
├── login/
│   ├── login.html            # Updated login page
│   ├── login-auth.js         # Google sign-in handler
│   └── login.js              # Existing login logic
├── homepage/
│   └── auth-check.js         # Protect homepage, show user info
├── styles/
│   └── auth-styles.css       # Google button & profile styles
├── .env.example              # Environment variables template
└── FIREBASE_SETUP.md         # This file
```

## Troubleshooting

### Error: "This domain is not authorized"
- Add your Vercel domain to Firebase Console > Authentication > Settings > Authorized domains

### Error: "Firebase: Error (auth/popup-blocked)"
- Browser is blocking popups. Allow popups for your domain
- Try using a different browser

### Google Sign-In button not working
- Check browser console for errors
- Verify Firebase config is correct
- Ensure you're using HTTPS (Vercel provides this automatically)

### User not staying logged in
- Check if sessionStorage is working
- Verify `auth-check.js` is loaded on protected pages

## Security Best Practices

1. **Never commit** `.env` file with real credentials
2. **Use environment variables** in production (Vercel Environment Variables)
3. **Enable Firebase Security Rules** for database if you add Firestore
4. **Keep Firebase SDK updated** regularly
5. **Monitor authentication activity** in Firebase Console

## Additional Features You Can Add

- Email/Password authentication
- Password reset functionality
- Email verification
- Multi-factor authentication
- Social login (Facebook, Twitter, GitHub, etc.)
- User profile management
- Firestore database integration

## Support

For issues or questions:
- [Firebase Documentation](https://firebase.google.com/docs/auth)
- [Vercel Documentation](https://vercel.com/docs)
- Firebase Console > Support

---

**Note:** This setup uses Firebase for authentication ONLY, not for hosting. Your site is deployed on Vercel as intended.
