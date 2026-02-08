# GitHub Actions Setup for Twitter Marketing

## Adding Secrets to GitHub Repository

### Via GitHub Web UI

1. Go to your repository on GitHub
2. Settings > Secrets and variables > Actions
3. Click "New repository secret" for each:

**CLAUDE_API_KEY**
- Get from: https://console.anthropic.com
- Click "Create API Key" and copy

**ODOO_URL**
- Value: `https://your-instance.odoo.com`
- Don't include trailing slash

**ODOO_API_KEY**
- In Odoo: Settings > Security > API Keys
- Click "Create Key" and copy the token

**TWITTER_API_KEY** (optional for MVP)
- Get from Twitter Developer Portal

**TWITTER_API_SECRET** (optional for MVP)
- Get from Twitter Developer Portal

**TWITTER_BEARER_TOKEN** (optional for MVP)
- Get from Twitter Developer Portal

### Via GitHub CLI

```bash
gh secret set CLAUDE_API_KEY --body "sk-..."
gh secret set ODOO_URL --body "https://your-instance.odoo.com"
gh secret set ODOO_API_KEY --body "..."
```

## Testing the Workflow

### Manual Trigger

1. Go to Actions tab
2. Select "Daily Twitter Marketing Posts"
3. Click "Run workflow"
4. Watch execution logs in real-time

### Scheduled Execution

- Workflow runs at **8 AM UTC daily**
- Next run: tomorrow at 8 AM UTC
- Check Actions tab to see past runs

## Monitoring Runs

1. Go to Actions > Daily Twitter Marketing Posts
2. Click on any run to see detailed logs
3. Look for:
   - ✓ "Successfully posted X posts to Odoo"
   - ✗ Any error messages

## Troubleshooting

### Workflow not running on schedule
- GitHub Actions requires a push/commit to activate scheduled workflows
- Make sure your branch doesn't have `.github/workflows/` in `.gitignore`

### Secrets not accessible
- Secrets are only available to the branch they're set on
- Confirm secrets are set for the correct branch

### Agent fails in GitHub but works locally
- Check Node.js version matches: `actions/setup-node@v4`
- Verify all environment variables are set as secrets
- Check API key permissions haven't changed
