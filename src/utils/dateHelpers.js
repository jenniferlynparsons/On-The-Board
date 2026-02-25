/**
 * Format a date string (YYYY-MM-DD) to readable format
 * @param {string} dateStr - ISO date string (YYYY-MM-DD)
 * @returns {string} Formatted date (e.g., "Feb 28, 2026")
 */
export function fmtDate(dateStr) {
  if (!dateStr) return ''
  // Parse as local date to avoid timezone off-by-one errors
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Format a time string (HH:MM:SS or HH:MM) to readable format
 * @param {string} timeStr - Time string in 24-hour format
 * @param {string} timezone - Timezone abbreviation (PT, ET, etc.)
 * @returns {string} Formatted time (e.g., "1:05 PM PT")
 */
export function fmtTime(timeStr, timezone = '') {
  if (!timeStr) return ''
  const [hours, minutes] = timeStr.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0)

  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    meridiem: 'short',
  })

  return timezone ? `${time} ${timezone}` : time
}

/**
 * Get date range for API queries (past N days to future N days)
 * @param {number} daysBack - Number of days in the past
 * @param {number} daysForward - Number of days in the future
 * @returns {object} Object with startDate and endDate in YYYY-MM-DD format
 */
export function getDateRange(daysBack = 10, daysForward = 14) {
  const today = new Date()

  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - daysBack)

  const endDate = new Date(today)
  endDate.setDate(endDate.getDate() + daysForward)

  // Format as local dates (YYYY-MM-DD) to avoid UTC conversion issues
  const formatLocalDate = (d) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return {
    startDate: formatLocalDate(startDate),
    endDate: formatLocalDate(endDate),
  }
}

/**
 * Parse game status from MLB API
 * @param {string} status - abstractGameState from MLB API
 * @returns {string} Readable status
 */
export function parseGameStatus(status) {
  const statusMap = {
    'Final': 'Final',
    'Live': 'In Progress',
    'Preview': 'Upcoming',
    'Scheduled': 'Upcoming',
  }
  return statusMap[status] || status
}
