interface ProgressBarProps {
  percent: number
  height?: string
}

export default function ProgressBar({ percent, height = 'h-1.5' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent))
  const color = percent >= 100 ? 'bg-loss' : percent >= 80 ? 'bg-signal' : 'bg-gain'
  return (
    <div className={`w-full ${height} rounded-full bg-white/[0.06] overflow-hidden`}>
      <div
        className={`h-full rounded-full ${color} transition-[width] duration-300`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
