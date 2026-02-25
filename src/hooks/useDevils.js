import { useState, useEffect } from 'react'
import { fmtDate, fmtTime } from '../utils/dateHelpers'

const BASE_URL = 'https://api-web.nhle.com/v1'
const TEAM_TRICODE = 'NJD'
const DEVILS_ID = 1

export function useDevils() {
  const [data, setData] = useState({
    record: '',
    nextGame: { opponent: null, date: null, time: null, isHome: null },
    lastResult: { opponent: null, score: null, outcome: null, date: null },
    standings: [],
    players: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDevilsData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch all endpoints in parallel
      const results = await Promise.allSettled([
        fetch(`${BASE_URL}/club-schedule-season/${TEAM_TRICODE}/now`).then(r => r.json()),
        fetch(`${BASE_URL}/standings/now`).then(r => r.json()),
        fetch(`${BASE_URL}/club-stats/${TEAM_TRICODE}/now`).then(r => r.json()),
      ])

      const [scheduleResult, standingsResult, statsResult] = results

      const scheduleData = scheduleResult.status === 'fulfilled' ? scheduleResult.value : null
      const standingsData = standingsResult.status === 'fulfilled' ? standingsResult.value : null
      const statsData = statsResult.status === 'fulfilled' ? statsResult.value : null

      // Parse schedule (next game and last result)
      let nextGame = { opponent: null, date: null, time: null, isHome: null }
      let lastResult = { opponent: null, score: null, outcome: null, date: null }
      let record = 'Loading...'

      if (scheduleData?.games) {
        const today = new Date().toISOString().split('T')[0]
        const futureGames = scheduleData.games.filter(g => g.gameDate >= today && g.gameState !== 'FINAL' && g.gameState !== 'OFF')
        const pastGames = scheduleData.games.filter(g => g.gameDate < today || (g.gameDate === today && (g.gameState === 'FINAL' || g.gameState === 'OFF'))).reverse()

        // Next game
        if (futureGames.length > 0) {
          const game = futureGames[0]
          const isHome = game.homeTeam.id === DEVILS_ID
          const opponent = isHome ? game.awayTeam.commonName.default : game.homeTeam.commonName.default
          let timeStr = '19:00'
          if (game.startTime) {
            const parts = game.startTime.split(':')
            timeStr = parts.length >= 2 ? `${parts[0]}:${parts[1]}` : game.startTime
          }
          nextGame = {
            opponent,
            date: fmtDate(game.gameDate),
            time: fmtTime(timeStr, 'ET'),
            isHome,
          }
        }

        // Last result
        if (pastGames.length > 0) {
          const game = pastGames[0]
          const isHome = game.homeTeam.id === DEVILS_ID
          const opponent = isHome ? game.awayTeam.commonName.default : game.homeTeam.commonName.default
          const devilsScore = isHome ? game.homeTeam.score : game.awayTeam.score
          const opponentScore = isHome ? game.awayTeam.score : game.homeTeam.score

          let outcome = 'L'
          if (devilsScore > opponentScore) {
            outcome = 'W'
          } else if (devilsScore < opponentScore) {
            // Check for OT loss
            if (game.periodDescriptor && game.periodDescriptor.periodType === 'OT') {
              outcome = 'OTL'
            } else {
              outcome = 'L'
            }
          }

          lastResult = {
            opponent,
            score: `${outcome} ${devilsScore}-${opponentScore}`,
            outcome,
            date: fmtDate(game.gameDate),
          }
        }
      }

      // Parse standings - filter for Metropolitan division
      let standingsList = []
      if (standingsData?.standings) {
        const metroTeams = standingsData.standings.filter(team => team.divisionName === 'Metropolitan')
        standingsList = metroTeams.map(team => ({
          id: team.teamId,
          name: team.teamCommonName.default,
          wins: team.wins,
          losses: team.losses,
          points: team.points,
        }))

        // Get Devils record from standings
        const devilsStanding = metroTeams.find(t => t.teamId === DEVILS_ID)
        if (devilsStanding) {
          record = `${devilsStanding.wins}W - ${devilsStanding.losses}L (${devilsStanding.points} PTS)`
        }
      }

      // Parse skaters stats - get top 3 by points
      let playersList = []
      if (statsData?.skaters) {
        const topPlayers = statsData.skaters
          .sort((a, b) => (b.points || 0) - (a.points || 0))
          .slice(0, 3)

        playersList = topPlayers.map(player => {
          const firstName = player.firstName?.default || ''
          const lastName = player.lastName?.default || ''
          return {
            name: `${firstName} ${lastName}`.trim(),
            statType: 'Points',
            value: player.points || 0,
          }
        })
      }

      setData({
        record: record || 'Regular Season',
        nextGame,
        lastResult,
        standings: standingsList,
        players: playersList,
      })
    } catch (err) {
      setError('Failed to fetch Devils data. Using cached data.')
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
