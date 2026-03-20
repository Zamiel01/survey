'use client'

import { useEffect, useRef } from 'react'

interface PopupProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type: 'success' | 'error' | 'info'
}

export default function Popup({ isOpen, onClose, title, message, type }: PopupProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      buttonRef.current.focus()
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const colors = {
    success: {
      bg: 'bg-green-600',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    error: {
      bg: 'bg-red-600',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    },
    info: {
      bg: 'bg-blue-600',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  }

  const colorScheme = colors[type]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className={`${colorScheme.bg} text-white px-6 py-4 rounded-t-lg flex items-center gap-3`}>
          {colorScheme.icon}
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        
        {/* Body */}
        <div className="px-6 py-6">
          <p className="text-gray-700 leading-relaxed">{message}</p>
        </div>
        
        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            ref={buttonRef}
            onClick={onClose}
            className={`w-full py-3 ${colorScheme.bg} text-white rounded-lg font-semibold hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${type === 'success' ? 'green' : type === 'error' ? 'red' : 'blue'}-600`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}
