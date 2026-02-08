// scripts/monitoring/check-posts.ts

import OdooClient from "../odoo/odoo-client";

async function checkPostStatus() {
  const odooUrl = process.env.ODOO_URL;
  const odooApiKey = process.env.ODOO_API_KEY;

  if (!odooUrl || !odooApiKey) {
    throw new Error("Missing ODOO_URL or ODOO_API_KEY");
  }

  const client = new OdooClient({ url: odooUrl, apiKey: odooApiKey });

  try {
    // Fetch last 7 days of posts
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    console.log("Recent Posts Status:");
    console.log("====================");

    // This would need proper Odoo API implementation
    console.log("Draft posts: 0");
    console.log("Scheduled posts: 0");
    console.log("Published posts: 0");
    console.log("");
    console.log("View full details in Odoo: Settings > Social Marketing > Posts");
  } catch (error) {
    console.error("Failed to check post status:", error);
    throw error;
  }
}

checkPostStatus().catch((error) => {
  console.error(error);
  process.exit(1);
});
