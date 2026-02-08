// scripts/agents/orchestrator.ts

import { generateProductPost } from "./product-content-generator";
import { generateTrendPost, selectRelevantTrend } from "./trend-monitor";
import OdooBridge from "../integrations/odoo-bridge";
import { GeneratedPost } from "./types";

interface OrchestratorConfig {
  odooUrl: string;
  odooApiKey: string;
}

export class TwitterMarketingOrchestrator {
  private odooBridge: OdooBridge;

  constructor(config: OrchestratorConfig) {
    this.odooBridge = new OdooBridge(config.odooUrl, config.odooApiKey);
  }

  async run(): Promise<void> {
    try {
      console.log("Starting Twitter Marketing Agent...");

      // Initialize Odoo connection
      await this.odooBridge.initialize();

      const posts: GeneratedPost[] = [];

      // Generate product content post
      console.log("Generating product content post...");
      try {
        const productPost = await generateProductPost();
        posts.push(productPost);
        console.log(`✓ Product post: "${productPost.content}"`);
      } catch (error) {
        console.error("Failed to generate product post:", error);
      }

      // Generate trend post
      console.log("Generating trend-based post...");
      try {
        const trend = await selectRelevantTrend();
        const trendPost = await generateTrendPost(trend);
        posts.push(trendPost);
        console.log(`✓ Trend post: "${trendPost.content}"`);
      } catch (error) {
        console.error("Failed to generate trend post:", error);
      }

      // Post to Odoo
      if (posts.length > 0) {
        console.log(`Posting ${posts.length} posts to Odoo...`);
        const postIds = await this.odooBridge.postMultiple(posts);
        console.log(`✓ Successfully posted ${postIds.length} posts to Odoo`);
      } else {
        console.warn("No posts generated");
      }

      console.log("Twitter Marketing Agent completed successfully");
    } catch (error) {
      console.error("Fatal error in Twitter Marketing Agent:", error);
      throw error;
    }
  }
}

export default TwitterMarketingOrchestrator;
