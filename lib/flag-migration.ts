import { FlagType } from "@/types/flags"

/**
 * Helper function to migrate from old boolean flag system to new flag types
 * This ensures backward compatibility during the transition
 */
export function migrateFlagType(
    flagType: string | null | undefined,
    isFlagged: boolean
): FlagType {
    // If we have a new flag type, use it
    if (flagType && Object.values(FlagType).includes(flagType as FlagType)) {
        return flagType as FlagType
    }

    // Otherwise, migrate from old boolean system
    if (isFlagged) {
        return FlagType.PRIORITY // Default flagged items to priority
    }

    return FlagType.NOT_EXPLORED
}

/**
 * Get the appropriate flag type for display, handling both old and new systems
 */
export function getDisplayFlagType(trail: { flag_type?: string | null; is_flagged?: boolean }): FlagType {
    return migrateFlagType(trail.flag_type, trail.is_flagged || false)
}