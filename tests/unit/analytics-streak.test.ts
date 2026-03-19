// Unit tests for analytics streak calculation

describe('Analytics Streak Calculation', () => {
  // Helper to simulate the streak logic from the API
  function calculateStreaks(trades) {
    let currentStreak = 0
    let longestWinStreak = 0
    let streak = 0
    
    // Trades are newest-first, reverse for chronological streak calc
    for (const t of [...trades].reverse()) {
      if (t.pnlPercent > 0) {
        streak++
        longestWinStreak = Math.max(longestWinStreak, streak)
      } else {
        streak = 0
      }
    }
    
    // Current streak from most recent
    for (const t of trades) {
      if (t.pnlPercent > 0) currentStreak++
      else break
    }
    
    return { currentStreak, longestWinStreak }
  }

  test('empty trades returns zero streaks', () => {
    const result = calculateStreaks([])
    expect(result.currentStreak).toBe(0)
    expect(result.longestWinStreak).toBe(0)
  })

  test('all wins returns correct streaks', () => {
    // Newest first: [win, win, win]
    const trades = [{ pnlPercent: 5 }, { pnlPercent: 3 }, { pnlPercent: 2 }]
    const result = calculateStreaks(trades)
    expect(result.currentStreak).toBe(3)
    expect(result.longestWinStreak).toBe(3)
  })

  test('all losses returns zero streaks', () => {
    const trades = [{ pnlPercent: -5 }, { pnlPercent: -3 }, { pnlPercent: -2 }]
    const result = calculateStreaks(trades)
    expect(result.currentStreak).toBe(0)
    expect(result.longestWinStreak).toBe(0)
  })

  test('mixed trades with longest streak in middle', () => {
    // Newest first: [loss, win, win, win, loss, win]
    // Chronological: [win, loss, win, win, win, loss]
    // Longest streak should be 3 (the three wins in the middle)
    const trades = [
      { pnlPercent: -1 },  // newest - loss
      { pnlPercent: 5 },   // win
      { pnlPercent: 3 },   // win
      { pnlPercent: 2 },   // win
      { pnlPercent: -2 },  // loss
      { pnlPercent: 4 },   // oldest - win
    ]
    const result = calculateStreaks(trades)
    expect(result.currentStreak).toBe(0) // Most recent is a loss
    expect(result.longestWinStreak).toBe(3)
  })

  test('current streak counts from most recent', () => {
    // Newest first: [win, win, loss, win, win, win]
    const trades = [
      { pnlPercent: 5 },   // newest - win
      { pnlPercent: 3 },   // win
      { pnlPercent: -1 },  // loss breaks current streak
      { pnlPercent: 2 },   // win
      { pnlPercent: 4 },   // win
      { pnlPercent: 1 },   // oldest - win
    ]
    const result = calculateStreaks(trades)
    expect(result.currentStreak).toBe(2) // Only 2 wins before the loss
    expect(result.longestWinStreak).toBe(3) // 3 wins at the end chronologically
  })

  test('single trade win', () => {
    const trades = [{ pnlPercent: 10 }]
    const result = calculateStreaks(trades)
    expect(result.currentStreak).toBe(1)
    expect(result.longestWinStreak).toBe(1)
  })

  test('single trade loss', () => {
    const trades = [{ pnlPercent: -10 }]
    const result = calculateStreaks(trades)
    expect(result.currentStreak).toBe(0)
    expect(result.longestWinStreak).toBe(0)
  })
})
