require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  console.log("Running DDL statements using PG Pool for Invoice table...");
  
  try {
    await pool.query(`ALTER TABLE "Invoice" ADD COLUMN "paymentLinkId" TEXT;`);
    console.log("Added paymentLinkId column to Invoice table");
  } catch(e) {
    console.error("paymentLinkId:", e.message);
  }

  try {
    await pool.query(`ALTER TABLE "Invoice" ADD COLUMN "paymentLinkUrl" TEXT;`);
    console.log("Added paymentLinkUrl column to Invoice table");
  } catch(e) {
    console.error("paymentLinkUrl:", e.message);
  }

  console.log("Migration complete!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await pool.end());
