# Twitter Marketing Agent - Local Testing Guide

## Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Copy environment template:
```bash
cp scripts/.env.twitter-marketing.example .env.twitter-marketing
```

3. Fill in your credentials:
```bash
CLAUDE_API_KEY=sk-...
ODOO_URL=https://your-instance.odoo.com
ODOO_API_KEY=...
```

## Running Agent Locally

### Test Product Content Generation

```bash
npm run agent:twitter-marketing:local
```

Expected output:
```
Starting Twitter Marketing Agent...
Connecting to Odoo instance...
✓ Connected to Twitter account: thoughtmap_twitter
Generating product content post...
✓ Product post: "What if you could explore ideas visually?..."
Generating trend-based post...
✓ Trend post: "The best learners ask better questions..."
Posting 2 posts to Odoo...
✓ Successfully posted 2 posts to Odoo
Twitter Marketing Agent completed successfully
```

## Verifying Posts in Odoo

1. Log into your Odoo instance
2. Navigate to **Social Marketing > Posts**
3. You should see your generated posts in "Draft" or "Scheduled" state
4. Check the scheduled date/time matches your configuration
5. Edit and publish when ready

## Troubleshooting

### "No Twitter account configured in Odoo Social Marketing"
- Log into Odoo
- Go to Social Marketing > Social Accounts
- Add your Twitter/X account with OAuth credentials

### API Key Authentication Errors
- Verify ODOO_API_KEY is correct (Settings > Security > API Keys)
- Confirm Odoo MCP Server module is installed
- Check that your API key has access to social.post model

### Posts Not Appearing in Odoo
- Check agent logs for API errors
- Verify Odoo social.post model is exposed in MCP Server settings
- Ensure your API key has "Create" permission for social.post

## Next Steps

1. ✅ Test agent locally
2. ✅ Verify posts appear in Odoo
3. ✅ Test GitHub Actions workflow
4. ✅ Monitor first 7 days of automated posts
