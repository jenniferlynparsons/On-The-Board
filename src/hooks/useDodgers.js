import { useState, useEffect } from 'react'
import { fmtDate, fmtTime, getDateRange } from '../utils/dateHelpers'

const BASE_URL = 'https://statsapi.mlb.com/api/v1'
const TEAM_ID = 119
const LEAGUE_ID = 104
const SEASON = 2026

export function useDodgers() {
  const [data, setData] = useState({
    record: '',
    nextGame: { opponent: null, date: null, time: null, isHome: null },
    lastResult: { opponent: null, score: null, outcome: null, date: null },
    standings: [],
    players: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDodgersData = async () => {
    setLoading(true)
    setError(null)

    try {
      const { startDate, endDate } = getDateRange(10, 14)

      // Fetch all endpoints in parallel
      const results = await Promise.allSettled([
        fetch(`${BASE_URL}/schedule?teamId=${TEAM_ID}&startDate=${startDate}&endDate=${endDate}&sportId=1&hydrate=linescore`).then(r => r.json()),
        fetch(`${BASE_URL}/standings?leagueId=${LEAGUE_ID}&season=${SEASON}&standingsTypes=regularSeason`).then(r => r.json()),
        fetch(`${BASE_URL}/teams/${TEAM_ID}/leaders?leaderCategories=homeRuns,battingAverage,strikeouts&season=${SEASON}&leaderGameTypes=R`).then(r => r.json()),
      ])

      const [scheduleResult, standingsResult, leadersResult] = results

      const scheduleData = scheduleResult.status === 'fulfilled' ? scheduleResult.value : null
      const standingsData = standingsResult.status === 'fulfilled' ? standingsResult.value : null
      const leadersData = leadersResult.status === 'fulfilled' ? leadersResult.value : null

      // Parse schedule (next game and last result)
      let nextGame = { opponent: null, date: null, time: null, isHome: null }
      let lastResult = { opponent: null, score: null, outcome: null, date: null }
      let record = 'Loading...'

      if (scheduleData?.dates) {
        const today = new Date().toISOString().split('T')[0]
        // Flatten all games from all dates
        const allGames = scheduleData.dates.flatMap(d => d.games || [])
        const futureGames = allGames.filter(g => g.gameDate.split('T')[0] >= today && g.status.abstractGameState !== 'Final')
        const pastGames = allGames.filter(g => g.gameDate.split('T')[0] < today || (g.gameDate.split('T')[0] === today && g.status.abstractGameState === 'Final')).reverse()

        // Next game
        if (futureGames.length > 0) {
          const game = futureGames[0]
          const isHome = game.teams.home.team.id === TEAM_ID
          const opponent = isHome ? game.teams.away.team.name : game.teams.home.team.name
          const [dateStr, timeStr] = game.gameDate.split('T')
          nextGame = {
            opponent,
            date: fmtDate(dateStr),
            time: fmtTime(timeStr, 'PT'),
            isHome,
          }
        }

        // Last result
        if (pastGames.length > 0) {
          const game = pastGames[0]
          const isHome = game.teams.home.team.id === TEAM_ID
          const opponent = isHome ? game.teams.away.team.name : game.teams.home.team.name
          const homeScore = game.teams.home.score
          const awayScore = game.teams.away.score
          const dodgersScore = isHome ? homeScore : awayScore
          const opponentScore = isHome ? awayScore : homeScore

          let outcome = 'L'
          if (dodgersScore > opponentScore) {
            outcome = 'W'
          } else if (dodgersScore < opponentScore && game.gameType === 'S') {
            // Spring training games can go to extra innings
            outcome = 'L'
          }

          lastResult = {
            opponent,
            score: `${outcome} ${dodgersScore}-${opponentScore}`,
            outcome,
            date: fmtDate(game.gameDate.split('T')[0]),
          }
        }
      }

      // Parse standings
      let standingsList = []
      if (standingsData?.records) {
        const nlWest = standingsData.records.find(div => div.divisionName === 'NL West')
        if (nlWest) {
          standingsList = nlWest.teamRecords.map(team => ({
            id: team.team.id,
            name: team.team.name,
            wins: team.wins,
            losses: team.losses,
            points: team.wins + team.losses > 0 ? team.wins : 0,
          }))
          record = `${nlWest.teamRecords[0].wins}W - ${nlWest.teamRecords[0].losses}L`
        }
      }

      // Parse leaders
      let playersList = []
      if (leadersData?.leaders) {
        playersList = leadersData.leaders.slice(0, 3).map((leader, idx) => {
          const player = leader.person
          const stat = leader.seasonStat
          const statType =
            leader.stat === 'homeRuns'
              ? 'Home Runs'
              : leader.stat === 'battingAverage'
                ? 'Batting Avg'
                : 'Strikeouts'

          return {
            name: `${player.firstName} ${player.lastName}`,
            statType,
            value:
              leader.stat === 'battingAverage'
                ? (parseFloat(stat[leader.stat]) || 0).toFixed(3)
                : stat[leader.stat] || 0,
          }
        })
      }

      setData({
        record: record || 'Spring Training',
        nextGame,
        lastResult,
        standings: standingsList,
        players: playersList,
      })
    } catch (err) {
      setError('Failed to fetch Dodgers data. Using cached data.')
      console.error('Dodgers fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDodgersData()
  }, [])

  return {
    data,
    loading,
    error,
    refresh: fetchDodgersData,
  }
}
