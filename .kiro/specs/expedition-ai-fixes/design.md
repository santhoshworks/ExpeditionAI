# Design Document

## Overview

This design addresses three critical failures in the ExpeditionAI platform by implementing robust, multi-layered solutions for demo expeditions, PDF processing, and YouTube transcript extraction. The approach emphasizes reliability through fallback mechanisms, proper error handling, and user experience improvements.

The core strategy involves:
- Converting demo expeditions from database-persistent to session-based storage
- Implementing multiple PDF parsing libraries with intelligent fallback chains
- Adding alternative YouTube transcript extraction methods with retry logic
- Enhancing error handling with user-friendly messaging and detailed logging

## Architecture

### Demo Expedition Architecture

**Current State**: Demo expeditions create database records with `user_id: null` and optional `is_anonymous` flags, leading to persistence issues and cleanup complexity.

**New Architecture**: Session-based demo system with in-memory state management:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Demo UI       │───▶│  Session Store   │───▶│  Chat Interface │
│                 │    │  (Browser)       │    │  (Demo Mode)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │  Demo Limits     │
                       │  - 10 messages   │
                       │  - 5 trails      │
                       │  - No persistence│
                       └──────────────────┘
```

### PDF Processing Architecture

**Multi-Library Fallback Chain**:

```
PDF Upload ──▶ pdf-parse ──▶ pdfjs-dist ──▶ pdf2json ──▶ Error
    │              │             │             │
    │              ▼             ▼             ▼
    │         Success      Success       Success
    │              │             │             │
    └──────────────┴─────────────┴─────────────┘
                           │
                           ▼
                   Content Validation
                           │
                           ▼
                   Expedition Creation
```

### YouTube Processing Architecture

**Multi-Method Transcript Extraction**:

```
YouTube URL ──▶ youtube-transcript ──▶ Puppeteer ──▶ Manual Input ──▶ Error
     │                  │                  │              │
     │                  ▼                  ▼              ▼
     │             Success            Success        Success
     │                  │                  │              │
     └──────────────────┴──────────────────┴──────────────┘
                                │
                                ▼
                        Content Validation
                                │
                                ▼
                        Expedition Creation
```

## Components and Interfaces

### Demo Session Manager

**Interface**: `DemoSessionManager`
```typescript
interface DemoSessionManager {
  createExpedition(topic: string): DemoExpedition
  addTrail(expeditionId: string, trail: DemoTrail): void
  getExpedition(expeditionId: string): DemoExpedition | null
  addMessage(trailId: string, message: DemoMessage): boolean
  checkLimits(expeditionId: string): DemoLimits
  cleanup(): void
}

interface DemoExpedition {
  id: string
  title: string
  description: string
  trails: DemoTrail[]
  createdAt: Date
  messageCount: number
}

interface DemoLimits {
  maxMessages: 10
  maxTrails: 5
  messagesUsed: number
  trailsUsed: number
  canAddMessage: boolean
  canAddTrail: boolean
}
```

**Storage**: Browser `sessionStorage` for persistence across page refreshes, with fallback to in-memory storage.

### PDF Processing Chain

**Interface**: `PDFProcessorChain`
```typescript
interface PDFProcessorChain {
  process(file: File): Promise<ProcessingResult>
}

interface PDFProcessor {
  name: string
  process(buffer: Buffer): Promise<string>
  canHandle(buffer: Buffer): boolean
}

interface ProcessingResult {
  success: boolean
  content?: string
  error?: ProcessingError
  processorUsed?: string
  fallbacksAttempted: string[]
}
```

**Processors**:
1. **PdfParseProcessor**: Primary processor using existing `pdf-parse` library
2. **PdfjsDistProcessor**: Fallback using Mozilla's PDF.js engine for complex layouts
3. **Pdf2JsonProcessor**: Final fallback for coordinate-aware parsing

### YouTube Processing Chain

**Interface**: `YouTubeProcessorChain`
```typescript
interface YouTubeProcessorChain {
  extractTranscript(url: string): Promise<TranscriptResult>
}

interface YouTubeProcessor {
  name: string
  extractTranscript(videoId: string): Promise<string>
  canHandle(videoId: string): boolean
}

interface TranscriptResult {
  success: boolean
  transcript?: string
  metadata?: VideoMetadata
  error?: ProcessingError
  processorUsed?: string
  fallbacksAttempted: string[]
}
```

**Processors**:
1. **YouTubeTranscriptProcessor**: Primary using existing `youtube-transcript` library
2. **PuppeteerProcessor**: Fallback using browser automation for transcript scraping
3. **ManualInputProcessor**: Final fallback allowing users to paste transcript manually

## Data Models

### Session Storage Schema

**Demo Expedition Storage**:
```typescript
interface StoredDemoExpedition {
  id: string
  title: string
  description: string
  trails: StoredDemoTrail[]
  createdAt: string
  lastAccessed: string
  messageCount: number
}

interface StoredDemoTrail {
  id: string
  title: string
  description: string
  sourceText: string
  isBaseCamp: boolean
  position: number
  messages: StoredDemoMessage[]
}

interface StoredDemoMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}
```

### Error Tracking Schema

```typescript
interface ProcessingError {
  type: 'user_error' | 'system_error' | 'rate_limit' | 'content_invalid'
  message: string
  technicalDetails?: string
  suggestedAction?: string
  retryAfter?: number
  processorName?: string
}

interface ProcessingAttempt {
  processorName: string
  success: boolean
  error?: string
  duration: number
  timestamp: Date
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Now I need to use the prework tool to analyze the acceptance criteria before writing the correctness properties:

### Property 1: Demo Data Non-Persistence
*For any* demo expedition operation (creation, trail addition, message sending), the database should remain unchanged while session storage contains the corresponding data.
**Validates: Requirements 1.1, 1.2**

### Property 2: Demo Session Restoration
*For any* demo expedition state, refreshing the page should restore the exact same state from session storage.
**Validates: Requirements 1.7**

### Property 3: Demo Limits Enforcement
*For any* demo expedition, attempting to exceed 10 messages per trail or 5 trails total should be rejected and trigger upgrade prompts.
**Validates: Requirements 1.4, 1.5, 1.6**

### Property 4: Demo Session Cleanup
*For any* demo session, ending the session should completely clear all temporary data from memory and storage.
**Validates: Requirements 1.3**

### Property 5: PDF Processing Fallback Chain
*For any* PDF file, when the primary processor fails, alternative processors should be attempted in sequence until success or exhaustion.
**Validates: Requirements 2.2, 6.1**

### Property 6: YouTube Processing Fallback Chain
*For any* YouTube URL, when the primary transcript method fails, alternative methods should be attempted in sequence until success or exhaustion.
**Validates: Requirements 3.2, 6.2**

### Property 7: Content Validation Consistency
*For any* extracted content (PDF or YouTube), the system should validate minimum length requirements and reject whitespace-only content.
**Validates: Requirements 2.4, 3.4, 5.1, 5.2**

### Property 8: URL Format Handling
*For any* valid YouTube URL format (youtube.com/watch, youtu.be, youtube.com/embed), the video ID should be extracted correctly.
**Validates: Requirements 3.1, 3.5**

### Property 9: Size and Rate Limit Handling
*For any* content processing, size limits (10MB for PDFs) should be enforced and rate limits should trigger exponential backoff retry logic.
**Validates: Requirements 2.6, 3.6**

### Property 10: Intelligent Content Truncation
*For any* oversized content, truncation should preserve structure and meaning while staying within processing limits.
**Validates: Requirements 2.7, 5.5**

### Property 11: Comprehensive Error Messaging
*For any* processing failure, user-friendly error messages should be returned with appropriate categorization, retry suggestions, and format explanations.
**Validates: Requirements 4.1, 4.3, 4.4, 4.5, 4.6**

### Property 12: Comprehensive Logging
*For any* processing attempt, detailed technical information should be logged including which methods succeeded/failed and error details.
**Validates: Requirements 2.5, 4.2, 6.4**

### Property 13: Content Sanitization
*For any* extracted content, potentially harmful elements should be sanitized while preserving legitimate content.
**Validates: Requirements 5.4**

### Property 14: Fallback Notifications
*For any* fallback method usage, administrators should be notified for investigation purposes.
**Validates: Requirements 6.5**

### Property 15: Manual Fallback Availability
*For any* scenario where all automated methods fail, manual content input options should be provided to users.
**Validates: Requirements 6.3**

## Error Handling

### Error Classification System

**User Errors**:
- Invalid file formats (non-PDF files, corrupted PDFs)
- Invalid YouTube URLs or private/restricted videos
- Content that exceeds size limits
- Empty or whitespace-only content

**System Errors**:
- Library failures (pdf-parse crashes, youtube-transcript API issues)
- Network timeouts and connectivity issues
- Memory allocation failures
- AI service unavailability

**Rate Limit Errors**:
- YouTube API rate limiting
- OpenRouter API rate limiting
- Browser automation detection

### Error Response Strategy

**Immediate Response**: User-friendly error messages with clear next steps
**Background Logging**: Detailed technical information for debugging
**Retry Logic**: Exponential backoff for temporary failures
**Fallback Activation**: Automatic progression through alternative methods

### Error Message Templates

```typescript
interface ErrorTemplate {
  userMessage: string
  technicalDetails: string
  suggestedActions: string[]
  retryAfter?: number
  category: 'user' | 'system' | 'rate_limit'
}

const ERROR_TEMPLATES = {
  PDF_PARSE_FAILED: {
    userMessage: "Unable to extract text from this PDF. It may be scanned or image-based.",
    technicalDetails: "pdf-parse library failed with error: {error}",
    suggestedActions: ["Try a different PDF", "Ensure PDF contains selectable text"],
    category: 'user'
  },
  YOUTUBE_NO_TRANSCRIPT: {
    userMessage: "This video doesn't have captions available. Try a different video or paste the transcript manually.",
    technicalDetails: "youtube-transcript failed: {error}",
    suggestedActions: ["Choose a video with captions", "Use manual transcript input"],
    category: 'user'
  },
  RATE_LIMIT_HIT: {
    userMessage: "Service temporarily busy. Please try again in a few minutes.",
    technicalDetails: "Rate limit exceeded for service: {service}",
    suggestedActions: ["Wait and retry", "Try during off-peak hours"],
    retryAfter: 300,
    category: 'rate_limit'
  }
}
```

## Testing Strategy

### Dual Testing Approach

**Unit Tests**: Focus on specific error conditions, edge cases, and component integration
- Test individual processors with known failing inputs
- Verify error message formatting and categorization
- Test session storage operations and cleanup
- Validate URL parsing with various formats

**Property Tests**: Verify universal properties across all inputs with minimum 100 iterations
- Generate random PDF files and verify fallback chains work correctly
- Generate random YouTube URLs and verify ID extraction
- Test demo limits with various usage patterns
- Verify content validation across different input types

### Property Test Configuration

Each property test will run with minimum 100 iterations using a property-based testing library appropriate for the target language. Tests will be tagged with comments referencing their design document properties:

**Tag format**: `Feature: expedition-ai-fixes, Property {number}: {property_text}`

### Integration Testing

**Demo Flow Testing**: Complete user journeys through demo creation, interaction, and cleanup
**Content Processing Testing**: End-to-end testing of PDF and YouTube processing with real files
**Error Scenario Testing**: Systematic testing of all error conditions and recovery paths
**Performance Testing**: Verify processing times and memory usage under various loads

### Monitoring and Observability

**Success Rate Tracking**: Monitor success rates for each processor in the fallback chains
**Performance Metrics**: Track processing times and identify bottlenecks
**Error Pattern Analysis**: Identify common failure modes for proactive fixes
**User Experience Metrics**: Monitor demo conversion rates and user satisfaction