'use client'

import { useState, useEffect } from 'react'

interface DashboardMainProps {
  onShowForm: () => void
  onShowData: () => void
}

export default function DashboardMain({ onShowForm, onShowData }: DashboardMainProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-12">
      {/* Header Section */}
      <div className={`mb-10 md:mb-16 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-1 w-12 bg-primary-black rounded-full" />
          <span className="text-xs font-bold uppercase tracking-widest text-accent-gray">Dashboard</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 tracking-tight leading-tight">
          Welcome Back
        </h2>
        <p className="text-accent-gray text-base md:text-lg max-w-2xl leading-relaxed">
          Manage your traffic and parking surveys with precision. Access real-time data, generate reports, and coordinate field teams seamlessly.
        </p>
      </div>

    

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <DashboardCard
          icon={
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          title="Survey Form"
          description="Create and distribute survey forms to field teams. Generate unique access links and monitor real-time submissions from multiple locations."
          features={["QR Code Generation", "Mobile Optimized", "GPS Integration"]}
          onClick={onShowForm}
          delay={200}
          mounted={mounted}
          accentColor="from-blue-500 to-cyan-500"
        />
        
        <DashboardCard
          icon={
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          }
          title="View Data"
          description="Access comprehensive analytics dashboard. Filter, analyze and export survey data with advanced reporting capabilities and visualization tools."
          features={["Export CSV/PDF", "Advanced Filters", "Visual Analytics"]}
          onClick={onShowData}
          delay={300}
          mounted={mounted}
          accentColor="from-violet-500 to-purple-500"
        />
      </div>

      {/* Quick Actions Footer */}
      <div className={`mt-12 md:mt-16 p-6 md:p-8 bg-hover-gray border-2 border-light-gray rounded-sm transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-lg md:text-xl font-bold mb-2 tracking-tight">Need Help Getting Started?</h3>
            <p className="text-sm md:text-base text-accent-gray leading-relaxed">
              Check out our documentation or contact support for assistance with survey deployment.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button className="px-6 py-3 bg-transparent border-2 border-primary-black text-primary-black rounded-sm text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:bg-primary-black hover:text-pure-white whitespace-nowrap">
              Documentation
            </button>
            <button className="px-6 py-3 bg-primary-black text-pure-white border-2 border-primary-black rounded-sm text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:bg-pure-white hover:text-primary-black whitespace-nowrap">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface QuickStatProps {
  value: string
  label: string
  trend: string
  icon: string
}

function QuickStat({ value, label, trend, icon }: QuickStatProps) {
  return (
    <div className="group bg-pure-white border-2 border-light-gray rounded-sm p-4 md:p-6 transition-all duration-300 hover:border-primary-black hover:shadow-lg hover:-translate-y-1">
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl md:text-3xl">{icon}</span>
        <div className="w-2 h-2 rounded-full bg-primary-black opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="text-2xl md:text-3xl font-bold mb-1 tracking-tight text-primary-black">
        {value}
      </div>
      <div className="text-xs md:text-sm font-semibold uppercase tracking-wide text-primary-black mb-2">
        {label}
      </div>
      <div className="text-xs text-accent-gray">
        {trend}
      </div>
    </div>
  )
}

interface DashboardCardProps {
  icon: React.ReactNode
  title: string
  description: string
  features: string[]
  onClick: () => void
  delay: number
  mounted: boolean
  accentColor: string
}

function DashboardCard({ icon, title, description, features, onClick, delay, mounted, accentColor }: DashboardCardProps) {
  return (
    <div
      onClick={onClick}
      className={`group relative bg-pure-white border-2 border-primary-black rounded-sm p-6 md:p-8 cursor-pointer transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl overflow-hidden ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Background Accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${accentColor} opacity-0 group-hover:opacity-10 blur-3xl transition-all duration-500 -z-10`} />
      
      {/* Animated Border Effect */}
      <div className="absolute inset-0 border-2 border-primary-black scale-105 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-sm" />

      {/* Icon */}
      <div className="relative mb-6 md:mb-8">
        <div className="w-14 h-14 md:w-16 md:h-16 text-primary-black transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
          {icon}
        </div>
        <div className={`absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br ${accentColor} rounded-full opacity-0 group-hover:opacity-20 blur-lg transition-all duration-500`} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl md:text-2xl font-bold tracking-tight text-primary-black group-hover:text-primary-black transition-colors duration-300">
            {title}
          </h3>
          <svg 
            className="w-6 h-6 text-primary-black transform transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>

        <p className="text-sm md:text-base text-accent-gray leading-relaxed mb-6 transition-colors duration-300 group-hover:text-primary-black">
          {description}
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-2">
          {features.map((feature, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-3 py-1.5 bg-hover-gray border border-light-gray rounded-sm text-xs font-semibold uppercase tracking-wide text-primary-black transition-all duration-300 group-hover:bg-primary-black group-hover:text-pure-white group-hover:border-primary-black"
              style={{ transitionDelay: `${idx * 50}ms` }}
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Click Indicator */}
      <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-gray opacity-0 group-hover:opacity-100 transition-all duration-300">
        <span>Open</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  )
}