import { useState, useEffect } from 'react'
import { fmtDate } from '../utils/dateHelpers'

const ESPN_BASE = 'https://site.api.espn.com/apis'
const DEVILS_ID = '11'

export function useDevils() {
  const [data, setData] = useState({
    record: '',
    nextGame: { opponent: null, date: null, time: null, isHome: null },
    lastResult: { opponent: null, score: null, outcome: null, date: null },
    standings: [],
    players: [], // ESPN doesn't provide team leaders, so this stays empty
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDevilsData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch all endpoints in parallel (ESPN has CORS support)
      const results = await Promise.allSettled([
        fetch(`${ESPN_BASE}/site/v2/sports/hockey/nhl/teams/${DEVILS_ID}`).then(r => r.json()),
        fetch(`${ESPN_BASE}/site/v2/sports/hockey/nhl/teams/${DEVILS_ID}/schedule`).then(r => r.json()),
        fetch(`${ESPN_BASE}/v2/sports/hockey/nhl/standings`).then(r => r.json()),
      ])

      const [teamResult, scheduleResult, standingsResult] = results

      const teamData = teamResult.status === 'fulfilled' ? teamResult.value : null
      const scheduleData = scheduleResult.status === 'fulfilled' ? scheduleResult.value : null
      const standingsData = standingsResult.status === 'fulfilled' ? standingsResult.value : null

      // Parse team record
      let record = 'Regular Season'
      if (teamData?.team?.record?.items?.[0]) {
        const recordItem = teamData.team.record.items[0]
        const stats = recordItem.stats || []
        const wins = stats.find(s => s.name === 'wins')?.value || 0
        const losses = stats.find(s => s.name === 'losses')?.value || 0
        const otLosses = stats.find(s => s.name === 'otLosses')?.value || 0
        const points = stats.find(s => s.name === 'points')?.value || 0
        record = `${wins}W - ${losses}L - ${otLosses}OTL (${points} PTS)`
      }

      // Parse next game from team data
      let nextGame = { opponent: null, date: null, time: null, isHome: null }
      if (teamData?.team?.nextEvent?.[0]) {
        const event = teamData.team.nextEvent[0]
        const competition = event.competitions?.[0]
        if (competition) {
          const competitors = competition.competitors || []
          const devilsTeam = competitors.find(c => c.id === DEVILS_ID)
          const opponentTeam = competitors.find(c => c.id !== DEVILS_ID)

          if (devilsTeam && opponentTeam) {
            const gameDate = new Date(event.date)
            // Format date in Eastern Time to avoid UTC date shift
            const dateStr = gameDate.toLocaleDateString('en-CA', {
              timeZone: 'America/New_York'
            }) // Returns YYYY-MM-DD format
            nextGame = {
              opponent: opponentTeam.team?.displayName || 'TBD',
              date: fmtDate(dateStr),
              time: gameDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                timeZone: 'America/New_York'
              }) + ' ET',
              isHome: devilsTeam.homeAway === 'home',
            }
          }
        }
      }

      // Parse last result from schedule
      let lastResult = { opponent: null, score: null, outcome: null, date: null }
      if (scheduleData?.events) {
        const completedGames = scheduleData.events.filter(e =>
          e.competitions?.[0]?.status?.type?.completed
        )

        if (completedGames.length > 0) {
          const lastGame = completedGames[completedGames.length - 1]
          const competition = lastGame.competitions?.[0]
          if (competition) {
            const competitors = competition.competitors || []
            const devilsTeam = competitors.find(c => c.id === DEVILS_ID)
            const opponentTeam = competitors.find(c => c.id !== DEVILS_ID)

            if (devilsTeam && opponentTeam) {
              const devilsScore = parseInt(devilsTeam.score?.value || devilsTeam.score || 0)
              const opponentScore = parseInt(opponentTeam.score?.value || opponentTeam.score || 0)
              const didWin = devilsTeam.winner === true

              // Check for OT loss
              let outcome = 'L'
              if (didWin) {
                outcome = 'W'
              } else if (devilsScore < opponentScore) {
                // Check if game went to OT/SO
                const period = competition.status?.period || 3
                if (period > 3) {
                  outcome = 'OTL'
                }
              }

              const gameDate = new Date(lastGame.date)
              // Format date in Eastern Time to avoid UTC date shift
              const dateStr = gameDate.toLocaleDateString('en-CA', {
                timeZone: 'America/New_York'
              })
              lastResult = {
                opponent: opponentTeam.team?.displayName || 'Unknown',
                score: `${outcome} ${devilsScore}-${opponentScore}`,
                outcome,
                date: fmtDate(dateStr),
              }
            }
          }
        }
      }

      // Parse Eastern Conference standings
      let standingsList = []
      if (standingsData?.children) {
        // Eastern Conference is first child
        const eastern = standingsData.children.find(c => c.name === 'Eastern Conference')
        if (eastern?.standings?.entries) {
          standingsList = eastern.standings.entries
            .map(entry => {
              const stats = entry.stats || []
              const statsMap = {}
              stats.forEach(s => { statsMap[s.name] = s.value })

              return {
                id: entry.team?.id,
                name: entry.team?.displayName || 'Unknown',
                wins: statsMap.wins || 0,
                losses: statsMap.losses || 0,
                otLosses: statsMap.otLosses || 0,
                points: statsMap.points || 0,
              }
            })
            .sort((a, b) => b.wins - a.wins)
        }
      }

      setData({
        record,
        nextGame,
        lastResult,
        standings: standingsList,
        players: [], // ESPN doesn't provide player leaders
      })
    } catch (err) {
      setError('Failed to fetch Devils data.')
      console.error('Devils fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDevilsData()
  }, [])

  return {
    data,
    loading,
    error,
    refresh: fetchDevilsData,
  }
}
