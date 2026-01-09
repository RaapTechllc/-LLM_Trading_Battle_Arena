'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DemoTimer } from '@/lib/performance'

interface DemoStep {
  id: string
  title: string
  description: string
  route: string
  duration: number // seconds
  actions: string[]
}

const DEMO_STEPS: DemoStep[] = [
  {
    id: 'home',
    title: 'Welcome to LLM Trading Battle Arena',
    description: 'Introduce the concept with live market data integration',
    route: '/',
    duration: 30,
    actions: [
      'Point out live BTC/ETH/SOL price tickers',
      'Highlight educational disclaimers',
      'Show AI model competition concept',
      'Emphasize zero financial risk with real data'
    ]
  },
  {
    id: 'simulate',
    title: 'AI Trade Simulation',
    description: 'Create a legendary trade card with Grok 4.20',
    route: '/simulate',
    duration: 45,
    actions: [
      'Select Grok 4.20 model',
      'Set BTC LONG with high leverage',
      'Generate +15% P&L legendary card',
      'Show holographic effects and sound'
    ]
  },
  {
    id: 'journal',
    title: 'Trade Journal with Live Context',
    description: 'Browse holographic trade cards with live market context',
    route: '/journal',
    duration: 30,
    actions: [
      'Show live price tickers for market context',
      'Display collection statistics',
      'Filter by legendary rarity',
      'Demonstrate search functionality',
      'Highlight holographic effects'
    ]
  },
  {
    id: 'showdown',
    title: 'Model Showdown with Market Awareness',
    description: 'Watch Grok vs Claude battle with live market context',
    route: '/showdown',
    duration: 60,
    actions: [
      'Note live market prices for context',
      'Select Grok 4.20 vs Claude Sonnet',
      'Start showdown with suspense',
      'Show top 3 cards comparison',
      'Dramatic winner announcement'
    ]
  },
  {
    id: 'leaderboard',
    title: 'AI Model Rankings',
    description: 'Show final leaderboard with model statistics',
    route: '/leaderboard',
    duration: 15,
    actions: [
      'Display model rankings',
      'Show performance statistics',
      'Highlight top performers'
    ]
  }
]

export default function DemoScript() {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [totalElapsed, setTotalElapsed] = useState(0)
  const router = useRouter()

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1)
        setTotalElapsed(prev => prev + 1)
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isActive, timeRemaining])

  const startDemo = () => {
    setIsActive(true)
    setCurrentStep(0)
    setTimeRemaining(DEMO_STEPS[0].duration)
    setTotalElapsed(0)
    DemoTimer.startDemo()
    router.push(DEMO_STEPS[0].route)
  }

  const nextStep = () => {
    if (currentStep < DEMO_STEPS.length - 1) {
      const currentStepData = DEMO_STEPS[currentStep]
      DemoTimer.checkpoint(currentStepData.title)
      
      const nextStepIndex = currentStep + 1
      setCurrentStep(nextStepIndex)
      setTimeRemaining(DEMO_STEPS[nextStepIndex].duration)
      router.push(DEMO_STEPS[nextStepIndex].route)
    } else {
      endDemo()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1
      setCurrentStep(prevStepIndex)
      setTimeRemaining(DEMO_STEPS[prevStepIndex].duration)
      router.push(DEMO_STEPS[prevStepIndex].route)
    }
  }

  const endDemo = () => {
    setIsActive(false)
    const totalTime = DemoTimer.endDemo()
    alert(`Demo completed in ${(totalTime / 1000).toFixed(1)} seconds!`)
  }

  const skipToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex)
    setTimeRemaining(DEMO_STEPS[stepIndex].duration)
    router.push(DEMO_STEPS[stepIndex].route)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isActive) return

      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault()
          nextStep()
          break
        case 'ArrowLeft':
          e.preventDefault()
          prevStep()
          break
        case 'Escape':
          e.preventDefault()
          endDemo()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, currentStep])

  if (!isActive) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={startDemo}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
        >
          🎬 Start Demo
        </button>
      </div>
    )
  }

  const currentStepData = DEMO_STEPS[currentStep]
  const totalDuration = DEMO_STEPS.reduce((sum, step) => sum + step.duration, 0)
  const progress = (totalElapsed / totalDuration) * 100

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-white/20 text-white">
      <div className="container mx-auto px-4 py-3">
        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
          <div 
            className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          {/* Current Step Info */}
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div className="text-sm font-bold">
                Step {currentStep + 1}/{DEMO_STEPS.length}
              </div>
              <div className="text-lg font-bold text-blue-400">
                {currentStepData.title}
              </div>
              <div className="text-sm text-slate-300">
                {timeRemaining}s remaining
              </div>
            </div>
            <div className="text-sm text-slate-400 mt-1">
              {currentStepData.description}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 rounded text-sm transition-colors"
            >
              ← Prev
            </button>
            <button
              onClick={nextStep}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
            >
              {currentStep === DEMO_STEPS.length - 1 ? 'Finish' : 'Next →'}
            </button>
            <button
              onClick={endDemo}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
            >
              End Demo
            </button>
          </div>
        </div>

        {/* Action Items */}
        <div className="mt-2 text-xs text-slate-300">
          <strong>Actions:</strong> {currentStepData.actions.join(' • ')}
        </div>

        {/* Step Navigation */}
        <div className="flex gap-1 mt-2">
          {DEMO_STEPS.map((step, index) => (
            <button
              key={step.id}
              onClick={() => skipToStep(index)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                index === currentStep 
                  ? 'bg-blue-600 text-white' 
                  : index < currentStep
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {/* Keyboard Shortcuts */}
        <div className="text-xs text-slate-500 mt-1">
          Shortcuts: Space/→ (Next) • ← (Prev) • Esc (End)
        </div>
      </div>
    </div>
  )
}
