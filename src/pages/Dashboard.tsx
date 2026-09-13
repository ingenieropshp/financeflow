import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { useFinance } from '../context/FinanceContext'
import { buildCategoryTree, currentMonthTransactions, formatCurrency, monthlySeries, sumByType } from '../lib/finance'

export default function Dashboard() {
  const { transactions, categories, loading } = useFinance()

  const monthTx = useMemo(() => currentMonthTransactions(transactions), [transactions])
  const ingresos = useMemo(() => sumByType(monthTx, 'income'), [monthTx])
  const gastos = useMemo(() => sumByType(monthTx, 'expense'), [monthTx])
  const saldoNeto = ingresos - gastos
  const tasaAhorro = ingresos > 0 ? Math.max(0, ((ingresos - gastos) / ingresos) * 100) : 0

  const categoryTree = useMemo(() => buildCategoryTree(categories, transactions), [categories, transactions])
  const flatSpendData = useMemo(() => {
    const rows: { name: string; value: number; color: string }[] = []
    const walk = (nodes: typeof categoryTree) => {
      nodes.forEach((n) => {
        if (n.spent > 0) rows.push({ name: n.name, value: n.spent, color: n.color })
        if (n.subcategories.length) walk(n.subcategories)
      })
    }
    walk(categoryTree)
    return rows
  }, [categoryTree])

  const series = useMemo(() => monthlySeries(transactions, 6), [transactions])

  const alerts = useMemo(() => {
    const flat: typeof categoryTree = []
    const walk = (nodes: typeof categoryTree) => nodes.forEach((n) => { flat.push(n); if (n.subcategories.length) walk(n.subcategories) })
    walk(categoryTree)
    return flat.filter((c) => c.monthly_budget > 0 && c.percent >= 80)
  }, [categoryTree])

  if (loading) return <SkeletonDashboard />

  const empty = transactions.length === 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-paper-100">Resumen financiero</h1>
        <p className="text-sm text-paper-500 mt-1">
          {new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(new Date())}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard label="Ingresos del mes" value={formatCurrency(ingresos)} tone="gain" />
        <KpiCard label="Gastos del mes" value={formatCurrency(gastos)} tone="loss" />
        <KpiCard label="Saldo neto disponible" value={formatCurrency(saldoNeto)} tone={saldoNeto >= 0 ? 'gain' : 'loss'} emphasize />
        <KpiCard label="Tasa de ahorro" value={`${tasaAhorro.toFixed(1)}%`} tone="accent" />
      </div>

      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a) => (
            <div
              key={a.id}
              className={`flex items-center justify-between rounded-sm border px-4 py-3 text-sm ${
                a.percent >= 100 ? 'border-loss/30 bg-loss/10 text-loss' : 'border-signal/30 bg-signal/10 text-signal'
              }`}
            >
              <span>
                <strong>{a.name}</strong> {a.percent >= 100 ? 'superó su presupuesto mensual' : 'está por alcanzar su presupuesto mensual'} ({a.percent.toFixed(0)}%)
              </span>
              <span className="num font-semibold">{formatCurrency(a.spent)} / {formatCurrency(a.monthly_budget)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-4">
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-display font-bold text-paper-100 mb-1">Gastos por categoría</h2>
          <p className="text-xs text-paper-500 mb-4">Distribución del mes actual</p>
          {flatSpendData.length === 0 ? (
            <EmptyState text="Aún no registras gastos este mes." />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={flatSpendData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="60%"
                    outerRadius="90%"
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {flatSpendData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#161F2E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => formatCurrency(v)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {flatSpendData.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {flatSpendData.map((row) => (
                <li key={row.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-paper-300">
                    <span className="h-2 w-2 rounded-full" style={{ background: row.color }} />
                    {row.name}
                  </span>
                  <span className="num text-paper-100">{formatCurrency(row.value)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5 lg:col-span-3">
          <h2 className="font-display font-bold text-paper-100 mb-1">Ingresos vs. gastos</h2>
          <p className="text-xs text-paper-500 mb-4">Evolución de los últimos 6 meses</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="label" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={52}
                  tickFormatter={(v) =>
                    new Intl.NumberFormat('es-CO', { notation: 'compact', compactDisplay: 'short' }).format(v)
                  }
                />
                <Tooltip
                  contentStyle={{ background: '#161F2E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => formatCurrency(v)}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: '#94A3B8' }} />
                <Bar dataKey="ingresos" name="Ingresos" fill="#10B981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="gastos" name="Gastos" fill="#EF4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {empty && (
        <div className="card p-6 text-center">
          <p className="text-paper-100 font-medium">Tu panel está en cero, tal como debe ser al empezar.</p>
          <p className="text-sm text-paper-500 mt-1">
            Ve a la pestaña "Transacciones" y registra tu primer ingreso o gasto para ver tus cifras aquí.
          </p>
        </div>
      )}
    </div>
  )
}

function KpiCard({ label, value, tone, emphasize }: { label: string; value: string; tone: 'gain' | 'loss' | 'accent'; emphasize?: boolean }) {
  const toneColor = tone === 'gain' ? 'text-gain' : tone === 'loss' ? 'text-loss' : 'text-accent'
  return (
    <div className={`card p-4 sm:p-5 ${emphasize ? 'ring-1 ring-white/[0.08]' : ''}`}>
      <p className="text-xs font-medium text-paper-500">{label}</p>
      <p
        className={`num mt-2 font-display font-extrabold break-words ${
          emphasize ? 'text-xl sm:text-3xl' : 'text-lg sm:text-2xl'
        } ${toneColor}`}
      >
        {value}
      </p>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex h-64 items-center justify-center text-center text-sm text-paper-500 px-6">
      {text}
    </div>
  )
}

function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-56 rounded bg-white/5" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 card" />)}
      </div>
      <div className="grid lg:grid-cols-5 gap-4">
        <div className="h-72 card lg:col-span-2" />
        <div className="h-72 card lg:col-span-3" />
      </div>
    </div>
  )
}
