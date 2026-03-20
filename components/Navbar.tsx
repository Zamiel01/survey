'use client'

import { useState } from 'react'

interface NavbarProps {
  userName: string
  onLogout: () => void
}

export default function Navbar({ userName, onLogout }: NavbarProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <nav className="bg-primary-black text-pure-white sticky top-0 z-50 shadow-xl border-b-2 border-light-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 md:gap-4">
            <div className="relative">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-pure-white rounded-sm flex items-center justify-center transform transition-transform hover:rotate-12 duration-300">
                <svg className="w-6 h-6 md:w-7 md:h-7 text-primary-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold tracking-tight leading-none">
                Survey System
              </h1>
              <p className="text-xs text-light-gray tracking-wide">Traffic & Parking Analytics</p>
            </div>
            <div className="block sm:hidden">
              <h1 className="text-base font-bold tracking-tight">Survey</h1>
            </div>
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-3 px-4 py-2 rounded-sm bg-pure-white bg-opacity-10 border border-pure-white border-opacity-20">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pure-white to-light-gray flex items-center justify-center font-bold text-sm text-primary-black shadow-lg">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold leading-none mb-1">{userName}</span>
                <span className="text-xs text-light-gray leading-none">Administrator</span>
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="group relative px-6 py-2.5 bg-transparent text-pure-white border-2 border-pure-white rounded-sm cursor-pointer text-xs font-bold transition-all duration-300 uppercase tracking-wider overflow-hidden hover:bg-pure-white hover:text-primary-black"
            >
              <span className="relative z-10">Logout</span>
              <div className="absolute inset-0 bg-pure-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left -z-10" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-sm border-2 border-pure-white transition-colors hover:bg-pure-white hover:text-primary-black"
          >
            {showMenu ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {showMenu && (
        <div className="md:hidden border-t-2 border-light-gray bg-primary-black">
          <div className="px-4 py-6 space-y-4">
            {/* User Info */}
            <div className="flex items-center gap-3 pb-4 border-b border-light-gray">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pure-white to-light-gray flex items-center justify-center font-bold text-lg text-primary-black shadow-lg">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-base">{userName}</span>
                <span className="text-xs text-light-gray">Administrator</span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => {
                setShowMenu(false)
                onLogout()
              }}
              className="w-full px-6 py-3 bg-transparent text-pure-white border-2 border-pure-white rounded-sm text-sm font-bold uppercase tracking-wider transition-all duration-300 hover:bg-pure-white hover:text-primary-black"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}