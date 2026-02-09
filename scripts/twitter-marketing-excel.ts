// scripts/twitter-marketing-excel.ts

import { generateProductPost } from "./agents/product-content-generator";
import { generateTrendPost, selectRelevantTrend } from "./agents/trend-monitor";
import { GeneratedPost } from "./agents/types";
import ExcelJS from "exceljs";
import * as fs from "fs";
import * as path from "path";

async function generateAndExportPosts() {
  try {
    console.log("🚀 Starting Twitter Marketing Post Generation...");

    const posts: GeneratedPost[] = [];

    // Generate product content post
    console.log("📝 Generating product content post...");
    try {
      const productPost = await generateProductPost();
      posts.push(productPost);
      console.log(`✓ Product post generated`);
    } catch (error) {
      console.error("Failed to generate product post:", error);
    }

    // Generate trend post
    console.log("📝 Generating trend-based post...");
    try {
      const trend = await selectRelevantTrend();
      const trendPost = await generateTrendPost(trend);
      posts.push(trendPost);
      console.log(`✓ Trend post generated`);
    } catch (error) {
      console.error("Failed to generate trend post:", error);
    }

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Social Posts");

    // Add headers
    worksheet.columns = [
      { header: "message", key: "message", width: 80 },
      { header: "scheduled_date", key: "scheduled_date", width: 20 },
      { header: "state", key: "state", width: 12 },
    ];

    // Format header row
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF366092" },
    };

    // Add posts to worksheet
    posts.forEach((post) => {
      worksheet.addRow({
        message: post.content,
        scheduled_date: post.scheduledTime,
        state: "scheduled",
      });
    });

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      column.width = Math.min(column.width || 15, 80);
    });

    // Save to outputs directory
    const outputDir = path.join(
      __dirname,
      "..",
      "..",
      "outputs"
    );
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filename = `twitter-posts-${new Date().toISOString().split("T")[0]}.xlsx`;
    const filepath = path.join(outputDir, filename);

    await workbook.xlsx.writeFile(filepath);

    console.log(`\n✅ Successfully generated ${posts.length} posts`);
    console.log(`📊 Excel file saved to: ${filepath}`);
    console.log("\n📋 Posts generated:");
    posts.forEach((post, idx) => {
      console.log(`\n${idx + 1}. ${post.content.substring(0, 60)}...`);
      console.log(`   Scheduled: ${post.scheduledTime}`);
    });

    console.log("\n📤 Next step: Upload the Excel file to Odoo Social Marketing");
    console.log(`   1. Go to Social Marketing > Social Posts`);
    console.log(`   2. Click "Upload Data File"`);
    console.log(`   3. Select: ${filepath}`);
    console.log(`   4. Import the posts`);
  } catch (error) {
    console.error("Error generating posts:", error);
    throw error;
  }
}

generateAndExportPosts().catch((error) => {
  console.error(error);
  process.exit(1);
});
