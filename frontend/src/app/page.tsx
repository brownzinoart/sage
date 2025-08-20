import dynamic from 'next/dynamic'

const SageApp = dynamic(() => import('../components/SageApp'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-white to-slate-50/50 flex items-center justify-center">
      <div className="animate-pulse">
        <div className="w-12 h-12 bg-emerald-600 rounded-full opacity-60"></div>
      </div>
    </div>
  )
})

export default function Home() {
  return <SageApp />
}