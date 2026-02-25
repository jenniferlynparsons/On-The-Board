export default function NextGame({ opponent, date, time, isHome, colorAccent }) {
  return (
    <div className="px-4 py-4 bg-white rounded-lg shadow border-l-4" style={{ borderColor: colorAccent }}>
      <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">Next Game</h3>

      {opponent ? (
        <>
          <div className="mb-3">
            <p className="text-lg font-bold text-gray-900">{opponent}</p>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span
              className="px-2 py-1 text-xs font-semibold text-white rounded"
              style={{ backgroundColor: colorAccent }}
            >
              {isHome ? 'HOME' : 'AWAY'}
            </span>
          </div>

          <div className="text-sm text-gray-600">
            <time dateTime={`${date}T${time}`}>
              <p>{date}</p>
              <p className="font-semibold text-gray-900">{time}</p>
            </time>
          </div>
        </>
      ) : (
        <p className="text-gray-500 text-sm italic">Season not yet started</p>
      )}
    </div>
  )
}
