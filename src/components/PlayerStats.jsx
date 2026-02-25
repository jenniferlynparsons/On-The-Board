export default function PlayerStats({ players, colorAccent }) {
  return (
    <div className="px-4 py-4 bg-white rounded-lg shadow">
      <h3 className="text-sm font-semibold text-gray-600 uppercase mb-4">Team Leaders</h3>

      <div className="space-y-3">
        {players && players.length > 0 ? (
          players.map((player, index) => (
            <div key={index} className="flex items-center justify-between pb-3 border-b border-gray-100 last:border-b-0">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{player.name}</p>
                <p className="text-xs text-gray-500">{player.statType}</p>
              </div>
              <div
                className="px-3 py-1 text-white font-bold rounded text-sm"
                style={{ backgroundColor: colorAccent }}
              >
                {player.value}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm italic">No stats available</p>
        )}
      </div>
    </div>
  )
}
