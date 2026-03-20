'use client'

import { useState } from 'react'
import Navbar from './Navbar'
import DashboardMain from './DashboardMain'
import FormManagement from './FormManagement'
import DataView from './DataView'

type View = 'main' | 'form' | 'data'

interface DashboardProps {
  userName: string
  onLogout: () => void
}

export default function Dashboard({ userName, onLogout }: DashboardProps) {
  const [currentView, setCurrentView] = useState<View>('main')

  return (
    <div className="min-h-screen bg-pure-white">
      <Navbar userName={userName} onLogout={onLogout} />
      
      <div className="p-10 max-w-[1400px] mx-auto">
        {currentView === 'main' && (
          <DashboardMain 
            onShowForm={() => setCurrentView('form')}
            onShowData={() => setCurrentView('data')}
          />
        )}
        
        {currentView === 'form' && (
          <FormManagement onBack={() => setCurrentView('main')} />
        )}
        
        {currentView === 'data' && (
          <DataView onBack={() => setCurrentView('main')} />
        )}
      </div>
    </div>
  )
}