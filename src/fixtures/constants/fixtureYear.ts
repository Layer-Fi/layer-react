export const FIXTURE_YEAR = 2025

/*
 * A stable "today" pinned to the fixture year, so date-relative mock logic
 * (e.g. overdue classification) doesn't drift with the real wall clock. Set to
 * year-end so most fixtures read as past-due while the latest stay upcoming.
 */
export const FIXTURE_TODAY = new Date(Date.UTC(FIXTURE_YEAR, 11, 31))
