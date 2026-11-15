/** Heights the phone sheet can rest at, as fractions of the viewport. */
export const SHEET_DETENTS = [0.38, 0.56, 0.88] as const
export const SHEET_DEFAULT = SHEET_DETENTS[1]
export const SHEET_MAX = SHEET_DETENTS[SHEET_DETENTS.length - 1]

/**
 * When the story panel is a bottom sheet: narrow screens, except a phone held
 * sideways, which is too short for a sheet and gets the side panel instead.
 * Mirrors the media queries in the stylesheet.
 */
export const SHEET_QUERY = '(max-width: 899px) and (orientation: portrait), (max-width: 899px) and (min-height: 521px)'
