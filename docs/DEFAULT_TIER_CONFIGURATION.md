# Default Tier Configuration

This document explains how to configure the default tier assigned to new users upon signup.

## Overview

By default, new users are assigned the **Pro tier** with **150 credits** when they sign up. This is configurable through multiple methods:

1. **Environment Variables** (Static configuration)
2. **Admin Dashboard** (Dynamic configuration via UI)
3. **CLI Script** (Command-line management)
4. **Database Direct** (Manual database updates)

## Configuration Methods

### 1. Environment Variables

Set these in your `.env.local` file:

```bash
# Default tier for new signups (free, basic, pro)
DEFAULT_USER_TIER=pro

# Enable admin UI configuration (true/false)
ENABLE_ADMIN_TIER_CONFIG=true
```

**Priority**: Environment variables are used as fallback when database configuration is unavailable.

### 2. Admin Dashboard

When `ENABLE_ADMIN_TIER_CONFIG=true`, admins can configure default tiers through the admin dashboard:

1. Navigate to `/admin` (requires admin privileges)
2. Find the "Default Tier Configuration" section
3. Select the default tier and set credits for each tier
4. Click "Save Configuration"

**Priority**: Database configuration (when enabled) takes precedence over environment variables.

### 3. CLI Script

Use the management script for quick configuration:

```bash
# View current configuration
node scripts/manage-default-tier.js get

# Set default tier to pro
node scripts/manage-default-tier.js set pro

# Set default credits for all tiers
node scripts/manage-default-tier.js set-credits free 0 basic 50 pro 150
```

### 4. Database Direct

Configuration is stored in the `system_config` table:

```sql
-- View current configuration
SELECT key, value FROM system_config 
WHERE key IN ('default_user_tier', 'default_tier_credits');

-- Set default tier to pro
INSERT INTO system_config (key, value, description) 
VALUES ('default_user_tier', '"pro"', 'Default tier for new users')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Set default credits
INSERT INTO system_config (key, value, description) 
VALUES ('default_tier_credits', '{"free": 0, "basic": 50, "pro": 150}', 'Default credits by tier')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

## Configuration Priority

1. **Database Configuration** (if `ENABLE_ADMIN_TIER_CONFIG=true`)
2. **Environment Variables** (`DEFAULT_USER_TIER`)
3. **Fallback Default** (`pro` tier with 150 credits)

## Tier Options

| Tier | Description | Typical Credits | Features |
|------|-------------|----------------|----------|
| `free` | Free tier | 0 | Limited models, 15 trails/day |
| `basic` | Basic paid tier | 50 | More models, unlimited trails |
| `pro` | Premium tier | 150 | All models, unlimited trails |

## Default Credits by Tier

The system automatically assigns credits based on the tier:

- **Free**: 0 credits (uses free models only)
- **Basic**: 50 credits (recommended starter amount)
- **Pro**: 150 credits (generous starter amount)

These amounts are configurable and can be adjusted based on your business model.

## Business Model Considerations

### Setting Pro as Default

**Pros:**
- Better user experience (access to all features)
- Higher user engagement and retention
- Easier onboarding (no payment friction)

**Cons:**
- Higher operational costs (premium model usage)
- Potential revenue loss if users don't convert
- Need clear conversion strategy

### Recommended Strategies

1. **Freemium Model**: Start with `free` tier, encourage upgrades
2. **Trial Model**: Start with `pro` tier, require payment after trial period
3. **Credit-Based**: Start with `basic` tier with generous credits

## Implementation Details

### Database Schema

```sql
-- System configuration table
CREATE TABLE system_config (
  id UUID PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User credits with configurable defaults
CREATE TABLE user_credits (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  credits DECIMAL(10, 2) DEFAULT 0,
  tier user_tier DEFAULT 'free',
  -- ... other fields
);
```

### User Creation Flow

1. User signs up via Supabase Auth
2. `handle_new_user_credits()` trigger fires
3. Function reads default tier from `system_config`
4. Creates `user_credits` record with configured tier and credits
5. Logs welcome bonus transaction

### API Endpoints

- `GET /api/admin/config` - Retrieve current configuration
- `PUT /api/admin/config` - Update configuration (admin only)

## Monitoring

Track the impact of default tier changes:

1. **User Metrics**: Monitor signup conversion rates
2. **Credit Usage**: Track credit consumption patterns
3. **Revenue Impact**: Measure effect on subscription rates
4. **Support Load**: Monitor support requests related to tier confusion

## Security

- Only admin users can modify default tier configuration
- Configuration changes are logged with timestamps
- Environment variables provide secure fallback
- RLS policies protect configuration access

## Migration

To migrate existing users or change defaults:

```sql
-- Update existing free users to basic (example)
UPDATE user_credits 
SET tier = 'basic', credits = credits + 50
WHERE tier = 'free' AND created_at > '2024-01-01';

-- Add welcome bonus to existing users
INSERT INTO credit_transactions (user_id, amount, type, description, balance_after)
SELECT user_id, 50, 'bonus', 'Tier upgrade bonus', credits + 50
FROM user_credits 
WHERE tier = 'basic';
```

## Troubleshooting

### Common Issues

1. **Configuration not taking effect**
   - Check `ENABLE_ADMIN_TIER_CONFIG` setting
   - Verify database connection
   - Check admin user permissions

2. **Users getting wrong tier**
   - Verify trigger is active: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created_credits';`
   - Check system_config table values
   - Review function logs

3. **Credits not assigned**
   - Check `default_tier_credits` configuration
   - Verify credit transaction logs
   - Ensure positive credit values

### Debug Commands

```bash
# Check current configuration
node scripts/manage-default-tier.js get

# Test user creation (requires admin access)
curl -X POST /api/admin/test-user-creation

# View recent user signups
psql -c "SELECT u.email, uc.tier, uc.credits FROM auth.users u JOIN user_credits uc ON u.id = uc.user_id ORDER BY u.created_at DESC LIMIT 10;"
```