# Dashboard MongoDB Schemas

This document outlines the MongoDB collections and schemas needed to support the dashboard functionality.

## Collections Overview

1. **users** - User profiles and account information
2. **games** - Individual game records and match history
3. **achievements** - Achievement definitions and user unlocks
4. **leaderboard** - Cached leaderboard data for performance

---

## 1. Users Collection

Stores user profile data, statistics, and ranking information.

```typescript
interface User {
  _id: ObjectId
  
  // Authentication
  email: string              // Unique, indexed
  password: string           // Hashed with bcrypt
  name: string               // Display name
  username: string           // Unique username, indexed
  avatar?: string            // URL to avatar image
  
  // OAuth (optional)
  googleId?: string
  githubId?: string
  
  // Profile Stats
  stats: {
    gamesPlayed: number      // Total games played
    wins: number             // Total victories
    losses: number           // Total losses
    winRate: number          // Calculated win percentage
    currentStreak: number    // Current win streak
    longestStreak: number    // Longest win streak ever
    totalVibes: number       // Total vibes earned
    rank: string             // Current rank tier (e.g., "Diamond II")
    rankProgress: number     // Progress to next rank (0-100)
  }
  
  // Achievements
  unlockedAchievements: ObjectId[]  // References to achievements
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  lastLoginAt: Date
}
```

### Indexes
```javascript
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ username: 1 }, { unique: true })
db.users.createIndex({ "stats.totalVibes": -1 })  // For leaderboard
db.users.createIndex({ googleId: 1 }, { sparse: true })
db.users.createIndex({ githubId: 1 }, { sparse: true })
```

---

## 2. Games Collection

Stores individual game records and match history.

```typescript
interface Game {
  _id: ObjectId
  
  // Players
  player1: {
    userId: ObjectId         // Reference to users collection
    username: string
    vibesEarned: number
    codeSnippets: number     // Number of code snippets created
    votesReceived: number    // Votes from opponent
    result: "win" | "loss" | "draw"
  }
  
  player2: {
    userId: ObjectId
    username: string
    vibesEarned: number
    codeSnippets: number
    votesReceived: number
    result: "win" | "loss" | "draw"
  }
  
  // Game Details
  status: "waiting" | "active" | "completed" | "abandoned"
  duration: number           // Duration in seconds
  startedAt: Date
  completedAt?: Date
  
  // Challenge/Round Data
  rounds: Array<{
    roundNumber: number
    prompt: string
    player1Code: string
    player2Code: string
    player1Votes: number
    player2Votes: number
    winner: ObjectId | null
  }>
  
  // Metadata
  gameMode: "ranked" | "casual" | "tournament"
  createdAt: Date
  updatedAt: Date
}
```

### Indexes
```javascript
db.games.createIndex({ "player1.userId": 1, completedAt: -1 })
db.games.createIndex({ "player2.userId": 1, completedAt: -1 })
db.games.createIndex({ status: 1, createdAt: -1 })
db.games.createIndex({ completedAt: -1 })
```

---

## 3. Achievements Collection

Defines available achievements and tracks user unlocks.

```typescript
interface Achievement {
  _id: ObjectId
  
  // Achievement Details
  name: string               // Achievement name (e.g., "First Win")
  description: string        // Description of how to unlock
  icon: string              // Emoji or icon identifier
  category: "wins" | "streaks" | "participation" | "special"
  
  // Unlock Criteria
  criteria: {
    type: "wins" | "games_played" | "streak" | "vibes" | "custom"
    threshold: number        // Number needed to unlock (e.g., 5 for "5 win streak")
  }
  
  // Metadata
  rarity: "common" | "rare" | "epic" | "legendary"
  points: number            // Points awarded for unlocking
  createdAt: Date
}
```

### User Achievements (Subdocument or Separate Collection)

Option A: Embedded in User document (shown above)

Option B: Separate collection for better querying:

```typescript
interface UserAchievement {
  _id: ObjectId
  userId: ObjectId          // Reference to users collection
  achievementId: ObjectId   // Reference to achievements collection
  unlockedAt: Date
  progress?: number         // For achievements with progress tracking
}
```

### Indexes
```javascript
// If using separate UserAchievement collection:
db.userAchievements.createIndex({ userId: 1, achievementId: 1 }, { unique: true })
db.userAchievements.createIndex({ userId: 1, unlockedAt: -1 })
```

---

## 4. Leaderboard Collection (Optional Cache)

For performance, cache leaderboard data instead of computing it every time.

```typescript
interface LeaderboardEntry {
  _id: ObjectId
  
  // User Reference
  userId: ObjectId
  username: string
  avatar?: string
  
  // Stats
  rank: number              // Current rank position
  totalVibes: number
  gamesPlayed: number
  wins: number
  winRate: number
  
  // Metadata
  tier: string              // Rank tier
  lastUpdated: Date
}
```

### Indexes
```javascript
db.leaderboard.createIndex({ rank: 1 })
db.leaderboard.createIndex({ totalVibes: -1 })
db.leaderboard.createIndex({ userId: 1 }, { unique: true })
```

### Update Strategy
- Recalculate after each game completion
- Or run a scheduled job (e.g., every 5 minutes) to update rankings

---

## Aggregation Queries

### Get User Dashboard Data
```javascript
db.users.aggregate([
  { $match: { _id: ObjectId("USER_ID") } },
  {
    $lookup: {
      from: "games",
      let: { userId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $or: [
                { $eq: ["$player1.userId", "$$userId"] },
                { $eq: ["$player2.userId", "$$userId"] }
              ]
            },
            status: "completed"
          }
        },
        { $sort: { completedAt: -1 } },
        { $limit: 5 }
      ],
      as: "recentGames"
    }
  },
  {
    $lookup: {
      from: "achievements",
      localField: "unlockedAchievements",
      foreignField: "_id",
      as: "achievements"
    }
  }
])
```

### Get Leaderboard
```javascript
db.users.aggregate([
  { $match: { "stats.gamesPlayed": { $gte: 10 } } },  // Min games requirement
  {
    $project: {
      username: 1,
      totalVibes: "$stats.totalVibes",
      winRate: "$stats.winRate",
      rank: "$stats.rank"
    }
  },
  { $sort: { totalVibes: -1 } },
  { $limit: 100 },
  {
    $group: {
      _id: null,
      players: { $push: "$$ROOT" }
    }
  },
  {
    $unwind: { path: "$players", includeArrayIndex: "rank" }
  },
  {
    $project: {
      _id: "$players._id",
      username: "$players.username",
      totalVibes: "$players.totalVibes",
      winRate: "$players.winRate",
      tier: "$players.rank",
      rank: { $add: ["$rank", 1] }
    }
  }
])
```

### Calculate Win Streak
```javascript
// Update user's current streak after each game
db.games.aggregate([
  {
    $match: {
      $or: [
        { "player1.userId": ObjectId("USER_ID") },
        { "player2.userId": ObjectId("USER_ID") }
      ],
      status: "completed"
    }
  },
  { $sort: { completedAt: -1 } },
  {
    $project: {
      result: {
        $cond: [
          { $eq: ["$player1.userId", ObjectId("USER_ID")] },
          "$player1.result",
          "$player2.result"
        ]
      }
    }
  }
  // Then process in application code to count consecutive wins
])
```

---

## Backend API Endpoints Needed

### Dashboard Data
- `GET /api/dashboard` - Get complete dashboard data
- `GET /api/user/:id/stats` - Get user statistics
- `GET /api/user/:id/games` - Get user's game history
- `GET /api/user/:id/achievements` - Get user's achievements

### Leaderboard
- `GET /api/leaderboard` - Get global leaderboard
- `GET /api/leaderboard/friends` - Get friends leaderboard

### Updates
- `POST /api/games/:id/complete` - Update stats after game completion
- `POST /api/achievements/:id/unlock` - Unlock an achievement

---

## Sample Data Initialization

```javascript
// Sample achievements to insert
const achievements = [
  {
    name: "First Win",
    description: "Win your first game",
    icon: "🏆",
    category: "wins",
    criteria: { type: "wins", threshold: 1 },
    rarity: "common",
    points: 10
  },
  {
    name: "Win Streak 5",
    description: "Win 5 games in a row",
    icon: "🔥",
    category: "streaks",
    criteria: { type: "streak", threshold: 5 },
    rarity: "rare",
    points: 50
  },
  {
    name: "Vibe Master",
    description: "Earn 10,000 total vibes",
    icon: "⚡",
    category: "participation",
    criteria: { type: "vibes", threshold: 10000 },
    rarity: "epic",
    points: 100
  },
  {
    name: "Win Streak 10",
    description: "Win 10 games in a row",
    icon: "💎",
    category: "streaks",
    criteria: { type: "streak", threshold: 10 },
    rarity: "epic",
    points: 150
  },
  {
    name: "100 Games",
    description: "Play 100 games",
    icon: "🎯",
    category: "participation",
    criteria: { type: "games_played", threshold: 100 },
    rarity: "rare",
    points: 75
  },
  {
    name: "Undefeated",
    description: "Win 20 games in a row",
    icon: "👑",
    category: "streaks",
    criteria: { type: "streak", threshold: 20 },
    rarity: "legendary",
    points: 500
  }
]

db.achievements.insertMany(achievements)
```

---

## Performance Considerations

1. **Indexing**: Create appropriate indexes on frequently queried fields
2. **Caching**: Use Redis for frequently accessed data (leaderboards, user stats)
3. **Denormalization**: Store username in game records to avoid lookups
4. **Aggregation Pipeline**: Use MongoDB aggregation for complex queries
5. **Pagination**: Implement pagination for game history and leaderboards
6. **Background Jobs**: Update leaderboard rankings in background tasks

---

## Security Considerations

1. **Authentication**: Verify user owns the data they're accessing
2. **Rate Limiting**: Limit dashboard API calls per user
3. **Data Validation**: Validate all input data on the server
4. **Sensitive Data**: Never expose passwords or sensitive data in API responses
5. **Permissions**: Ensure users can only update their own data

---

## Next Steps for Implementation

1. Create MongoDB collections with proper schemas
2. Set up indexes for optimal query performance
3. Implement backend API routes
4. Connect frontend to real API endpoints
5. Add real-time updates using WebSockets (optional)
6. Implement caching strategy
7. Add error handling and loading states
8. Test with production-scale data

