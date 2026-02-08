// scripts/integrations/odoo-bridge.ts

import OdooClient from "../odoo/odoo-client";
import { GeneratedPost } from "../agents/types";
import { OdooSocialPost } from "../odoo/types";

export class OdooBridge {
  private client: OdooClient;
  private twitterAccountId: number | null = null;

  constructor(odooUrl: string, odooApiKey: string) {
    this.client = new OdooClient({
      url: odooUrl,
      apiKey: odooApiKey,
    });
  }

  async initialize(): Promise<void> {
    try {
      const accounts = await this.client.listSocialAccounts();
      const twitterAccount = accounts.find(
        (acc) =>
          acc.social_media === "twitter" || acc.social_media === "x" || acc.social_media === "X"
      );

      if (!twitterAccount) {
        throw new Error(
          "No Twitter account configured in Odoo Social Marketing"
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
