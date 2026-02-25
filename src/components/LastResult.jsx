export default function LastResult({ opponent, score, outcome, date, colorAccent }) {
  const getBadgeStyles = () => {
    switch (outcome?.toUpperCase()) {
      case 'W':
        return {
          bgColor: '#16a34a', // green
          label: 'W',
        }
      case 'L':
        return {
          bgColor: '#dc2626', // red
          label: 'L',
        }
      case 'OTL':
        return {
          bgColor: '#f59e0b', // amber
          label: 'OTL',
        }
      default:
        return {
          bgColor: '#6b7280', // gray
          label: outcome?.toUpperCase() || 'N/A',
        }
    }
  }

  const badgeStyles = getBadgeStyles()

  return (
    <div className="px-4 py-4 bg-white rounded-lg shadow border-l-4" style={{ borderColor: colorAccent }}>
      <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">Last Result</h3>

      {opponent && score !== undefined ? (
        <>
          <div className="flex items-start gap-3 mb-3">
            <div
              className="px-3 py-2 text-white font-bold rounded flex-shrink-0 w-14 h-14 flex items-center justify-center"
              style={{ backgroundColor: badgeStyles.bgColor }}
            >
              {badgeStyles.label}
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-gray-900">{opponent}</p>
              <p className="text-sm text-gray-600">{score}</p>
            </div>
          </div>

          <time dateTime={date} className="text-xs text-gray-500">
            {date}
          </time>
        </>
      ) : (
        <p className="text-gray-500 text-sm italic">No games yet</p>
      )}
    </div>
  )
}
