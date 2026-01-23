# Admin Dashboard Setup Guide

## Overview

The admin dashboard provides comprehensive analytics and user management capabilities for your ExplorerAI learning platform. It uses a **database-driven admin system** for secure and scalable admin user management.

## Features

### 1. **Admin Overview Dashboard** (`/admin`)
- Total users, active users, subscribers
- Conversion rates and revenue metrics
- Weekly activity trends (messages, trails, expeditions)
- Real-time platform health indicators

### 2. **User Management** (`/admin/users`)
- Search and filter users by tier, activity, email
- View user credits, streaks, and activity levels
- Update user tiers and add credits
- Pagination for large user bases

### 3. **Platform Analytics** (`/admin/analytics`)
- User growth trends over time
- Subscription and revenue analysis
- Model usage statistics
- User retention and activity distribution

### 4. **Admin Management** (`/admin/manage`) - Super Admin Only
- Add/remove admin users
- Manage admin roles (Admin vs Super Admin)
- View all admin users and their permissions

## Setup Instructions

### 1. **Run Database Migration**

First, run the admin users migration:

```sql
-- Run this in your Supabase SQL editor
-- File: supabase/migrations/add_admin_users.sql
```

This creates:
- `admin_users` table for managing admin access
- Database functions for checking admin status
- Row Level Security policies

### 2. **Create Your First Admin User**

After running the migration, create your first super admin:

```sql
-- Replace 'your-user-id-here' with your actual user ID
INSERT INTO admin_users (user_id, role, created_by) 
VALUES ('your-user-id-here', 'super_admin', 'your-user-id-here');
```

**To find your user ID:**
1. Sign up/login to your app
2. Go to Supabase Dashboard → Authentication → Users
3. Find your user and copy the ID from the `id` column

### 3. **Access the Dashboard**

Once configured, admin users can access:
- Main dashboard: `https://yourapp.com/admin`
- User management: `https://yourapp.com/admin/users`
- Analytics: `https://yourapp.com/admin/analytics`
- Admin management: `https://yourapp.com/admin/manage` (Super Admin only)

### 4. **Add More Admin Users**

After initial setup, super admins can add more admins through the UI:
1. Go to `/admin/manage`
2. Click "Add Admin"
3. Enter the user's email and select role
4. The system will find the user and grant admin access

## Admin Roles

### **Admin**
- View analytics and platform metrics
- Manage users (update tiers, add credits)
- Cannot add/remove other admins

### **Super Admin**
- All admin permissions
- Can add/remove admin users
- Can promote/demote admin roles

## Security Features

- **Database-driven**: Admin status stored securely in database
- **Role-based access**: Different permission levels
- **RLS Protection**: Row Level Security on all admin tables
- **Centralized checks**: Single source of truth for admin verification
- **Audit trail**: Track when admins are added/removed

## API Endpoints

### Admin Overview
- `GET /api/admin/overview` - Platform overview metrics

### User Management
- `GET /api/admin/users` - List users with pagination and filters
- `PATCH /api/admin/users` - Update user tier or add credits

### Analytics
- `GET /api/admin/analytics` - Comprehensive platform analytics

### Admin Management
- `GET /api/admin/manage` - List all admin users (Super Admin only)
- `POST /api/admin/manage` - Add/remove admin users (Super Admin only)

## Database Schema

### admin_users Table
```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  permissions TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);
```

### Helper Functions
- `is_admin(user_id)` - Check if user is admin
- `has_admin_role(role, user_id)` - Check specific role
- `get_admin_user(user_id)` - Get admin details

## Key Metrics for Subscription Optimization

### **Conversion Metrics**:
- Free to paid conversion rate
- Tier upgrade patterns (Basic → Pro)
- Revenue per user and lifetime value

### **Engagement Metrics**:
- Daily/Weekly/Monthly active users
- Learning streaks and session times
- Topic exploration patterns
- Peak usage hours

### **Retention Analysis**:
- User activity distribution (inactive, low, medium, high)
- Average streak lengths and active days
- Churn prediction indicators

### **Content Insights**:
- Most used AI models by tier
- Popular learning topics
- Feature adoption rates

## Newsletter & Marketing Tracking

To track newsletter subscriptions, add this table:

```sql
CREATE TABLE newsletter_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT, -- 'signup', 'dashboard', 'landing'
  is_active BOOLEAN DEFAULT true
);
```

Then add newsletter metrics to the admin dashboard components.

## Troubleshooting

### Common Issues

1. **"Unauthorized" Error**: 
   - Verify you've run the database migration
   - Check that your user ID is in the `admin_users` table
   - Ensure `is_active = true` for your admin record

2. **Can't Access Admin Management**: 
   - Only super admins can access `/admin/manage`
   - Check your role in the `admin_users` table

3. **Database Connection Issues**: 
   - Verify Supabase connection
   - Check RLS policies are properly set

### Performance Optimization

For large user bases:
- Database indexes are included in the migration
- Consider caching for analytics data
- Use pagination for large result sets

## Migration from Hardcoded Admin IDs

If you previously used hardcoded `ADMIN_USER_IDS`, this new system:
- ✅ Eliminates code duplication
- ✅ Provides role-based access control
- ✅ Allows dynamic admin management
- ✅ Includes audit trails
- ✅ Scales better for teams

The old hardcoded approach has been completely replaced with database-driven admin management.

## Next Steps

1. **Set up monitoring**: Add error tracking and performance monitoring
2. **Create alerts**: Set up alerts for key metrics (churn rate, conversion drops)
3. **Export capabilities**: Add CSV/PDF export for reports
4. **Advanced analytics**: Implement cohort analysis and predictive metrics
5. **A/B testing**: Add experiment tracking and results analysis

This database-driven admin system provides a secure, scalable foundation for managing your platform administrators and understanding your users for subscription optimization.