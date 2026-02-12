"use client"

import { useEffect, useState } from "react"

interface Balance {
  cashBalance: number
  equityValue: number
  buyingPower: number
  totalPnl: number
  updatedAt: string
}

export default function AccountPage() {
  const [balance, setBalance] = useState<Balance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/account/balance")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch balance")
        return res.json()
      })
      .then((data) => {
        setBalance(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Account Balance</h1>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Account Balance</h1>
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
            <p className="text-red-400">Error: {error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!balance) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Account Balance</h1>
          <p>No balance data found</p>
        </div>
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  const formatPnl = (value: number) => {
    const formatted = formatCurrency(Math.abs(value))
    return value >= 0 ? `+${formatted}` : `-${formatted}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Account Balance</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cash Balance */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Cash Balance</p>
            <p className="text-3xl font-bold">{formatCurrency(balance.cashBalance)}</p>
          </div>

          {/* Equity Value */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Equity Value</p>
            <p className="text-3xl font-bold">{formatCurrency(balance.equityValue)}</p>
          </div>

          {/* Buying Power */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Buying Power</p>
            <p className="text-3xl font-bold">{formatCurrency(balance.buyingPower)}</p>
          </div>

          {/* Total P&L */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Total P&L</p>
            <p className={`text-3xl font-bold ${
              balance.totalPnl >= 0 ? "text-green-400" : "text-red-400"
            }`}>
              {formatPnl(balance.totalPnl)}
            </p>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-400">
          Last updated: {new Date(balance.updatedAt).toLocaleString()}
        </div>

        <div className="mt-8 bg-blue-900/20 border border-blue-500 rounded-lg p-4">
          <p className="text-blue-400 text-sm">
            ℹ️ This is a paper trading account. You started with $10,000 virtual capital.
          </p>
        </div>
      </div>
    </div>
  )
}
