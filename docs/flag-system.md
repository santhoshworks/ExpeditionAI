# Multi-Flag System

The new multi-flag system replaces the simple boolean flag with multiple flag types to better track learning progress.

## Flag Types

| Flag | Emoji | Description | Use Case |
|------|-------|-------------|----------|
| **Not Explored** | ❓ | Haven't started yet (default) | New trails, unvisited content |
| **In Progress** | 🚩 | Currently working on this trail | Active learning, ongoing work |
| **Complete** | 🏁 | Trail fully explored and understood | Finished learning, mastered content |
| **Needs Revisit** | 🔄 | Requires more attention or practice | Difficult concepts, needs review |
| **Priority** | ⭐ | High importance for learning goals | Important topics, urgent items |
| **Key Insight** | 💡 | Important concept learned here | Breakthrough moments, key learnings |
| **Connected** | 🔗 | Links to other trails/concepts | Related topics, cross-references |

## Usage

### Setting Flags
- Click on any flag emoji to open the flag menu
- Select the appropriate flag type from the dropdown
- The flag will be saved automatically

### Visual Indicators
- Flags appear next to trail titles in all views
- Non-default flags are always visible
- Default flags (❓) only show on hover
- Each flag type has a distinct color for quick recognition

## Database Schema

The system maintains backward compatibility:
- `is_flagged` (boolean) - Legacy field, still updated for compatibility
- `flag_type` (string) - New field storing the specific flag type

## Migration

Existing flagged trails are automatically migrated to "Priority" (⭐) status when first accessed with the new system.

## Components

- `MultiFlagButton` - Main flag selection component
- `FLAG_CONFIG` - Configuration object with all flag definitions
- `getDisplayFlagType()` - Helper for backward compatibility