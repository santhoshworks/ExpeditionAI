export enum FlagType {
    NOT_EXPLORED = "not_explored",
    IN_PROGRESS = "in_progress",
    COMPLETE = "complete",
    NEEDS_REVISIT = "needs_revisit",
    PRIORITY = "priority",
    KEY_INSIGHT = "key_insight",
    CONNECTED = "connected"
}

export const FLAG_CONFIG = {
    [FlagType.NOT_EXPLORED]: {
        emoji: "❓",
        label: "Not Explored",
        description: "Haven't started yet",
        color: "text-muted-foreground"
    },
    [FlagType.IN_PROGRESS]: {
        emoji: "🚩",
        label: "In Progress",
        description: "Currently working on this trail",
        color: "text-blue-500"
    },
    [FlagType.COMPLETE]: {
        emoji: "🏁",
        label: "Complete",
        description: "Trail fully explored and understood",
        color: "text-green-500"
    },
    [FlagType.NEEDS_REVISIT]: {
        emoji: "🔄",
        label: "Needs Revisit",
        description: "Requires more attention or practice",
        color: "text-orange-500"
    },
    [FlagType.PRIORITY]: {
        emoji: "⭐",
        label: "Priority",
        description: "High importance for learning goals",
        color: "text-yellow-500"
    },
    [FlagType.KEY_INSIGHT]: {
        emoji: "💡",
        label: "Key Insight",
        description: "Important concept learned here",
        color: "text-purple-500"
    },
    [FlagType.CONNECTED]: {
        emoji: "🔗",
        label: "Connected",
        description: "Links to other trails/concepts",
        color: "text-cyan-500"
    }
} as const