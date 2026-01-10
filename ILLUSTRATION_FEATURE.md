# Trail Illustration Feature

This feature allows users to generate AI-powered illustrations for their trails using Google's Imagen API. The illustrations are generated based on the topic being discussed in the thread, and the generation queries are stored in the database for regeneration purposes.

## Features

- **Generate Illustrations**: Create AI-generated illustrations based on trail topics
- **Regenerate Illustrations**: Recreate illustrations using stored queries
- **Credit System**: Uses 2 credits per generation/regeneration
- **Query Storage**: Stores the generation prompt in the database, not the image itself
- **Ownership Verification**: Ensures users can only generate illustrations for their own trails

## Database Schema

### New Table: `trail_illustrations`

```sql
CREATE TABLE trail_illustrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trail_id UUID NOT NULL REFERENCES trails(id) ON DELETE CASCADE,
  illustration_query TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## API Endpoints

### POST `/api/illustrations/generate`
Generate a new illustration for a trail.

**Request Body:**
```json
{
  "trailId": "uuid",
  "topic": "string"
}
```

**Response:**
```json
{
  "success": true,
  "imageUrl": "data:image/...",
  "query": "Generated prompt",
  "creditsUsed": 2,
  "remainingCredits": 48
}
```

### POST `/api/illustrations/regenerate`
Regenerate an existing illustration using the stored query.

**Request Body:**
```json
{
  "trailId": "uuid"
}
```

### GET `/api/illustrations/[trailId]`
Get existing illustration data for a trail.

**Response:**
```json
{
  "id": "uuid",
  "query": "Stored generation prompt",
  "generatedAt": "2024-01-10T...",
  "trailTitle": "Trail Title"
}
```

## Components

### `IllustrationPanel`
React component that provides the UI for generating and managing illustrations.

**Props:**
- `trailId`: The ID of the trail
- `trailTitle`: The title of the trail
- `defaultTopic`: Optional default topic for illustration

### `useIllustrations` Hook
Custom React hook for managing illustration operations.

**Methods:**
- `generateIllustration(trailId, topic)`: Generate new illustration
- `regenerateIllustration(trailId)`: Regenerate existing illustration
- `getIllustration(trailId)`: Get existing illustration data

## Google Imagen Integration

### Setup Required

1. **Google Cloud Project**: Set up a Google Cloud project with Vertex AI API enabled
2. **Authentication**: Configure service account credentials
3. **Environment Variables**:
   ```env
   GOOGLE_CLOUD_PROJECT_ID=your-project-id
   GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
   ```

### ImagenClient Class

The `ImagenClient` class in `lib/imagen.ts` handles:
- Authentication with Google Cloud
- API requests to Vertex AI Imagen
- Error handling and fallbacks
- Image format conversion

## Usage Example

```tsx
import { IllustrationPanel } from '@/components/illustration-panel'

function TrailView({ trail }) {
  return (
    <div>
      {/* Other trail content */}
      
      <IllustrationPanel
        trailId={trail.id}
        trailTitle={trail.title}
        defaultTopic="Machine Learning Concepts"
      />
    </div>
  )
}
```

## Credit System Integration

- **Cost**: 2 credits per generation/regeneration
- **Validation**: Checks user credits before generation
- **Deduction**: Automatically deducts credits after successful generation
- **Error Handling**: Returns appropriate errors for insufficient credits

## Security Features

- **Authentication**: Requires valid user session
- **Authorization**: Users can only generate illustrations for their own trails
- **Rate Limiting**: Credit system naturally limits usage
- **Input Validation**: Validates trail IDs and topics
- **RLS Policies**: Database-level security for trail access

## Fallback Behavior

When Google Imagen API is unavailable:
- Falls back to SVG placeholder images
- Still stores the generation query in database
- Maintains consistent user experience
- Logs errors for debugging

## Migration

Run the database migration to add the new table:

```bash
# Apply the migration
supabase db push

# Or if using migration files
supabase migration up
```

## Future Enhancements

- **Image Styles**: Allow users to choose different illustration styles
- **Batch Generation**: Generate multiple variations at once
- **Image History**: Keep track of previous generations
- **Export Options**: Allow downloading illustrations in different formats
- **Integration**: Embed illustrations directly in trail content