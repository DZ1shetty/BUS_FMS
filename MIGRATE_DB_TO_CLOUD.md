# How to Fix "Blank Dashboard" (Migrate Local Data to Cloud)

**The Problem:**
You see data on your laptop (Localhost) because you have a database installed on your computer.
But your website on Vercel is "in the cloud". It **cannot see** the database on your laptop.
That is why the dashboard is blank and showing "500 Internal Server Error".

**The Solution:**
You must move your database to the cloud so Vercel can access it.

## Step 1: Create a Cloud Database (Free)
We recommend **Aiven** or **PlanetScale** (both have free tiers).

1.  Go to [Aiven.io](https://aiven.io/) and sign up.
2.  Create a new **MySQL** service (select the Free Plan).
3.  Once created, copy these details:
    *   **Host** (e.g., `mysql-service.aivencloud.com`)
    *   **Port** (e.g., `12345`)
    *   **User** (e.g., `avnadmin`)
    *   **Password** (e.g., `xyz123...`)
    *   **Database Name** (e.g., `defaultdb`)

## Step 2: Connect Vercel to Cloud Database
1.  Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2.  Select your project (**bus-fms**).
3.  Go to **Settings** > **Environment Variables**.
4.  **Edit** (or Add) the following variables with your **Cloud Database** details (NOT your local ones):
    *   `DB_HOST` = (Your Cloud Host)
    *   `DB_USER` = (Your Cloud User)
    *   `DB_PASSWORD` = (Your Cloud Password)
    *   `DB_NAME` = (Your Cloud Database Name)
    *   `DB_PORT` = (Your Cloud Port - *Note: You might need to update code to use this if not 3306*)

5.  **Redeploy** your project in Vercel (Deployments > ... > Redeploy).

## Step 3: Import Your Data to the Cloud
Now your Vercel app is connected to the Cloud DB, but the Cloud DB is **empty**.

1.  Open a tool like **MySQL Workbench**, **DBeaver**, or **HeidiSQL** on your laptop.
2.  Create a **New Connection** using your **Cloud Database** details.
3.  Connect to it.
4.  Open the file `database/schema.sql` from your project folder and **Run** it to create the tables.
5.  Open the file `database/dummy_data.sql` (or export your local data) and **Run** it to insert the data.

**Result:**
Now, when you open your Vercel website, it will fetch data from the Cloud Database, and your dashboard will show the numbers!
