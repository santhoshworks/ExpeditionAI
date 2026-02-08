// scripts/odoo/odoo-client.ts

import { OdooAuth, OdooSocialPost, CreatePostResponse } from "./types";

export class OdooClient {
  private url: string;
  private username: string;
  private password: string;
  private database: string;
  private uid: number | null = null;

  constructor(auth: OdooAuth) {
    this.url = auth.url.replace(/\/$/, ""); // Remove trailing slash
    this.username = auth.username;
    this.password = auth.password;
    this.database = auth.database;
  }

  async authenticate(): Promise<void> {
    try {
      console.log("Authenticating with Odoo...");

      const response = await fetch(`${this.url}/xmlrpc/2/common`, {
        method: "POST",
        headers: {
          "Content-Type": "text/xml",
        },
        body: this.buildXmlRpcCall("authenticate", [
          this.database,
          this.username,
          this.password,
          {},
        ]),
      });

      const text = await response.text();

      // Parse XML-RPC response to extract uid
      const uidMatch = text.match(/<int>(\d+)<\/int>/);
      if (uidMatch) {
        this.uid = parseInt(uidMatch[1]);
        console.log(`✓ Authenticated as user ID: ${this.uid}`);
        return;
      }

      // Check for errors
      const faultMatch = text.match(/<name>faultString<\/name>\s*<value><string>([^<]+)<\/string><\/value>/);
      if (faultMatch) {
        throw new Error(`Odoo authentication failed: ${faultMatch[1]}`);
      }

      throw new Error("Failed to authenticate with Odoo");
    } catch (error) {
      console.error("Authentication error:", error);
      throw error;
    }
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

      const postData = {
        message: post.message,
        scheduled_date: post.scheduled_date || new Date().toISOString(),
        account_ids: post.account_ids || [[6, 0, []]],
        state: "scheduled",
      };

      if (!this.uid) {
        throw new Error("Not authenticated. Call authenticate() first.");
      }

      const response = await fetch(`${this.url}/xmlrpc/2/object`, {
        method: "POST",
        headers: {
          "Content-Type": "text/xml",
        },
        body: this.buildXmlRpcCall("execute_kw", [
          this.database,
          this.uid,
          this.password,
          "social.post",
          "create",
          [postData],
        ]),
      });

      const text = await response.text();

      // Parse XML-RPC response to extract post ID
      const idMatch = text.match(/<int>(\d+)<\/int>/);
      if (idMatch) {
        const postId = parseInt(idMatch[1]);
        console.log(`✓ Post created in Odoo with ID: ${postId}`);
        return {
          id: postId,
          success: true,
        };
      }

      // Check for errors
      const faultMatch = text.match(/<name>faultString<\/name>\s*<value><string>([^<]+)<\/string><\/value>/);
      if (faultMatch) {
        throw new Error(`Odoo error: ${faultMatch[1]}`);
      }

      throw new Error("Failed to parse Odoo response");
    } catch (error) {
      console.error("Failed to create Odoo social post:", error);
      throw error;
    }
  }

  async listSocialAccounts(): Promise<any[]> {
    try {
      console.log("Fetching social accounts from Odoo...");

      if (!this.uid) {
        throw new Error("Not authenticated. Call authenticate() first.");
      }

      const response = await fetch(`${this.url}/xmlrpc/2/object`, {
        method: "POST",
        headers: {
          "Content-Type": "text/xml",
        },
        body: this.buildXmlRpcCall("execute_kw", [
          this.database,
          this.uid,
          this.password,
          "social.stream",
          "search_read",
          [[]],
        ]),
      });

      const text = await response.text();
      console.log("Raw XML response length:", text.length);

      // Check for errors
      const faultMatch = text.match(/<name>faultString<\/name>\s*<value><string>([^<]+)<\/string><\/value>/);
      if (faultMatch) {
        console.warn(`Warning: Could not fetch accounts: ${faultMatch[1]}`);
        return [];
      }

      // Parse XML-RPC array response
      const accounts: any[] = [];

      // Extract array items: look for each <struct>...</struct>
      const structMatches = text.matchAll(/<struct>([\s\S]*?)<\/struct>/g);

      for (const structMatch of structMatches) {
        const structContent = structMatch[1];
        const account: any = {};

        // Extract id: <name>id</name><value><int>2</int></value>
        const idMatch = structContent.match(/<name>id<\/name>\s*<value><int>(\d+)<\/int><\/value>/);
        if (idMatch) account.id = parseInt(idMatch[1]);

        // Extract name: <name>name</name><value><string>...</string></value>
        const nameMatch = structContent.match(/<name>name<\/name>\s*<value><string>([^<]+)<\/string><\/value>/);
        if (nameMatch) account.name = nameMatch[1];

        // Extract media_id for Twitter/X detection: <name>media_id</name><value><array><data><value><int>...</int></value><value><string>X</string>...</value>
        const mediaMatch = structContent.match(/<name>media_id<\/name>\s*<value><array><data>[\s\S]*?<string>(X|Twitter|twitter)<\/string>/i);
        if (mediaMatch) account.media = "twitter";

        if (account.id && account.name) {
          accounts.push(account);
          console.log(`Found account: ${account.name} (ID: ${account.id}, Media: ${account.media || "unknown"})`);
        }
      }

      console.log(`Fetched ${accounts.length} accounts total`);
      return accounts;
    } catch (error) {
      console.error("Failed to list Odoo social accounts:", error);
      return [];
    }
  }

  private buildXmlRpcCall(method: string, params: any[]): string {
    return `<?xml version="1.0"?>
<methodCall>
  <methodName>${method}</methodName>
  <params>
    ${params
      .map((p) => `<param><value>${this.valueToXml(p)}</value></param>`)
      .join("")}
  </params>
</methodCall>`;
  }
}

export default OdooClient;
