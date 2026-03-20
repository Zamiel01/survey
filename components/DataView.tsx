'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface FormManagementProps {
  onBack: () => void
}

interface SurveyData {
  id: string
  survey_date: string
  start_time: string
  end_time: string
  district: string
  street_intersection: string
  surveyor_id: string
  user_agent: string | null
  number_of_vehicles: number
  illegal_parking_instances: number
  pedestrian_obstruction: boolean
  average_speed_kmh: number | null
  queue_length_vehicles: number | null
  delay_time_minutes: number | null
  observed_causes_congestion: string | null
  photo_evidence_urls: string[] | null
  photo_captured: boolean | null
  additional_observations: string | null
  gps_latitude: number | null
  gps_longitude: number | null
  gps_accuracy: number | null
  created_at: string
}

export default function DataView({ onBack }: FormManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [data, setData] = useState<SurveyData[]>([])
  const [filteredData, setFilteredData] = useState<SurveyData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  const [imagePopup, setImagePopup] = useState<{ url: string; index: number; total: number } | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    districts: 0,
    surveyors: 0,
    violations: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = data.filter(
        (item) =>
          item.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.street_intersection.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.surveyor_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.user_agent?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredData(filtered)
    } else {
      setFilteredData(data)
    }
  }, [searchTerm, data])

  const fetchData = async () => {
    try {
      const supabase = createClient()
      
      const { data: responses, error } = await supabase
        .from('survey_responses')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setData(responses || [])
      setFilteredData(responses || [])

      // Calculate stats
      const totalViolations = responses?.reduce((sum, item) => sum + (item.illegal_parking_instances || 0), 0) || 0
      const uniqueDistricts = new Set(responses?.map(item => item.district)).size
      const uniqueSurveyors = new Set(responses?.map(item => item.surveyor_id)).size

      setStats({
        total: responses?.length || 0,
        districts: uniqueDistricts,
        surveyors: uniqueSurveyors,
        violations: totalViolations
      })

      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  const exportCSV = () => {
    const headers = [
      'ID', 'Date', 'Start Time', 'End Time', 'District', 'Location', 'Surveyor', 'Surveyor Name',
      'Vehicles', 'Violations', 'Obstruction', 'Avg Speed (km/h)', 'Queue Length', 
      'Delay (min)', 'Causes', 'Photos', 'GPS Lat', 'GPS Lon', 'Observations'
    ]
    const rows = filteredData.map((item) => [
      item.id.substring(0, 8),
      item.survey_date,
      item.start_time ? new Date(item.start_time).toLocaleTimeString() : '',
      item.end_time ? new Date(item.end_time).toLocaleTimeString() : '',
      item.district,
      item.street_intersection,
      item.surveyor_id,
      item.user_agent || '',
      item.number_of_vehicles || 0,
      item.illegal_parking_instances || 0,
      item.pedestrian_obstruction ? 'Yes' : 'No',
      item.average_speed_kmh || '',
      item.queue_length_vehicles || '',
      item.delay_time_minutes || '',
      item.observed_causes_congestion || '',
      item.photo_captured ? 'Yes' : 'No',
      item.gps_latitude || '',
      item.gps_longitude || '',
      item.additional_observations || '',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `survey_data_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exportPDF = () => {
    alert('PDF Export feature.\n\nIn production, this would use a library like jsPDF or react-pdf to generate a formatted PDF report.')
  }

  const deleteRecord = async (id: string) => {
    if (confirm(`Are you sure you want to delete this survey?\n\nThis action cannot be undone.`)) {
      try {
        const supabase = createClient()
        const { error } = await supabase
          .from('survey_responses')
          .delete()
          .eq('id', id)

        if (error) throw error

        alert('Record deleted successfully.')
        fetchData() // Refresh data
      } catch (error) {
        console.error('Error deleting record:', error)
        alert('Failed to delete record.')
      }
    }
  }

  const toggleCard = (id: string) => {
    setSelectedCard(selectedCard === id ? null : id)
  }

  const openImagePopup = (url: string, index: number, total: number) => {
    setImagePopup({ url, index, total })
  }

  const closeImagePopup = () => {
    setImagePopup(null)
  }

  const navigateImage = (direction: 'prev' | 'next', allUrls: string[]) => {
    if (!imagePopup) return
    
    let newIndex = imagePopup.index
    if (direction === 'prev') {
      newIndex = imagePopup.index > 0 ? imagePopup.index - 1 : allUrls.length - 1
    } else {
      newIndex = imagePopup.index < allUrls.length - 1 ? imagePopup.index + 1 : 0
    }
    
    setImagePopup({ url: allUrls[newIndex], index: newIndex, total: allUrls.length })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-black mx-auto mb-4"></div>
          <p className="text-accent-gray">Loading data...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-transparent border-2 border-primary-black rounded-sm cursor-pointer text-sm font-semibold mb-6 transition-all duration-300 uppercase tracking-wide hover:bg-primary-black hover:text-pure-white"
      >
        ← Back to Dashboard
      </button>

      <div className="bg-pure-white">
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Survey Data Collection</h2>
          <p className="text-accent-gray text-sm md:text-base">
            View, analyze, and export collected survey responses
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mb-6 md:mb-8">
          <StatCard value={stats.total.toString()} label="Total Surveys" />
          <StatCard value={stats.districts.toString()} label="Districts" />
          <StatCard value={stats.surveyors.toString()} label="Surveyors" />
          <StatCard value={stats.violations.toString()} label="Violations" />
        </div>

        {/* Controls */}
        <div className="bg-hover-gray p-4 md:p-6 rounded-sm mb-6 md:mb-8 flex flex-col md:flex-row justify-between items-center gap-4 border-2 border-light-gray">
          <div className="flex-1 w-full md:min-w-[300px]">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by district, surveyor ID, name, or location..."
              className="input-field w-full"
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={exportCSV}
              className="flex-1 md:flex-none px-4 md:px-6 py-2.5 md:py-3 bg-primary-black text-pure-white border-2 border-primary-black rounded-sm cursor-pointer text-xs font-semibold transition-all duration-300 uppercase tracking-wide hover:bg-pure-white hover:text-primary-black"
            >
              CSV
            </button>
            <button
              onClick={exportPDF}
              className="flex-1 md:flex-none px-4 md:px-6 py-2.5 md:py-3 bg-primary-black text-pure-white border-2 border-primary-black rounded-sm cursor-pointer text-xs font-semibold transition-all duration-300 uppercase tracking-wide hover:bg-pure-white hover:text-primary-black"
            >
              PDF
            </button>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="block lg:hidden">
          {filteredData.length === 0 ? (
            <div className="bg-pure-white border-2 border-light-gray rounded-sm p-8 text-center text-accent-gray">
              No survey data found. Submit surveys to see data here.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredData.map((item) => (
                <MobileCard
                  key={item.id}
                  item={item}
                  isExpanded={selectedCard === item.id}
                  onToggle={() => toggleCard(item.id)}
                  onDelete={deleteRecord}
                  onImageClick={openImagePopup}
                />
              ))}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-pure-white border-2 border-light-gray rounded-sm overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-primary-black text-pure-white">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide">ID</th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide">Date & Time</th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide">District</th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide">Location</th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide">Surveyor</th>
                  <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wide">Metrics</th>
                  <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wide">Status</th>
                  <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-accent-gray">
                      No survey data found. Submit surveys to see data here.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <DesktopRow
                      key={item.id}
                      item={item}
                      onDelete={deleteRecord}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Image Popup Modal */}
      {imagePopup && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={closeImagePopup}
        >
          <button
            onClick={closeImagePopup}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative max-w-4xl w-full h-full flex flex-col items-center justify-center">
            <img
              src={imagePopup.url}
              alt="Survey evidence"
              className="max-w-full max-h-[80vh] object-contain rounded-sm"
              onClick={(e) => e.stopPropagation()}
            />
            
            <div className="mt-4 text-white text-sm">
              Photo {imagePopup.index + 1} of {imagePopup.total}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-primary-black text-pure-white p-4 md:p-6 rounded-sm border-2 border-primary-black">
      <div className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">{value}</div>
      <div className="text-xs md:text-sm text-light-gray uppercase tracking-wide">{label}</div>
    </div>
  )
}

function MobileCard({ 
  item, 
  isExpanded, 
  onToggle, 
  onDelete,
  onImageClick
}: { 
  item: SurveyData
  isExpanded: boolean
  onToggle: () => void
  onDelete: (id: string) => void
  onImageClick: (url: string, index: number, total: number) => void
}) {
  // Parse photo URLs - they come as JSON string array from Supabase
  const photoUrls = item.photo_evidence_urls || []
  const hasPhotos = photoUrls.length > 0
  const firstPhoto = hasPhotos ? photoUrls[0] : null

  return (
    <div 
      className="bg-pure-white border-2 border-light-gray rounded-sm overflow-hidden transition-all duration-300 hover:shadow-md"
    >
      {/* Card Header - Always Visible */}
      <div 
        onClick={onToggle}
        className="flex items-start gap-4 p-4 cursor-pointer hover:bg-hover-gray transition-colors"
      >
        {/* Photo Thumbnail */}
        <div 
          className="flex-shrink-0 w-20 h-20 bg-light-gray rounded-sm overflow-hidden border-2 border-primary-black cursor-pointer hover:border-accent-gray transition-colors"
          onClick={(e) => {
            if (firstPhoto) {
              e.stopPropagation()
              onImageClick(firstPhoto, 0, photoUrls.length)
            }
          }}
        >
          {firstPhoto ? (
            <img 
              src={firstPhoto} 
              alt="Survey evidence" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                e.currentTarget.parentElement!.innerHTML = `
                  <div class="w-full h-full flex items-center justify-center text-accent-gray">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                `
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-accent-gray">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Card Summary */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-bold text-sm text-primary-black mb-1">
                {item.district}
              </h3>
              <p className="text-xs text-accent-gray">
                {item.street_intersection}
              </p>
            </div>
            <span className="text-xs text-accent-gray flex-shrink-0">
              #{item.id.substring(0, 8)}
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-xs">
            <span className="text-accent-gray">{item.survey_date}</span>
            <span className="px-2 py-1 bg-primary-black text-pure-white rounded-sm font-semibold">
              {item.illegal_parking_instances || 0} violations
            </span>
          </div>
        </div>

        {/* Expand Icon */}
        <div className="flex-shrink-0">
          <svg 
            className={`w-5 h-5 text-primary-black transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t-2 border-light-gray bg-hover-gray p-4 space-y-4">
          {/* Survey Details */}
          <div className="grid grid-cols-2 gap-3">
            <DetailItem label="Surveyor" value={item.surveyor_id} />
            {item.user_agent && <DetailItem label="Surveyor Name" value={item.user_agent} />}
            <DetailItem label="Date" value={item.survey_date} />
            <DetailItem 
              label="Start Time" 
              value={item.start_time ? new Date(item.start_time).toLocaleTimeString() : 'N/A'} 
            />
            <DetailItem 
              label="End Time" 
              value={item.end_time ? new Date(item.end_time).toLocaleTimeString() : 'N/A'} 
            />
          </div>

          {/* Traffic Metrics */}
          <div className="border-t border-light-gray pt-3">
            <h4 className="text-xs font-bold uppercase tracking-wide text-primary-black mb-2">
              Traffic Metrics
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <DetailItem label="Vehicles" value={item.number_of_vehicles?.toString() || '0'} />
              <DetailItem label="Violations" value={item.illegal_parking_instances?.toString() || '0'} />
              <DetailItem label="Avg Speed" value={item.average_speed_kmh ? `${item.average_speed_kmh} km/h` : 'N/A'} />
              <DetailItem label="Queue Length" value={item.queue_length_vehicles?.toString() || 'N/A'} />
              <DetailItem label="Delay" value={item.delay_time_minutes ? `${item.delay_time_minutes} min` : 'N/A'} />
              <DetailItem 
                label="Obstruction" 
                value={
                  <span className={`inline-block px-2 py-1 rounded-sm text-xs font-semibold uppercase ${
                    item.pedestrian_obstruction 
                      ? 'bg-primary-black text-pure-white' 
                      : 'bg-light-gray text-primary-black'
                  }`}>
                    {item.pedestrian_obstruction ? 'Yes' : 'No'}
                  </span>
                } 
              />
            </div>
          </div>

          {/* Observations */}
          {(item.observed_causes_congestion || item.additional_observations) && (
            <div className="border-t border-light-gray pt-3">
              <h4 className="text-xs font-bold uppercase tracking-wide text-primary-black mb-2">
                Observations
              </h4>
              {item.observed_causes_congestion && (
                <p className="text-sm text-accent-gray mb-2">
                  <span className="font-semibold">Causes:</span> {item.observed_causes_congestion}
                </p>
              )}
              {item.additional_observations && (
                <p className="text-sm text-accent-gray">
                  <span className="font-semibold">Notes:</span> {item.additional_observations}
                </p>
              )}
            </div>
          )}

          {/* GPS Location */}
          {(item.gps_latitude && item.gps_longitude) && (
            <div className="border-t border-light-gray pt-3">
              <h4 className="text-xs font-bold uppercase tracking-wide text-primary-black mb-2">
                GPS Location
              </h4>
              <p className="text-sm text-accent-gray">
                {item.gps_latitude?.toFixed(6)}, {item.gps_longitude?.toFixed(6)}
                {item.gps_accuracy && ` (±${item.gps_accuracy}m)`}
              </p>
            </div>
          )}

          {/* Photo Gallery */}
          {hasPhotos && photoUrls.length > 1 && (
            <div className="border-t border-light-gray pt-3">
              <h4 className="text-xs font-bold uppercase tracking-wide text-primary-black mb-2">
                Photo Evidence ({photoUrls.length})
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {photoUrls.map((url, idx) => (
                  <img 
                    key={idx}
                    src={url} 
                    alt={`Evidence ${idx + 1}`} 
                    className="w-full h-20 object-cover rounded-sm border-2 border-light-gray hover:border-primary-black transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      onImageClick(url, idx, photoUrls.length)
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="border-t border-light-gray pt-3 flex gap-2">
            <button
              onClick={() => onDelete(item.id)}
              className="flex-1 px-4 py-2.5 bg-transparent border-2 border-primary-black rounded-sm text-xs font-semibold uppercase tracking-wide transition-all duration-300 hover:bg-primary-black hover:text-pure-white"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-accent-gray uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm font-semibold text-primary-black">
        {value || 'N/A'}
      </p>
    </div>
  )
}

function DesktopRow({ 
  item, 
  onDelete 
}: { 
  item: SurveyData
  onDelete: (id: string) => void
}) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <>
      <tr 
        className="transition-colors duration-200 hover:bg-hover-gray cursor-pointer border-b border-light-gray"
        onClick={() => setShowDetails(!showDetails)}
      >
        <td className="px-4 py-4 text-sm font-mono">
          #{item.id.substring(0, 8)}
        </td>
        <td className="px-4 py-4 text-sm">
          <div className="font-semibold">{item.survey_date}</div>
          <div className="text-xs text-accent-gray">
            {item.start_time && new Date(item.start_time).toLocaleTimeString()} - {item.end_time && new Date(item.end_time).toLocaleTimeString()}
          </div>
        </td>
        <td className="px-4 py-4 text-sm font-semibold">
          {item.district}
        </td>
        <td className="px-4 py-4 text-sm">
          {item.street_intersection}
        </td>
        <td className="px-4 py-4 text-sm">
          <div className="font-semibold">{item.surveyor_id}</div>
          {item.user_agent && (
            <div className="text-xs text-accent-gray truncate max-w-[120px]" title={item.user_agent}>
              {item.user_agent}
            </div>
          )}
        </td>
        <td className="px-4 py-4">
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center justify-center gap-2">
              <span className="text-accent-gray">Vehicles:</span>
              <span className="font-semibold">{item.number_of_vehicles || 0}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-accent-gray">Violations:</span>
              <span className="font-bold text-primary-black">{item.illegal_parking_instances || 0}</span>
            </div>
            {item.average_speed_kmh && (
              <div className="flex items-center justify-center gap-2">
                <span className="text-accent-gray">Speed:</span>
                <span className="font-semibold">{item.average_speed_kmh} km/h</span>
              </div>
            )}
          </div>
        </td>
        <td className="px-4 py-4 text-center">
          <div className="flex flex-col gap-1.5 items-center">
            <span className={`inline-block px-3 py-1 rounded-sm text-xs font-semibold uppercase tracking-wide ${
              item.pedestrian_obstruction
                ? 'bg-primary-black text-pure-white'
                : 'bg-light-gray text-primary-black'
            }`}>
              {item.pedestrian_obstruction ? 'Blocked' : 'Clear'}
            </span>
            {item.photo_captured && (
              <span className="inline-block px-3 py-1 bg-light-gray text-primary-black rounded-sm text-xs font-semibold uppercase">
                📷 Photos
              </span>
            )}
          </div>
        </td>
        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-3 py-1.5 bg-transparent border-2 border-primary-black rounded-sm cursor-pointer text-xs font-semibold transition-all duration-300 uppercase hover:bg-primary-black hover:text-pure-white"
            >
              {showDetails ? 'Hide' : 'View'}
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="px-3 py-1.5 bg-transparent border-2 border-primary-black rounded-sm cursor-pointer text-xs font-semibold transition-all duration-300 uppercase hover:bg-primary-black hover:text-pure-white"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
      
      {/* Expandable Details Row */}
      {showDetails && (
        <tr className="bg-hover-gray border-b-2 border-light-gray">
          <td colSpan={8} className="px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Survey Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wide text-primary-black border-b-2 border-primary-black pb-2">
                  Survey Information
                </h4>
                <DetailItem label="Surveyor ID" value={item.surveyor_id} />
                {item.user_agent && (
                  <DetailItem label="Surveyor Name" value={item.user_agent} />
                )}
                <DetailItem label="Survey Date" value={item.survey_date} />
                <DetailItem 
                  label="Start Time" 
                  value={item.start_time ? new Date(item.start_time).toLocaleTimeString() : 'N/A'} 
                />
                <DetailItem 
                  label="End Time" 
                  value={item.end_time ? new Date(item.end_time).toLocaleTimeString() : 'N/A'} 
                />
              </div>

              {/* Traffic Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wide text-primary-black border-b-2 border-primary-black pb-2">
                  Traffic Details
                </h4>
                <DetailItem label="Queue Length" value={item.queue_length_vehicles ? `${item.queue_length_vehicles} vehicles` : 'N/A'} />
                <DetailItem label="Delay Time" value={item.delay_time_minutes ? `${item.delay_time_minutes} minutes` : 'N/A'} />
                <DetailItem label="Average Speed" value={item.average_speed_kmh ? `${item.average_speed_kmh} km/h` : 'N/A'} />
              </div>

              {/* Observations */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wide text-primary-black border-b-2 border-primary-black pb-2">
                  Observations
                </h4>
                {item.observed_causes_congestion ? (
                  <div>
                    <p className="text-xs text-accent-gray uppercase mb-1">Causes of Congestion</p>
                    <p className="text-sm text-primary-black">{item.observed_causes_congestion}</p>
                  </div>
                ) : (
                  <p className="text-sm text-accent-gray italic">No causes recorded</p>
                )}
                {item.additional_observations && (
                  <div>
                    <p className="text-xs text-accent-gray uppercase mb-1">Additional Notes</p>
                    <p className="text-sm text-primary-black">{item.additional_observations}</p>
                  </div>
                )}
              </div>

              {/* Location & GPS */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wide text-primary-black border-b-2 border-primary-black pb-2">
                  Location Data
                </h4>
                {item.gps_latitude && item.gps_longitude ? (
                  <>
                    <DetailItem 
                      label="Coordinates" 
                      value={`${item.gps_latitude.toFixed(6)}, ${item.gps_longitude.toFixed(6)}`} 
                    />
                    {item.gps_accuracy && (
                      <DetailItem label="GPS Accuracy" value={`±${item.gps_accuracy}m`} />
                    )}
                  </>
                ) : (
                  <p className="text-sm text-accent-gray italic">No GPS data</p>
                )}
              </div>

              {/* Photo Evidence */}
              {item.photo_evidence_urls && item.photo_evidence_urls.length > 0 && (
                <div className="md:col-span-2 lg:col-span-3 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wide text-primary-black border-b-2 border-primary-black pb-2">
                    Photo Evidence ({item.photo_evidence_urls.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {item.photo_evidence_urls.map((url, idx) => (
                      <div key={idx} className="aspect-square">
                        <img 
                          src={url} 
                          alt={`Evidence ${idx + 1}`} 
                          className="w-full h-full object-cover rounded-sm border-2 border-light-gray hover:border-primary-black transition-colors cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(url, '_blank')
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}