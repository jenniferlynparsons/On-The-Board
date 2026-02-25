import { useState, useEffect } from 'react'
import { fmtDate, fmtTime } from '../utils/dateHelpers'

const API_BASE = '/api/pwhl'
const SEASON_ID = 8
const TEAM_ID = '4'  // NY Sirens (not '5' which is Ottawa Charge)
const KEY = '446521baf8c38984'
const CLIENT = 'pwhl'

export function useSirens() {
  const [data, setData] = useState({
    record: '',
    nextGame: { opponent: null, date: null, time: null, isHome: null },
    lastResult: { opponent: null, score: null, outcome: null, date: null },
    standings: [],
    players: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSirensData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch all endpoints in parallel
      // Note: Fetch full schedule (no team_id) for accurate standings, filter Sirens games client-side
      const results = await Promise.allSettled([
        fetch(
          `${API_BASE}?feed=modulekit&view=schedule&season_id=${SEASON_ID}&key=${KEY}&client_code=${CLIENT}`
        ).then(r => r.json()),
        fetch(
          `${API_BASE}?feed=modulekit&view=players&season_id=${SEASON_ID}&team_id=${TEAM_ID}&key=${KEY}&client_code=${CLIENT}`
        ).then(r => r.json()),
      ])

      const [scheduleResult, playersResult] = results

      const scheduleData = scheduleResult.status === 'fulfilled' ? scheduleResult.value : null
      const playersData = playersResult.status === 'fulfilled' ? playersResult.value : null

      // Parse schedule (next game and last result)
      let nextGame = { opponent: null, date: null, time: null, isHome: null }
      let lastResult = { opponent: null, score: null, outcome: null, date: null }
      let record = null

      // Build standings from schedule data
      const standingsMap = new Map()

      if (scheduleData?.SiteKit?.Schedule) {
        // Use local date for comparisons to avoid timezone issues
        const now = new Date()
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
        const games = scheduleData.SiteKit.Schedule

        // Filter games for Sirens to find next/last
        const sirensGames = games.filter(g => g.home_team === TEAM_ID || g.visiting_team === TEAM_ID)
        const futureGames = sirensGames.filter(g => g.date_played >= today && g.game_status !== 'Final')
        const pastGames = sirensGames
          .filter(g => (g.date_played < today || (g.date_played === today && g.game_status === 'Final')))
          .reverse()

        // Next game
        if (futureGames.length > 0) {
          const game = futureGames[0]
          const isHome = game.home_team === TEAM_ID
          const opponent = isHome ? game.visiting_team_name : game.home_team_name
          const timeStr = game.schedule_time || '19:00:00'

          nextGame = {
            opponent,
            date: fmtDate(game.date_played),
            time: fmtTime(timeStr.slice(0, 5), 'ET'),
            isHome,
          }
        }

        // Last result
        if (pastGames.length > 0) {
          const game = pastGames[0]
          const isHome = game.home_team === TEAM_ID
          const opponent = isHome ? game.visiting_team_name : game.home_team_name
          const sirensScore = isHome ? parseInt(game.home_goal_count) : parseInt(game.visiting_goal_count)
          const opponentScore = isHome ? parseInt(game.visiting_goal_count) : parseInt(game.home_goal_count)

          let outcome = 'L'
          if (sirensScore > opponentScore) {
            outcome = 'W'
          } else if (sirensScore < opponentScore) {
            // Check for OT/SO loss (status contains OT or SO)
            if (game.game_status && (game.game_status.includes('OT') || game.game_status.includes('SO'))) {
              outcome = 'OTL'
            } else {
              outcome = 'L'
            }
          }

          lastResult = {
            opponent,
            score: `${outcome} ${sirensScore}-${opponentScore}`,
            outcome,
            date: fmtDate(game.date_played),
          }
        }

        // Build standings from all games
        games.forEach(game => {
          const homeId = game.home_team
          const awayId = game.visiting_team

          if (!standingsMap.has(homeId)) {
            standingsMap.set(homeId, {
              id: homeId,
              name: game.home_team_name,
              wins: 0,
              losses: 0,
              otls: 0,
              points: 0,
            })
          }

          if (!standingsMap.has(awayId)) {
            standingsMap.set(awayId, {
              id: awayId,
              name: game.visiting_team_name,
              wins: 0,
              losses: 0,
              otls: 0,
              points: 0,
            })
          }

          if (game.game_status === 'Final') {
            const homeScore = parseInt(game.home_goal_count)
            const awayScore = parseInt(game.visiting_goal_count)
            const homeTeam = standingsMap.get(homeId)
            const awayTeam = standingsMap.get(awayId)

            if (homeScore > awayScore) {
              // Home win
              homeTeam.wins += 1
              homeTeam.points += 3
              awayTeam.losses += 1
            } else if (awayScore > homeScore) {
              // Away win
              awayTeam.wins += 1
              awayTeam.points += 3
              homeTeam.losses += 1
            }
          }
        })

        const standingsList = Array.from(standingsMap.values()).sort((a, b) => b.points - a.points)

        // Get Sirens record
        const sirensStanding = standingsList.find(t => t.id === TEAM_ID)
        if (sirensStanding) {
          record = `${sirensStanding.wins}W - ${sirensStanding.losses}L (${sirensStanding.points} PTS)`
        }

        setData(prev => ({
          ...prev,
          standings: standingsList,
          record: record || 'Regular Season',
        }))
      }

      // Parse players - get top 3 by points
      let playersList = []
      const playersArray = playersData?.SiteKit?.Players || playersData?.SiteKit?.Skaters
      if (playersArray) {
        const topPlayers = playersArray
          .filter(p => p.position !== 'G') // Exclude goalies
          .sort((a, b) => (parseInt(b.points) || 0) - (parseInt(a.points) || 0))
          .slice(0, 3)

        playersList = topPlayers.map(player => ({
          name: `${player.first_name} ${player.last_name}`.trim(),
          statType: 'Points',
          value: parseInt(player.points) || 0,
        }))
      }

      setData(prev => ({
        ...prev,
        nextGame,
        lastResult,
        players: playersList,
        record: record || 'Regular Season',
      }))
    } catch (err) {
      setError('Failed to fetch Sirens data. Using cached data.')
      console.error('Sirens fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSirensData()
  }, [])

  return {
    data,
    loading,
    error,
    refresh: fetchSirensData,
  }
}
