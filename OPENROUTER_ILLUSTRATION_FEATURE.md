# OpenRouter-Powered Trail Illustrations

This feature generates AI-powered illustrations for your trails using OpenRouter's text models to create detailed visual descriptions and enhanced SVG illustrations. No additional API accounts needed beyond your existing OpenRouter setup!

## How It Works

1. **AI-Generated Descriptions**: Uses OpenRouter's free models (like Gemini 2.0 Flash) to create detailed visual descriptions
2. **Smart SVG Generation**: Converts AI descriptions into enhanced SVG illustrations with dynamic colors and shapes
3. **Query Storage**: Stores the AI-generated prompts in your database for regeneration
4. **Cost Effective**: Uses free OpenRouter models for prompt generation, only costs your app credits (2 credits per generation)

## Features

- ✅ **No Extra API Keys**: Uses your existing OpenRouter integration
- ✅ **AI-Enhanced Visuals**: Creates detailed descriptions then generates matching SVG illustrations
- ✅ **Smart Color Detection**: Extracts colors mentioned in AI descriptions
- ✅ **Shape Recognition**: Adds relevant shapes based on AI analysis
- ✅ **User API Key Support**: Can use user's personal OpenRouter key if provided
- ✅ **Fallback System**: Graceful degradation if AI generation fails

## Database Schema

The feature adds one new table to store illustration queries:

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

### Generate Illustration
```
POST /api/illustrations/generate
{
  "trailId": "uuid",
  "topic": "Machine Learning Concepts"
}
```

**Response:**
```json
{
  "success": true,
  "imageUrl": "data:image/svg+xml,...",
  "query": "Educational illustration showing...",
  "description": "A detailed visual description...",
  "creditsUsed": 2,
  "remainingCredits": 48
}
```

### Regenerate Illustration
```
POST /api/illustrations/regenerate
{
  "trailId": "uuid"
}
```

### Get Illustration Data
```
GET /api/illustrations/[trailId]
```

## Implementation Details

### AI Prompt Generation Process

1. **Visual Description**: AI creates detailed description including:
   - Main visual elements
   - Color palette suggestions
   - Composition and layout
   - Style notes

2. **Optimized Prompt**: AI generates concise prompt for external image services

3. **SVG Enhancement**: Code analyzes description to create matching SVG:
   - Extracts mentioned shapes (circles, squares, arrows)
   - Identifies colors from description
   - Applies appropriate styling and gradients

### Example AI Flow

**Input Topic**: "Neural Networks"

**AI Description**: 
> "A clean diagram showing interconnected nodes in layers. Use blue and teal colors for a modern tech feel. Show circular nodes connected by arrows, arranged in three distinct layers representing input, hidden, and output layers."

**Generated SVG**: Creates blue/teal circles arranged in layers with connecting arrows

## Usage

### Basic Implementation

```tsx
import { IllustrationPanel } from '@/components/illustration-panel'

function TrailView({ trail }) {
  return (
    <div>
      <IllustrationPanel
        trailId={trail.id}
        trailTitle={trail.title}
        defaultTopic="Neural Networks"
      />
    </div>
  )
}
```

### Using the Hook Directly

```tsx
import { useIllustrations } from '@/hooks/use-illustrations'

function CustomIllustration({ trailId }) {
  const { generateIllustration, isGenerating } = useIllustrations()
  
  const handleGenerate = async () => {
    const result = await generateIllustration(trailId, "Data Structures")
    if (result) {
      console.log('Generated:', result.imageUrl)
      console.log('Description:', result.description)
    }
  }
  
  return (
    <button onClick={handleGenerate} disabled={isGenerating}>
      Generate Illustration
    </button>
  )
}
```

## Configuration

### Environment Variables

The feature uses your existing OpenRouter setup:

```env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

### User API Keys

Users can optionally provide their own OpenRouter API keys in their profile. The system will:
1. Check for user's personal API key
2. Fall back to system API key if not available
3. Use free models to minimize costs

## Credit System Integration

- **Cost**: 2 credits per generation/regeneration
- **Model Used**: Free OpenRouter models (Gemini 2.0 Flash)
- **Validation**: Checks credits before generation
- **Deduction**: Only charged on successful generation

## Migration Instructions

1. **Run Database Migration**:
   ```bash
   # Apply the new table
   supabase db push
   ```

2. **No Additional Setup Required**: Uses existing OpenRouter integration

3. **Add to Your UI**: Import and use the `IllustrationPanel` component

## Advanced Features

### Custom SVG Styling

The system automatically:
- Detects colors mentioned in AI descriptions
- Maps common color names to hex values
- Applies gradients and shadows
- Scales elements based on content

### Fallback Behavior

If AI generation fails:
- Falls back to basic SVG with topic text
- Still stores attempt in database
- Maintains consistent user experience
- Logs errors for debugging

### Performance Optimizations

- Uses free OpenRouter models to minimize API costs
- Generates SVG client-side for instant display
- Caches AI descriptions for regeneration
- Minimal database storage (text only)

## Troubleshooting

### Common Issues

1. **"Insufficient Credits"**: User needs more credits in your app
2. **"OpenRouter API Error"**: Check API key and OpenRouter account status
3. **"No Illustration Found"**: Trail hasn't had illustration generated yet

### Debug Mode

Enable logging to see AI generation process:

```javascript
// In openrouter-image.ts
console.log('AI Description:', visualDescription)
console.log('Generated Prompt:', imagePrompt)
```

## Future Enhancements

- **Style Variations**: Multiple illustration styles (sketch, diagram, infographic)
- **External Image APIs**: Integration with DALL-E, Midjourney, etc. using generated prompts
- **Batch Generation**: Generate multiple variations at once
- **Export Options**: Download as PNG, PDF, or high-res SVG
- **Template System**: Pre-defined illustration templates for common topics

This implementation gives you powerful AI-generated illustrations using only your existing OpenRouter account, with intelligent fallbacks and cost-effective operation!