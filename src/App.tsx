import { lazy, Suspense } from 'react'
import { FxProvider } from './components/FxLayer'
import { MusicController } from './components/MusicController'
import { SceneManager } from './components/SceneManager'

const PrintCard = lazy(() => import('./components/PrintCard'))

export default function App() {
  if (new URLSearchParams(window.location.search).get('print') === 'card') {
    return (
      <Suspense fallback={null}>
        <PrintCard />
      </Suspense>
    )
  }
  return (
    <div className="stage-h relative mx-auto w-full max-w-[560px] overflow-hidden bg-[#fde6df] shadow-[0_0_80px_rgba(200,120,120,0.25)]">
      <FxProvider>
        <SceneManager />
        <div className="paper-grain pointer-events-none absolute inset-0 z-20" aria-hidden />
        <MusicController />
      </FxProvider>
    </div>
  )
}
