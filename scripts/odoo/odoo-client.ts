// scripts/odoo/odoo-client.ts

import { OdooAuth, OdooSocialPost, CreatePostResponse } from "./types";

export class OdooClient {
  private url: string;
  private apiKey: string;

  constructor(auth: OdooAuth) {
    this.url = auth.url;
    this.apiKey = auth.apiKey;
  }

  async createSocialPost(post: OdooSocialPost): Promise<CreatePostResponse> {
    try {
      // Using Odoo XML-RPC API (common approach)
      // In production, integrate with Odoo MCP Server when using Claude
      // For now, use REST if available or XML-RPC

      const response = await fetch(`${this.url}/api/social.post/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "call",
          params: {
            model: "social.post",
            method: "create",
            args: [post],
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(
          `Odoo API error: ${data.error?.message || response.statusText}`
        );
      }

      return {
        id: data.result,
        success: true,
      };
    } catch (error) {
      console.error("Failed to create Odoo social post:", error);
      throw error;
    }
  }

  async listSocialAccounts(): Promise<any[]> {
    try {
      const response = await fetch(`${this.url}/api/social.account/search`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      return data.result || [];
    } catch (error) {
      console.error("Failed to list Odoo social accounts:", error);
      throw error;
    }
  }
}

export default OdooClient;
