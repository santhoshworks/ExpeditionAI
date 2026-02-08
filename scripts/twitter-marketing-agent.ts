// scripts/twitter-marketing-agent.ts

import TwitterMarketingOrchestrator from "./agents/orchestrator";

async function main() {
  const config = {
    odooUrl: process.env.ODOO_URL || "",
    odooApiKey: process.env.ODOO_API_KEY || "",
  };

  if (!config.odooUrl || !config.odooApiKey) {
    throw new Error("Missing required environment variables: ODOO_URL, ODOO_API_KEY");
  }

  const orchestrator = new TwitterMarketingOrchestrator(config);
  await orchestrator.run();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
