import { useState } from 'react'
import TeamSection from './components/TeamSection'
import NextGame from './components/NextGame'
import LastResult from './components/LastResult'
import Standings from './components/Standings'
import PlayerStats from './components/PlayerStats'
import LoadingSkeleton from './components/LoadingSkeleton'
import { useDodgers } from './hooks/useDodgers'
import { useDevils } from './hooks/useDevils'

// Mock data for Dodgers (will be replaced by live API)
const dodgersMockData = {
  record: 'Spring Training',
  nextGame: {
    opponent: 'San Francisco Giants',
    date: '2026-02-28',
    time: '1:05 PM PT',
    isHome: true,
  },
  lastResult: {
    opponent: 'Arizona Diamondbacks',
    score: 'L 3-5',
    outcome: 'L',
    date: '2026-02-22',
  },
  standings: [
    { id: 1, name: 'LA Dodgers', wins: 0, losses: 0, points: 0 },
    { id: 2, name: 'San Diego Padres', wins: 0, losses: 0, points: 0 },
    { id: 3, name: 'San Francisco Giants', wins: 0, losses: 0, points: 0 },
    { id: 4, name: 'Colorado Rockies', wins: 0, losses: 0, points: 0 },
    { id: 5, name: 'Arizona Diamondbacks', wins: 0, losses: 0, points: 0 },
  ],
  players: [
    { name: 'Shohei Ohtani', statType: 'Home Runs', value: '2' },
    { name: 'Freddie Freeman', statType: 'Batting Avg', value: '.310' },
    { name: 'Mookie Betts', statType: 'RBIs', value: '8' },
  ],
}

// Mock data for Devils
const devilsMockData = {
  record: '25 W - 18 L (50 PTS)',
  nextGame: {
    opponent: 'New York Rangers',
    date: '2026-02-25',
    time: '7:00 PM ET',
    isHome: false,
  },
  lastResult: {
    opponent: 'Boston Bruins',
    score: 'W 4-2',
    outcome: 'W',
    date: '2026-02-23',
  },
  standings: [
    { id: 1, name: 'New York Rangers', wins: 28, losses: 15, points: 62 },
    { id: 2, name: 'Washington Capitals', wins: 26, losses: 17, points: 58 },
    { id: 3, name: 'NJ Devils', wins: 25, losses: 18, points: 50 },
    { id: 4, name: 'Pittsburgh Penguins', wins: 24, losses: 20, points: 48 },
    { id: 5, name: 'Philadelphia Flyers', wins: 22, losses: 21, points: 46 },
  ],
  players: [
    { name: 'Jack Hughes', statType: 'Points', value: '58' },
    { name: 'Nico Hischier', statType: 'Goals', value: '24' },
    { name: 'Jesper Bratt', statType: 'Assists', value: '32' },
  ],
}

// Mock data for Sirens
const sirensMockData = {
  record: '14 W - 10 L - 3 OTL (45 PTS)',
  nextGame: {
    opponent: 'Boston Fleet',
    date: '2026-02-26',
    time: '7:00 PM ET',
    isHome: true,
  },
  lastResult: {
    opponent: 'Toronto Sceptres',
    score: 'W 3-1',
    outcome: 'W',
    date: '2026-02-23',
  },
  standings: [
    { id: 1, name: 'Boston Fleet', wins: 16, losses: 8, points: 46 },
    { id: 2, name: 'Minnesota Frost', wins: 15, losses: 9, points: 44 },
    { id: 3, name: 'New York Sirens', wins: 14, losses: 10, points: 45 },
    { id: 4, name: 'Toronto Sceptres', wins: 13, losses: 11, points: 41 },
    { id: 5, name: 'Montreal Victoire', wins: 12, losses: 12, points: 38 },
    { id: 6, name: 'Ottawa Charge', wins: 11, losses: 13, points: 35 },
    { id: 7, name: 'Seattle Torrent', wins: 10, losses: 14, points: 32 },
    { id: 8, name: 'Vancouver Goldeneyes', wins: 9, losses: 15, points: 30 },
  ],
  players: [
    { name: 'Hilary Knight', statType: 'Goals', value: '18' },
    { name: 'Amanda Kessel', statType: 'Assists', value: '22' },
    { name: 'Alex Carpenter', statType: 'Points', value: '35' },
  ],
}

export default function App() {
  const [refreshing, setRefreshing] = useState(false)
  const dodgersHook = useDodgers()
  const devilsHook = useDevils()

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([dodgersHook.refresh(), devilsHook.refresh()])
    setRefreshing(false)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">On The Board</h1>
            <p className="text-sm text-gray-600 mt-1">
              <time dateTime={new Date().toISOString()}>
                Last updated: {new Date().toLocaleString()}
              </time>
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label={refreshing ? 'Refreshing...' : 'Refresh all team data'}
            aria-disabled={refreshing}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Dodgers */}
          <TeamSection
            teamName="LA Dodgers"
            league="MLB"
            division="NL West"
            record={dodgersHook.data.record}
            colorPrimary="var(--dodgers-primary)"
            colorAccent="var(--dodgers-accent)"
            loading={dodgersHook.loading || refreshing}
            error={dodgersHook.error}
          >
            {dodgersHook.loading || refreshing ? (
              <LoadingSkeleton teamName="Dodgers" />
            ) : (
              <>
                <NextGame
                  {...dodgersHook.data.nextGame}
                  colorAccent="var(--dodgers-accent)"
                />
                <LastResult
                  {...dodgersHook.data.lastResult}
                  colorAccent="var(--dodgers-accent)"
                />
                <Standings
                  division="NL West"
                  standings={dodgersHook.data.standings}
                  currentTeamId={119}
                  colorPrimary="var(--dodgers-primary)"
                  colorAccent="var(--dodgers-accent)"
                />
                <PlayerStats
                  players={dodgersHook.data.players}
                  colorAccent="var(--dodgers-accent)"
                />
              </>
            )}
          </TeamSection>

          {/* Devils */}
          <TeamSection
            teamName="NJ Devils"
            league="NHL"
            division="Metropolitan"
            record={devilsHook.data.record}
            colorPrimary="var(--devils-primary)"
            colorAccent="var(--devils-primary)"
            loading={devilsHook.loading || refreshing}
            error={devilsHook.error}
          >
            {devilsHook.loading || refreshing ? (
              <LoadingSkeleton teamName="Devils" />
            ) : (
              <>
                <NextGame
                  {...devilsHook.data.nextGame}
                  colorAccent="var(--devils-primary)"
                />
                <LastResult
                  {...devilsHook.data.lastResult}
                  colorAccent="var(--devils-primary)"
                />
                <Standings
                  division="Metropolitan"
                  standings={devilsHook.data.standings}
                  currentTeamId={1}
                  colorPrimary="var(--devils-primary)"
                  colorAccent="var(--devils-primary)"
                />
                <PlayerStats
                  players={devilsHook.data.players}
                  colorAccent="var(--devils-primary)"
                />
              </>
            )}
          </TeamSection>

          {/* Sirens */}
          <TeamSection
            teamName="NY Sirens"
            league="PWHL"
            division="Elite"
            record={sirensMockData.record}
            colorPrimary="var(--sirens-primary)"
            colorAccent="var(--sirens-accent)"
            loading={false}
          >
            {false ? (
              <LoadingSkeleton teamName="Sirens" />
            ) : (
              <>
                <NextGame
                  {...sirensMockData.nextGame}
                  colorAccent="var(--sirens-accent)"
                />
                <LastResult
                  {...sirensMockData.lastResult}
                  colorAccent="var(--sirens-accent)"
                />
                <Standings
                  division="PWHL"
                  standings={sirensMockData.standings}
                  currentTeamId={3}
                  colorPrimary="var(--sirens-primary)"
                  colorAccent="var(--sirens-accent)"
                />
                <PlayerStats
                  players={sirensMockData.players}
                  colorAccent="var(--sirens-accent)"
                />
              </>
            )}
          </TeamSection>
        </div>
      </div>
    </main>
  )
}
