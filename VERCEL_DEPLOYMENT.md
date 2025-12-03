# Vercel Deployment Guide for BUS FMS

This guide explains how to deploy the Bus Fleet Management System to Vercel.

## Prerequisites

1.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
2.  **Cloud Database**: Since Vercel is serverless, you cannot use a local MySQL database (`localhost`). You need a cloud-hosted MySQL database.
    *   **Options**:
        *   [PlanetScale](https://planetscale.com/) (Recommended for serverless)
        *   [Aiven](https://aiven.io/mysql)
        *   [AWS RDS](https://aws.amazon.com/rds/)
        *   [Azure Database for MySQL](https://azure.microsoft.com/en-us/services/mysql/)
    *   **Action**: Create a database and get the connection details (Host, User, Password, Database Name).
    *   **Import Data**: Run the scripts in `database/schema.sql` and `database/dummy_data.sql` on your cloud database to set up the tables and initial data.

## Step 1: Prepare Project

The project has been configured for Vercel:
*   `api/index.js`: Entry point for serverless functions.
*   `vercel.json`: Configuration for routing and redirects.
*   Frontend files updated to use relative API paths (`/api/...`).

## Step 2: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended for first time)

1.  Install Vercel CLI:
    ```bash
    npm install -g vercel
    ```

2.  Login to Vercel:
    ```bash
    vercel login
    ```

3.  Deploy:
    ```bash
    vercel
    ```
    *   Follow the prompts.
    *   **Set up your project**: Yes
    *   **Scope**: (Select your account)
    *   **Link to existing project**: No
    *   **Project Name**: bus-fms (or your choice)
    *   **Directory**: ./ (default)
    *   **Build Command**: (Leave empty, or `npm install`)
    *   **Output Directory**: (Leave empty)
    *   **Development Command**: (Leave empty)

### Option B: Using GitHub Integration

1.  Push your code to a GitHub repository.
2.  Go to Vercel Dashboard > **Add New...** > **Project**.
3.  Import your GitHub repository.

## Step 3: Configure Environment Variables

**Crucial Step**: Your app will not work without these variables.

1.  Go to your project in the Vercel Dashboard.
2.  Navigate to **Settings** > **Environment Variables**.
3.  Add the following variables (values from your Cloud Database and Firebase):

    **Database Config:**
    *   `DB_HOST`: (e.g., `aws.connect.psdb.cloud`)
    *   `DB_USER`: (e.g., `your-user`)
    *   `DB_PASSWORD`: (e.g., `your-password`)
    *   `DB_NAME`: `bus_fms` (or whatever you named it)

    **Firebase Config:**
    *   `FIREBASE_API_KEY`: ...
    *   `FIREBASE_AUTH_DOMAIN`: ...
    *   `FIREBASE_PROJECT_ID`: ...
    *   `FIREBASE_STORAGE_BUCKET`: ...
    *   `FIREBASE_MESSAGING_SENDER_ID`: ...
    *   `FIREBASE_APP_ID`: ...
    *   `FIREBASE_MEASUREMENT_ID`: ...

    *(Note: The code uses `process.env.FIREBASE_...` in `server.js` but the `.env.example` had `VITE_...`. Make sure the variable names match what is used in `database/server.js`)*

    **Check `database/server.js`**:
    It uses:
    ```javascript
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    // ...
    ```
    So use the names without `VITE_` prefix for the backend variables.

4.  **Redeploy**: After adding variables, you might need to redeploy for them to take effect (if using CLI, run `vercel --prod`).

## Step 4: Verify

1.  Open your Vercel URL (e.g., `https://bus-fms.vercel.app`).
2.  It should redirect to the Login page.
3.  Try logging in. If it fails, check the **Logs** tab in Vercel Dashboard to debug database connection issues.

## Troubleshooting

*   **Database Connection Failed**: Ensure your cloud database allows connections from anywhere (0.0.0.0/0) or look up Vercel's IP ranges (allowing all is easier for testing).
*   **500 Server Error**: Check Vercel Function Logs.
*   **Static Files 404**: Ensure the file structure matches what Vercel expects. The `vercel.json` handles the API, and static files are served from the root.

