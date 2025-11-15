"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Trophy, 
  Zap, 
  Target, 
  TrendingUp, 
  Clock, 
  Code2,
  Flame,
  Award,
  ChevronRight,
  LogOut,
  Settings,
  User
} from "lucide-react"

// Mock user data - will be fetched from MongoDB
const mockUser = {
  name: "CodeWarrior",
  email: "warrior@example.com",
  avatar: null,
  stats: {
    gamesPlayed: 42,
    wins: 28,
    losses: 14,
    winRate: 66.7,
    currentStreak: 5,
    longestStreak: 12,
    totalVibes: 15420,
    rank: "Diamond II",
    rankProgress: 67
  },
  recentGames: [
    { id: "1", opponent: "VibeKing", result: "win", vibes: 850, date: "2 hours ago", duration: "12:34" },
    { id: "2", opponent: "CodeNinja", result: "win", vibes: 920, date: "5 hours ago", duration: "15:22" },
    { id: "3", opponent: "HackerPro", result: "loss", vibes: 680, date: "1 day ago", duration: "18:45" },
    { id: "4", opponent: "DevMaster", result: "win", vibes: 1050, date: "1 day ago", duration: "11:20" },
    { id: "5", opponent: "ByteBlaster", result: "win", vibes: 890, date: "2 days ago", duration: "14:10" }
  ],
  achievements: [
    { id: "1", name: "First Win", icon: "🏆", unlocked: true, date: "Jan 10" },
    { id: "2", name: "Win Streak 5", icon: "🔥", unlocked: true, date: "Jan 14" },
    { id: "3", name: "Vibe Master", icon: "⚡", unlocked: true, date: "Jan 12" },
    { id: "4", name: "Win Streak 10", icon: "💎", unlocked: false, date: null },
    { id: "5", name: "100 Games", icon: "🎯", unlocked: false, date: null },
    { id: "6", name: "Undefeated", icon: "👑", unlocked: false, date: null }
  ]
}

const leaderboard = [
  { rank: 1, username: "VibeGod", vibes: 25890, winRate: 89 },
  { rank: 2, username: "CodeLegend", vibes: 23450, winRate: 85 },
  { rank: 3, username: "HackerElite", vibes: 21200, winRate: 82 },
  { rank: 4, username: "ByteWizard", vibes: 19800, winRate: 80 },
  { rank: 5, username: "DevKing", vibes: 18500, winRate: 78 },
  { rank: 8, username: "CodeWarrior", vibes: 15420, winRate: 66.7, isCurrentUser: true }
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "games" | "achievements">("overview")

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/20 bg-black/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="font-mono text-xl font-bold tracking-widest italic transform -skew-x-12">
                CODEJAM25
              </div>
              <ChevronRight className="w-4 h-4 opacity-60" />
              <span className="text-sm font-mono text-white/60 group-hover:text-white/90 transition-colors">
                DASHBOARD
              </span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10">
                <Settings className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* User Profile Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full border-2 border-white/30 flex items-center justify-center bg-white/5">
                <User className="w-8 h-8 lg:w-10 lg:h-10 text-white/60" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold font-mono tracking-wider mb-1">
                  {mockUser.name}
                </h1>
                <p className="text-sm text-white/60 font-mono">{mockUser.email}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs font-mono px-2 py-1 bg-white/10 border border-white/30 rounded">
                    {mockUser.stats.rank}
                  </span>
                  <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white transition-all duration-300"
                      style={{ width: `${mockUser.stats.rankProgress}%` }}
                    />
                  </div>
                  <span className="text-xs text-white/60 font-mono">{mockUser.stats.rankProgress}%</span>
                </div>
              </div>
            </div>
            
            <Link href="/game/waiting">
              <Button className="bg-white text-black hover:bg-white/90 font-mono">
                <Zap className="w-4 h-4 mr-2" />
                FIND GAME
              </Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white/5 border-white/20 hover:bg-white/10 transition-all duration-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Trophy className="w-5 h-5 text-white/60" />
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-3xl font-bold font-mono mb-1">{mockUser.stats.wins}</div>
                <div className="text-xs text-white/60 font-mono">VICTORIES</div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/20 hover:bg-white/10 transition-all duration-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Target className="w-5 h-5 text-white/60" />
                  <span className="text-xs text-white/60 font-mono">{mockUser.stats.winRate}%</span>
                </div>
                <div className="text-3xl font-bold font-mono mb-1">{mockUser.stats.gamesPlayed}</div>
                <div className="text-xs text-white/60 font-mono">GAMES PLAYED</div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/20 hover:bg-white/10 transition-all duration-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Flame className="w-5 h-5 text-orange-400" />
                  <span className="text-xs text-orange-400 font-mono">ACTIVE</span>
                </div>
                <div className="text-3xl font-bold font-mono mb-1">{mockUser.stats.currentStreak}</div>
                <div className="text-xs text-white/60 font-mono">WIN STREAK</div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/20 hover:bg-white/10 transition-all duration-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Zap className="w-5 h-5 text-blue-400" />
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-3xl font-bold font-mono mb-1">{mockUser.stats.totalVibes.toLocaleString()}</div>
                <div className="text-xs text-white/60 font-mono">TOTAL VIBES</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-4 mb-6 border-b border-white/20 pb-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={`font-mono text-sm px-4 py-2 transition-all duration-200 ${
              activeTab === "overview" 
                ? "text-white border-b-2 border-white" 
                : "text-white/60 hover:text-white"
            }`}
          >
            OVERVIEW
          </button>
          <button
            onClick={() => setActiveTab("games")}
            className={`font-mono text-sm px-4 py-2 transition-all duration-200 ${
              activeTab === "games" 
                ? "text-white border-b-2 border-white" 
                : "text-white/60 hover:text-white"
            }`}
          >
            MATCH HISTORY
          </button>
          <button
            onClick={() => setActiveTab("achievements")}
            className={`font-mono text-sm px-4 py-2 transition-all duration-200 ${
              activeTab === "achievements" 
                ? "text-white border-b-2 border-white" 
                : "text-white/60 hover:text-white"
            }`}
          >
            ACHIEVEMENTS
          </button>
        </div>

        {/* Content Area */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === "overview" && (
              <>
                {/* Recent Games */}
                <Card className="bg-white/5 border-white/20">
                  <CardHeader>
                    <CardTitle className="font-mono flex items-center gap-2">
                      <Code2 className="w-5 h-5" />
                      RECENT MATCHES
                    </CardTitle>
                    <CardDescription className="font-mono">Your last 5 games</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockUser.recentGames.map((game) => (
                        <div
                          key={game.id}
                          className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded hover:bg-white/10 transition-all duration-200"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-2 h-2 rounded-full ${
                              game.result === "win" ? "bg-green-400" : "bg-red-400"
                            }`} />
                            <div>
                              <div className="font-mono text-sm font-semibold">vs {game.opponent}</div>
                              <div className="text-xs text-white/60 font-mono">{game.date}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-sm font-mono">{game.vibes} vibes</div>
                              <div className="text-xs text-white/60 font-mono flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {game.duration}
                              </div>
                            </div>
                            <div className={`px-3 py-1 rounded text-xs font-mono font-semibold ${
                              game.result === "win" 
                                ? "bg-green-400/20 text-green-400 border border-green-400/30" 
                                : "bg-red-400/20 text-red-400 border border-red-400/30"
                            }`}>
                              {game.result.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === "games" && (
              <Card className="bg-white/5 border-white/20">
                <CardHeader>
                  <CardTitle className="font-mono">FULL MATCH HISTORY</CardTitle>
                  <CardDescription className="font-mono">All your competitive games</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mockUser.recentGames.map((game) => (
                      <div
                        key={game.id}
                        className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded hover:bg-white/10 transition-all duration-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${
                            game.result === "win" ? "bg-green-400" : "bg-red-400"
                          }`} />
                          <div>
                            <div className="font-mono font-semibold">vs {game.opponent}</div>
                            <div className="text-sm text-white/60 font-mono">{game.date}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-sm font-mono">{game.vibes} vibes</div>
                          <div className="text-sm text-white/60 font-mono">{game.duration}</div>
                          <div className={`px-4 py-1 rounded text-sm font-mono font-semibold ${
                            game.result === "win" 
                              ? "bg-green-400/20 text-green-400" 
                              : "bg-red-400/20 text-red-400"
                          }`}>
                            {game.result.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "achievements" && (
              <Card className="bg-white/5 border-white/20">
                <CardHeader>
                  <CardTitle className="font-mono flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    YOUR ACHIEVEMENTS
                  </CardTitle>
                  <CardDescription className="font-mono">
                    {mockUser.achievements.filter(a => a.unlocked).length} of {mockUser.achievements.length} unlocked
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {mockUser.achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`p-4 rounded border text-center transition-all duration-200 ${
                          achievement.unlocked
                            ? "bg-white/10 border-white/30 hover:bg-white/20"
                            : "bg-white/5 border-white/10 opacity-50"
                        }`}
                      >
                        <div className="text-4xl mb-2">{achievement.icon}</div>
                        <div className="font-mono text-sm font-semibold mb-1">{achievement.name}</div>
                        {achievement.unlocked && achievement.date && (
                          <div className="text-xs text-white/60 font-mono">{achievement.date}</div>
                        )}
                        {!achievement.unlocked && (
                          <div className="text-xs text-white/40 font-mono">LOCKED</div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Leaderboard */}
            <Card className="bg-white/5 border-white/20">
              <CardHeader>
                <CardTitle className="font-mono flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  LEADERBOARD
                </CardTitle>
                <CardDescription className="font-mono">Top players worldwide</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {leaderboard.map((player) => (
                    <div
                      key={player.rank}
                      className={`flex items-center justify-between p-3 rounded transition-all duration-200 ${
                        player.isCurrentUser
                          ? "bg-white/20 border border-white/40"
                          : "bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm font-bold ${
                          player.rank === 1 ? "bg-yellow-400/20 text-yellow-400" :
                          player.rank === 2 ? "bg-gray-400/20 text-gray-400" :
                          player.rank === 3 ? "bg-orange-400/20 text-orange-400" :
                          "bg-white/10 text-white/60"
                        }`}>
                          #{player.rank}
                        </div>
                        <div>
                          <div className={`font-mono text-sm ${player.isCurrentUser ? "font-bold" : ""}`}>
                            {player.username}
                          </div>
                          <div className="text-xs text-white/60 font-mono">
                            {player.winRate}% WR
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-mono text-white/80">{player.vibes.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white/5 border-white/20">
              <CardHeader>
                <CardTitle className="font-mono text-sm">QUICK STATS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-white/60">Win Rate</span>
                  <span className="text-sm font-mono font-bold">{mockUser.stats.winRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-white/60">Best Streak</span>
                  <span className="text-sm font-mono font-bold">{mockUser.stats.longestStreak} games</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-white/60">Total Games</span>
                  <span className="text-sm font-mono font-bold">{mockUser.stats.gamesPlayed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-white/60">Current Rank</span>
                  <span className="text-sm font-mono font-bold">{mockUser.stats.rank}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

