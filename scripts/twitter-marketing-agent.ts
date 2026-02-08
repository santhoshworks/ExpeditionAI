// scripts/twitter-marketing-agent.ts

import TwitterMarketingOrchestrator from "./agents/orchestrator";

async function main() {
  const config = {
    odooUrl: process.env.ODOO_URL || "",
    odooUsername: process.env.ODOO_USERNAME || "",
    odooPassword: process.env.ODOO_PASSWORD || "",
    odooDatabase: process.env.ODOO_DB || "",
  };

  if (!config.odooUrl || !config.odooUsername || !config.odooPassword || !config.odooDatabase) {
    throw new Error("Missing required environment variables: ODOO_URL, ODOO_USERNAME, ODOO_PASSWORD, ODOO_DB");
  }

  const orchestrator = new TwitterMarketingOrchestrator(config);
  await orchestrator.run();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
