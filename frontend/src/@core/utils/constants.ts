/**
 * Application constants
 */

/**
 * Buddhist Era offset for Thai calendar calculations
 * Used to convert between Gregorian year and Buddhist Era year
 */
export const BUDDHIST_ERA_OFFSET = 543;

/**
 * Common Thai year constants for testing and validation
 */
export const THAI_YEAR_CONSTANTS = {
  CURRENT_BUDDHIST_YEAR: new Date().getFullYear() + BUDDHIST_ERA_OFFSET,
  BUDDHIST_ERA_START: 1, // First year of Buddhist Era
  OFFSET: BUDDHIST_ERA_OFFSET,
} as const;
