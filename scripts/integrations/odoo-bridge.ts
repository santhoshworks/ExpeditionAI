// scripts/integrations/odoo-bridge.ts

import OdooClient from "../odoo/odoo-client";
import { GeneratedPost } from "../agents/types";
import { OdooSocialPost } from "../odoo/types";

export class OdooBridge {
  private client: OdooClient;
  private twitterAccountId: number | null = null;

  constructor(
    odooUrl: string,
    odooUsername: string,
    odooPassword: string,
    odooDatabase: string
  ) {
    this.client = new OdooClient({
      url: odooUrl,
      username: odooUsername,
      password: odooPassword,
      database: odooDatabase,
    });
  }

  async initialize(): Promise<void> {
    try {
      // Authenticate first
      await this.client.authenticate();

      const accounts = await this.client.listSocialAccounts();
      console.log(`Found ${accounts.length} social accounts:`, accounts);

      const twitterAccount = accounts.find(
        (acc) =>
          acc.media === "twitter" ||
          (acc.name && (acc.name.toLowerCase().includes("twitter") || acc.name.toLowerCase().includes("janani")))
      );

      if (!twitterAccount) {
        console.warn("Available accounts:", accounts);
        throw new Error(
          `No Twitter account configured in Odoo Social Marketing. Found: ${accounts.map((a) => a.name || "unknown").join(", ")}`
        );
      }

      this.twitterAccountId = twitterAccount.id;
      console.log(`Connected to Twitter account: ${twitterAccount.name}`);
    } catch (error) {
      console.error("Failed to initialize Odoo bridge:", error);
      throw error;
    }
  }

  async postToOdoo(post: GeneratedPost): Promise<number> {
    if (!this.twitterAccountId) {
      throw new Error("Odoo Twitter account not initialized");
    }

    const odooPost: OdooSocialPost = {
      message: post.content,
      scheduled_date: post.scheduledTime,
      account_ids: [this.twitterAccountId],
      state: "scheduled",
    };

    try {
      const result = await this.client.createSocialPost(odooPost);
      console.log(
        `Posted to Odoo: "${post.content}" (ID: ${result.id})`
      );
      return result.id;
    } catch (error) {
      console.error(`Failed to post to Odoo:`, error);
      throw error;
    }
  }

  async postMultiple(posts: GeneratedPost[]): Promise<number[]> {
    const results: number[] = [];

    for (const post of posts) {
      try {
        const id = await this.postToOdoo(post);
        results.push(id);
        // Small delay between posts to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to post: ${post.content}`, error);
      }
    }

    return results;
  }
}

export default OdooBridge;
