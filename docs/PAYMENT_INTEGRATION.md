# Dodo Payment Integration

This document outlines the complete Dodo payment integration implementation for ThoughtMap.

## Overview

The payment system uses Dodo as the payment processor to handle credit purchases and tier upgrades. Users can purchase Basic ($5) or Pro ($15) tiers which include credits and unlock premium AI models.

## Architecture

### API Routes

1. **`/api/payments/create-checkout`** - Creates Dodo checkout sessions
2. **`/api/payments/webhook`** - Handles Dodo webhook events

### Components

1. **`CheckoutButton`** - Handles payment initiation
2. **Payment Success/Cancel Pages** - Post-payment user experience

### Database Integration

- Uses existing `user_credits` table
- Leverages `upgradeTier()` function from `lib/credits.ts`
- Atomic credit additions and tier upgrades

## Configuration

### Environment Variables

Add these to your `.env.local`:

```bash
# Dodo Payment Integration
DODO_API_URL=https://api.dodo.dev
DODO_SECRET_KEY=your_dodo_secret_key_here
DODO_WEBHOOK_SECRET=your_dodo_webhook_secret_here
```

### Dodo Dashboard Setup

1. Create a Dodo account and get your API keys
2. Configure webhook endpoint: `https://yourdomain.com/api/payments/webhook`
3. Enable these webhook events:
   - `checkout.session.completed`
   - `checkout.session.failed`

## Payment Flow

1. User clicks "Get Basic" or "Get Pro" on pricing page
2. `CheckoutButton` calls `/api/payments/create-checkout`
3. API creates Dodo checkout session with metadata
4. User redirected to Dodo checkout page
5. After payment, Dodo sends webhook to `/api/payments/webhook`
6. Webhook handler upgrades user tier and adds credits
7. User redirected to success/cancel page

## Security Features

- Webhook signature verification
- User authentication required for checkout
- Secure metadata handling
- Error logging and monitoring

## Testing

### Test Mode
Set `DODO_API_URL` to Dodo's test environment for development.

### Webhook Testing
Use tools like ngrok to expose local webhook endpoint:
```bash
ngrok http 3000
# Use the ngrok URL + /api/payments/webhook in Dodo dashboard
```

## Error Handling

- Payment failures are logged and user is notified
- Webhook processing errors are logged for manual review
- Graceful fallbacks for API failures
- User-friendly error messages

## Monitoring

Key metrics to monitor:
- Checkout session creation success rate
- Webhook processing success rate
- Payment completion rate
- User tier upgrade success rate

## Customization

### Adding New Tiers
1. Update `TIER_CONFIGS` in `lib/constants.ts`
2. Add new tier to checkout API
3. Update pricing page UI

### Changing Payment Amounts
Update the `price` field in `TIER_CONFIGS` - the system will automatically use the new amounts.

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Check webhook URL in Dodo dashboard
   - Verify webhook secret matches environment variable
   - Check server logs for signature verification errors

2. **Checkout session creation fails**
   - Verify Dodo API credentials
   - Check API endpoint URL
   - Review request payload format

3. **User tier not upgrading**
   - Check webhook processing logs
   - Verify database permissions
   - Review `upgradeTier` function execution

### Debug Mode
Enable detailed logging by setting `NODE_ENV=development`.

## Security Considerations

- Never expose Dodo secret keys in client-side code
- Always verify webhook signatures
- Use HTTPS in production
- Implement rate limiting on payment endpoints
- Log all payment-related activities for audit trails