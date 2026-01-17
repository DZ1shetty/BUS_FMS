require("dotenv").config();
const { createClient } = require("@libsql/client");
const fs = require("fs");
const path = require("path");

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function seed() {
    const sqlPath = path.join(__dirname, "dummy_data_sqlite.sql");
    console.log(`Reading SQL from: ${sqlPath}`);

    let sql = fs.readFileSync(sqlPath, "utf8");

    // 1. Remove comments (lines starting with --, or inline comments)
    // This regex matches -- until end of line, globally, multiline
    sql = sql.replace(/--.*$/gm, "");

    // 2. Split by semicolon
    const rawStatements = sql.split(";");

    // 3. Clean up whitespace and filter empty statements
    const statements = rawStatements
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

    console.log(`Found ${statements.length} SQL statements to execute.`);

    if (statements.length === 0) {
        console.error("❌ No statements found. Check the SQL file content.");
        return;
    }

    try {
        // We use a batch transaction for atomic execution and speed.
        // We also turn off foreign keys for this session to allow safe deletion order without strict topological sort,
        // although our SQL file attempts to preserve order anyway.

        // Note: In LibSQL/HTTP, PRAGMA foreign_keys might not persist across batch calls if not in the same batch.
        // So we include it in the batch.

        const batchOps = [
            "PRAGMA foreign_keys = OFF",
            ...statements,
            "PRAGMA foreign_keys = ON"
        ];

        console.log("🚀 Executing batch...");

        // "write" mode opens a transaction
        await db.batch(batchOps, "write");

        console.log("✅ Database seeded successfully!");
    } catch (err) {
        console.error("❌ Error seeding database:", err);
        if (err.cause) {
            console.error("Cause:", err.cause);
        }
    }
}

seed();
