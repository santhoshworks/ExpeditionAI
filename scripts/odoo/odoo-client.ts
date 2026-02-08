// scripts/odoo/odoo-client.ts

import { OdooAuth, OdooSocialPost, CreatePostResponse } from "./types";

export class OdooClient {
  private url: string;
  private apiKey: string;

  constructor(auth: OdooAuth) {
    this.url = auth.url.replace(/\/$/, ""); // Remove trailing slash
    this.apiKey = auth.apiKey;
  }

  private async callXmlRpc(
    method: string,
    params: any
  ): Promise<any> {
    const body = `<?xml version="1.0"?>
<methodCall>
  <methodName>${method}</methodName>
  <params>
    <param><value><string>${this.apiKey}</string></value></param>
    ${params.map((p: any) => `<param><value>${this.valueToXml(p)}</value></param>`).join("")}
  </params>
</methodCall>`;

    const response = await fetch(`${this.url}/xmlrpc/2/object`, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml",
      },
      body,
    });

    const text = await response.text();

    if (!response.ok) {
      throw new Error(`Odoo API error: ${response.statusText}`);
    }

    // Simple XML-RPC response parsing
    const faultMatch = text.match(/<name>faultString<\/name>\s*<value><string>([^<]+)<\/string><\/value>/);
    if (faultMatch) {
      throw new Error(`Odoo error: ${faultMatch[1]}`);
    }

    return text;
  }

  private valueToXml(value: any): string {
    if (typeof value === "string") {
      return `<string>${this.escapeXml(value)}</string>`;
    }
    if (typeof value === "number") {
      return `<int>${value}</int>`;
    }
    if (typeof value === "boolean") {
      return `<boolean>${value ? 1 : 0}</boolean>`;
    }
    if (Array.isArray(value)) {
      return `<array><data>${value.map((v) => `<value>${this.valueToXml(v)}</value>`).join("")}</data></array>`;
    }
    if (typeof value === "object") {
      return `<struct>${Object.entries(value)
        .map(([k, v]) => `<member><name>${k}</name><value>${this.valueToXml(v)}</value></member>`)
        .join("")}</struct>`;
    }
    return "<string></string>";
  }

  private escapeXml(str: string): string {
    return str.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case "&":
          return "&amp;";
        case "'":
          return "&apos;";
        case '"':
          return "&quot;";
        default:
          return c;
      }
    });
  }

  async createSocialPost(post: OdooSocialPost): Promise<CreatePostResponse> {
    try {
      console.log("Creating social post in Odoo...");

      // For testing: log the post that would be created
      console.log(`Post content: "${post.message}"`);
      console.log(`Scheduled for: ${post.scheduled_date}`);

      // Return a mock response for now (full XML-RPC implementation would go here)
      return {
        id: Math.floor(Math.random() * 10000),
        success: true,
      };
    } catch (error) {
      console.error("Failed to create Odoo social post:", error);
      throw error;
    }
  }

  async listSocialAccounts(): Promise<any[]> {
    try {
      console.log("Fetching social accounts from Odoo...");
      // Return mock Twitter account for testing
      return [
        {
          id: 1,
          name: "thoughtmap_twitter",
          social_media: "twitter",
        },
      ];
    } catch (error) {
      console.error("Failed to list Odoo social accounts:", error);
      throw error;
    }
  }
}

export default OdooClient;
