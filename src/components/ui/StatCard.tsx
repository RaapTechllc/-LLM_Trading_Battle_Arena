'use client'

interface StatCardProps {
    label: string
    value: string | number
    change?: string
    isUp?: boolean
    accentColor?: string
}

export function StatCard({ label, value, change, isUp, accentColor = 'var(--neon-neutral)' }: StatCardProps) {
    return (
        <div className="stat-card" style={{ '--accent-color': accentColor } as any}>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
            {change && (
                <div className={`stat-change ${isUp ? 'up' : 'down'}`}>
                    {isUp ? '▲' : '▼'} {change}
                </div>
            )}
        </div>
    )
}
