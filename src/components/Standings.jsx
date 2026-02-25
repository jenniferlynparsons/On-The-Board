export default function Standings({ division, standings, currentTeamId }) {
  return (
    <div className="px-4 py-4 bg-white rounded-lg shadow">
      <h3 className="text-sm font-semibold text-gray-600 uppercase mb-4">{division} Standings</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">
            {division} division standings with {standings?.length || 0} teams
          </caption>
          <thead>
            <tr className="border-b border-gray-200">
              <th scope="col" className="text-left py-2 px-2 font-semibold text-gray-700">Team</th>
              <th scope="col" className="text-center py-2 px-2 font-semibold text-gray-700">W</th>
              <th scope="col" className="text-center py-2 px-2 font-semibold text-gray-700">L</th>
              <th scope="col" className="text-center py-2 px-2 font-semibold text-gray-700">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings && standings.length > 0 ? (
              standings.map((team) => (
                <tr
                  key={team.id}
                  className={`border-b border-gray-100 ${
                    team.id === currentTeamId
                      ? 'bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="py-3 px-2 font-semibold text-gray-900">{team.name}</td>
                  <td className="py-3 px-2 text-center text-gray-700">{team.wins}</td>
                  <td className="py-3 px-2 text-center text-gray-700">{team.losses}</td>
                  <td className="py-3 px-2 text-center font-semibold text-gray-900">{team.points}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-4 px-2 text-center text-gray-500 text-sm italic">
                  No standings data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
