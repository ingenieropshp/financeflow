export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-sm bg-gain/10 text-gain"
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.56}
        height={size * 0.56}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
      >
        <path d="M3 17l6-6 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 7h7v7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

export default function Logo({ size = 32, textSize = 'text-lg' }: { size?: number; textSize?: string }) {
  return (
    <div className="flex items-center gap-2">
      <LogoMark size={size} />
      <span className={`font-display ${textSize} font-extrabold tracking-tight text-paper-100`}>
        FinanceFlow
      </span>
    </div>
  )
}
