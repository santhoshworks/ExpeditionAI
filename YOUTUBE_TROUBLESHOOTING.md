# YouTube Integration Troubleshooting

## Common Issues and Solutions

### 1. "AI service not configured" Error
**Cause:** Missing OpenRouter API key
**Solution:** 
- Add `OPENROUTER_API_KEY` to your environment variables
- Get an API key from [OpenRouter](https://openrouter.ai/)
- Add to `.env.local`: `OPENROUTER_API_KEY=your_key_here`

### 2. "Authentication required" Error
**Cause:** User not logged in
**Solution:**
- Make sure you're signed in to the application
- Check if authentication is working by visiting `/dashboard`

### 3. "Invalid YouTube URL" Error
**Cause:** URL format not recognized
**Solution:**
- Use valid YouTube URLs like:
  - `https://www.youtube.com/watch?v=VIDEO_ID`
  - `https://youtu.be/VIDEO_ID`
  - `https://www.youtube.com/embed/VIDEO_ID`

### 4. "Failed to create expedition" Error
**Cause:** Database or AI service issues
**Solution:**
- Check browser console for detailed error messages
- Verify Supabase connection is working
- Check if all database migrations have been run

## Testing the Integration

### 1. Test Environment Setup
Visit `/api/test-youtube` to check:
- OpenRouter API key availability
- Authentication status
- Basic service connectivity

### 2. Test with Example URLs
Try these test URLs:
- `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- `https://youtu.be/dQw4w9WgXcQ`

### 3. Check Browser Console
Open Developer Tools (F12) and check the Console tab for:
- Network request details
- Error messages
- Response data

## Environment Variables Required

```bash
# Required for YouTube integration
OPENROUTER_API_KEY=your_openrouter_api_key

# Required for database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Database Requirements

Make sure these migrations have been run:
1. `001_initial_schema.sql` - Basic tables
2. `add_public_expeditions.sql` - Public sharing features

## API Endpoint Testing

Test the API directly with curl:

```bash
curl -X POST http://localhost:3000/api/youtube-to-expedition \
  -H "Content-Type: application/json" \
  -d '{"youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}' \
  -H "Authorization: Bearer YOUR_SUPABASE_JWT"
```

## Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| "AI service not configured" | Missing OpenRouter key | Add OPENROUTER_API_KEY |
| "Authentication required" | Not logged in | Sign in to the app |
| "Invalid YouTube URL" | Bad URL format | Use proper YouTube URL |
| "Could not process video content" | Transcript issue | Try different video |
| "Failed to create expedition" | Database/AI error | Check logs and config |

## Debug Mode

The YouTube component now includes console logging. Check the browser console for:
- Submitted URL
- Response status
- Response data
- Any error details

This will help identify exactly where the process is failing.