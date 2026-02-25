import { useState, useEffect } from 'react'
import { fmtDate, fmtTime } from '../utils/dateHelpers'

const API_BASE = '/api/pwhl'
const SEASON_ID = 8
const TEAM_ID = 5
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
      const results = await Promise.allSettled([
        fetch(
          `${API_BASE}?feed=modulekit&view=schedule&season_id=${SEASON_ID}&key=${KEY}&client_code=${CLIENT}`
        ).then(r => r.json()),
        fetch(
          `${API_BASE}?feed=modulekit&view=standings&season_id=${SEASON_ID}&key=${KEY}&client_code=${CLIENT}`
        ).then(r => r.json()),
        fetch(
          `${API_BASE}?feed=modulekit&view=players&season_id=${SEASON_ID}&team_id=${TEAM_ID}&key=${KEY}&client_code=${CLIENT}`
        ).then(r => r.json()),
      ])

      const [scheduleResult, standingsResult, playersResult] = results

      const scheduleData = scheduleResult.status === 'fulfilled' ? scheduleResult.value : null
      const standingsData = standingsResult.status === 'fulfilled' ? standingsResult.value : null
      const playersData = playersResult.status === 'fulfilled' ? playersResult.value : null

      // Parse schedule (next game and last result)
      let nextGame = { opponent: null, date: null, time: null, isHome: null }
      let lastResult = { opponent: null, score: null, outcome: null, date: null }
      let record = 'Loading...'

      if (scheduleData?.SiteKit?.Schedule) {
        const today = new Date().toISOString().split('T')[0]
        const games = scheduleData.SiteKit.Schedule

        const futureGames = games.filter(g => g.game_date >= today && g.game_status !== '3')
        const pastGames = games
          .filter(g => (g.game_date < today || (g.game_date === today && g.game_status === '3')))
          .reverse()

        // Next game
        if (futureGames.length > 0) {
          const game = futureGames[0]
          const isHome = game.home_team_id === TEAM_ID.toString()
          const opponent = isHome ? game.away_team_name : game.home_team_name
          const timeStr = game.game_time || '7:00 PM'

          nextGame = {
            opponent,
            date: fmtDate(game.game_date),
            time: fmtTime(timeStr, 'ET'),
            isHome,
          }
        }

        // Last result
        if (pastGames.length > 0) {
          const game = pastGames[0]
          const isHome = game.home_team_id === TEAM_ID.toString()
          const opponent = isHome ? game.away_team_name : game.home_team_name
          const sirensScore = isHome ? parseInt(game.home_team_score) : parseInt(game.away_team_score)
          const opponentScore = isHome ? parseInt(game.away_team_score) : parseInt(game.home_team_score)

          let outcome = 'L'
          if (sirensScore > opponentScore) {
            outcome = 'W'
          } else if (sirensScore < opponentScore) {
            // Check for OT/SO loss (game_status 4 = OT/SO loss)
            if (game.game_status === '4') {
              outcome = 'OTL'
            } else {
              outcome = 'L'
            }
          }

          lastResult = {
            opponent,
            score: `${outcome} ${sirensScore}-${opponentScore}`,
            outcome,
            date: fmtDate(game.game_date),
          }
        }
      }

      // Parse standings
      let standingsList = []
      if (standingsData?.SiteKit?.Standings) {
        const teams = standingsData.SiteKit.Standings

        standingsList = teams.map(team => ({
          id: team.team_id,
          name: team.team_name,
          wins: parseInt(team.wins) || 0,
          losses: parseInt(team.losses) || 0,
          points: parseInt(team.points) || 0,
        }))

        // Get Sirens record from standings
        const sirensStanding = teams.find(t => t.team_id === TEAM_ID.toString())
        if (sirensStanding) {
          const otls = parseInt(sirensStanding.overtimes) || 0
          record = `${sirensStanding.wins}W - ${sirensStanding.losses}L - ${otls} OTL (${sirensStanding.points} PTS)`
        }
      }

      // Parse players - get top 3 by points
      let playersList = []
      if (playersData?.SiteKit?.Players) {
        const topPlayers = playersData.SiteKit.Players
          .filter(p => p.position !== 'G') // Exclude goalies
          .sort((a, b) => (parseInt(b.points) || 0) - (parseInt(a.points) || 0))
          .slice(0, 3)

        playersList = topPlayers.map(player => ({
          name: `${player.first_name} ${player.last_name}`.trim(),
          statType: 'Points',
          value: parseInt(player.points) || 0,
        }))
      }

      setData({
        record: record || 'Regular Season',
        nextGame,
        lastResult,
        standings: standingsList,
        players: playersList,
      })
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
