'use client'

import { useState, useEffect } from 'react'
import { Database, Hash, Shield, Clock, TrendingUp, Users } from 'lucide-react'

export default function StatsPanel() {
  const [stats, setStats] = useState({
    totalMemories: 0,
    anchoredMemories: 0,
    averageSimilarity: 0,
    verificationRate: 0,
    activeAgents: 0,
    storageUsed: 0,
  })

  useEffect(() => {
    // Mock data for demo
    setStats({
      totalMemories: 127,
      anchoredMemories: 89,
      averageSimilarity: 0.87,
      verificationRate: 94,
      activeAgents: 12,
      storageUsed: 2.4,
    })
  }, [])

  const statCards = [
    {
      icon: Database,
      label: 'Total Memories',
      value: stats.totalMemories,
      color: 'bg-accent/10 text-accent',
      trend: '+12%',
    },
    {
      icon: Hash,
      label: 'Anchored',
      value: stats.anchoredMemories,
      color: 'bg-blue-500/10 text-blue-500',
      trend: '+8%',
    },
    {
      icon: Shield,
      label: 'Verification Rate',
      value: `${stats.verificationRate}%`,
      color: 'bg-green-500/10 text-green-500',
      trend: '+2%',
    },
    {
      icon: Users,
      label: 'Active Agents',
      value: stats.activeAgents,
      color: 'bg-purple-500/10 text-purple-500',
      trend: '+3',
    },
    {
      icon: TrendingUp,
      label: 'Avg. Similarity',
      value: stats.averageSimilarity.toFixed(2),
      color: 'bg-yellow-500/10 text-yellow-500',
      trend: '+0.04',
    },
    {
      icon: Clock,
      label: 'Storage Used',
      value: `${stats.storageUsed} GB`,
      color: 'bg-gray-500/10 text-gray-400',
      trend: '',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statCards.map((stat, index) => (
        <div key={index} className="card hover:border-accent/30">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            {stat.trend && (
              <div className="text-xs font-medium bg-green-500/10 text-green-500 px-2 py-1 rounded">
                {stat.trend}
              </div>
            )}
          </div>
          <div className="text-2xl font-bold mb-1">{stat.value}</div>
          <div className="text-sm text-gray-400">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}