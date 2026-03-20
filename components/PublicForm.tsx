'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { uploadMultipleToCloudinary } from '@/lib/cloudinary'
import Popup from './Popup'

interface FormData {
  surveyor_id: string
  surveyor_name: string
  district: string
  street_intersection: string
  gps_latitude: string
  gps_longitude: string
  gps_altitude: string
  gps_accuracy: string
  number_of_vehicles: string
  average_speed_kmh: string
  queue_length_vehicles: string
  delay_time_minutes: string
  illegal_parking_instances: string
  pedestrian_obstruction: boolean
  observed_causes_congestion: string
  additional_observations: string
}

interface Errors {
  [key: string]: string
}

interface PopupState {
  isOpen: boolean
  title: string
  message: string
  type: 'success' | 'error' | 'info'
}

export default function PublicForm() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [startTime] = useState(new Date().toISOString())
  const [errors, setErrors] = useState<Errors>({})
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  })

  const [formData, setFormData] = useState<FormData>({
    surveyor_id: '',
    surveyor_name: '',
    district: '',
    street_intersection: '',
    gps_latitude: '',
    gps_longitude: '',
    gps_altitude: '',
    gps_accuracy: '',
    number_of_vehicles: '',
    average_speed_kmh: '',
    queue_length_vehicles: '',
    delay_time_minutes: '',
    illegal_parking_instances: '',
    pedestrian_obstruction: false,
    observed_causes_congestion: '',
    additional_observations: ''
  })

  const fieldLabels: { [key: string]: string } = {
    surveyor_id: 'Surveyor ID',
    surveyor_name: 'Your Name',
    district: 'District',
    street_intersection: 'Street/Intersection',
    number_of_vehicles: 'Vehicles',
    average_speed_kmh: 'Speed (km/h)',
    queue_length_vehicles: 'Queue Length',
    delay_time_minutes: 'Delay (min)',
    illegal_parking_instances: 'Illegal Parking Count',
    observed_causes_congestion: 'Causes of Congestion',
    additional_observations: 'Additional Notes'
  }

  useEffect(() => {
    requestLocation()
    setLoading(false)
  }, [])

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error')
      return
    }

    setLocationStatus('loading')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          gps_latitude: position.coords.latitude.toFixed(6),
          gps_longitude: position.coords.longitude.toFixed(6),
          gps_altitude: position.coords.altitude?.toFixed(2) || '0',
          gps_accuracy: position.coords.accuracy.toFixed(2)
        }))
        setLocationStatus('success')
      },
      (error) => {
        console.error('Location error:', error)
        setLocationStatus('error')
        setPopup({
          isOpen: true,
          title: 'Location Error',
          message: 'Unable to get your location. Please enable GPS and refresh.',
          type: 'error'
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    )
  }

  const validateField = (fieldName: keyof FormData, value: string | boolean): string => {
    if (fieldName === 'pedestrian_obstruction') {
      return ''
    }
    
    if (typeof value === 'string' && value.trim() === '') {
      return `${fieldLabels[fieldName]} is required`
    }
    
    if (typeof value === 'string' && 
        ['number_of_vehicles', 'average_speed_kmh', 'queue_length_vehicles', 
         'delay_time_minutes', 'illegal_parking_instances'].includes(fieldName)) {
      const num = parseFloat(value)
      if (isNaN(num) || num < 0) {
        return `${fieldLabels[fieldName]} must be a positive number`
      }
    }
    
    return ''
  }

  const handleFieldChange = (fieldName: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }))
    
    if (errors[fieldName]) {
      const error = validateField(fieldName, value)
      setErrors(prev => ({ ...prev, [fieldName]: error }))
    }
  }

  const handleFieldBlur = (fieldName: keyof FormData) => {
    const value = formData[fieldName]
    const error = validateField(fieldName, value)
    setErrors(prev => ({ ...prev, [fieldName]: error }))
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (photos.length + files.length > 5) {
      setPopup({
        isOpen: true,
        title: 'Too Many Photos',
        message: 'Maximum 5 photos allowed. Please remove some photos first.',
        type: 'error'
      })
      return
    }

    setPhotos(prev => [...prev, ...files])

    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const validateForm = (): boolean => {
    const newErrors: Errors = {}
    
    const requiredFields: (keyof FormData)[] = [
      'surveyor_id',
      'surveyor_name',
      'district',
      'street_intersection',
      'number_of_vehicles',
      'average_speed_kmh',
      'queue_length_vehicles',
      'delay_time_minutes',
      'illegal_parking_instances',
      'observed_causes_congestion',
      'additional_observations'
    ]

    requiredFields.forEach(field => {
      const error = validateField(field, formData[field])
      if (error) {
        newErrors[field] = error
      }
    })

    setErrors(newErrors)
    
    const hasErrors = Object.keys(newErrors).length > 0
    if (hasErrors) {
      const firstErrorField = Object.keys(newErrors)[0]
      const element = document.getElementById(firstErrorField)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.focus()
      }
    }
    
    return !hasErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!formData.gps_latitude || !formData.gps_longitude) {
      setPopup({
        isOpen: true,
        title: 'Location Required',
        message: 'Please allow location access to submit this survey.',
        type: 'error'
      })
      return
    }

    setSubmitting(true)

    try {
      const supabase = createClient()
      const endTime = new Date().toISOString()

      const photoUrls = await uploadMultipleToCloudinary(photos)

      const { error } = await supabase
        .from('survey_responses')
        .insert([{
          start_time: startTime,
          end_time: endTime,
          survey_date: new Date().toISOString().split('T')[0],
          surveyor_id: formData.surveyor_id,
          district: formData.district,
          street_intersection: formData.street_intersection,
          gps_latitude: parseFloat(formData.gps_latitude),
          gps_longitude: parseFloat(formData.gps_longitude),
          gps_altitude: parseFloat(formData.gps_altitude),
          gps_accuracy: parseFloat(formData.gps_accuracy),
          number_of_vehicles: parseInt(formData.number_of_vehicles) || 0,
          average_speed_kmh: parseFloat(formData.average_speed_kmh) || 0,
          queue_length_vehicles: parseInt(formData.queue_length_vehicles) || 0,
          delay_time_minutes: parseInt(formData.delay_time_minutes) || 0,
          illegal_parking_instances: parseInt(formData.illegal_parking_instances) || 0,
          pedestrian_obstruction: formData.pedestrian_obstruction,
          observed_causes_congestion: formData.observed_causes_congestion,
          photo_evidence_urls: photoUrls,
          photo_captured: photoUrls.length > 0,
          additional_observations: formData.additional_observations,
          user_agent: formData.surveyor_name,
          submitted_by: null
        }])

      if (error) throw error

      setPopup({
        isOpen: true,
        title: 'Success!',
        message: 'Survey submitted successfully. Thank you for your submission!',
        type: 'success'
      })
      
      setFormData({
        surveyor_id: '',
        surveyor_name: '',
        district: '',
        street_intersection: '',
        gps_latitude: '',
        gps_longitude: '',
        gps_altitude: '',
        gps_accuracy: '',
        number_of_vehicles: '',
        average_speed_kmh: '',
        queue_length_vehicles: '',
        delay_time_minutes: '',
        illegal_parking_instances: '',
        pedestrian_obstruction: false,
        observed_causes_congestion: '',
        additional_observations: ''
      })
      setErrors({})
      setPhotos([])
      setPhotoPreviews([])
      requestLocation()

    } catch (error) {
      console.error('Error:', error)
      setPopup({
        isOpen: true,
        title: 'Submission Failed',
        message: 'Failed to submit survey. Please check your connection and try again.',
        type: 'error'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const closePopup = () => {
    setPopup(prev => ({ ...prev, isOpen: false }))
  }

  const getFieldClassName = (fieldName: keyof FormData) => {
    const baseClass = "w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-colors"
    return errors[fieldName] 
      ? `${baseClass} border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500` 
      : `${baseClass} border-gray-300`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Popup 
        isOpen={popup.isOpen}
        onClose={closePopup}
        title={popup.title}
        message={popup.message}
        type={popup.type}
      />

      {/* Header */}
      <div className="bg-black text-white px-4 py-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-lg font-bold">Traffic & Parking Survey</h1>
          <p className="text-xs text-gray-300">Douala Districts</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
        
        {/* Location Status */}
        <div className={`mb-6 p-4 rounded-lg border-l-4 ${
          locationStatus === 'success' 
            ? 'bg-green-50 border-green-600' 
            : locationStatus === 'error'
            ? 'bg-red-50 border-red-600'
            : 'bg-blue-50 border-blue-600'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">
                  {locationStatus === 'success' ? '✓' : locationStatus === 'error' ? '✕' : '⟳'}
                </span>
                <h3 className="font-bold text-sm">
                  {locationStatus === 'success' 
                    ? 'Location Captured' 
                    : locationStatus === 'error' 
                    ? 'Location Error' 
                    : 'Getting Location...'}
                </h3>
              </div>
              {formData.gps_latitude && (
                <p className="text-xs text-gray-600 font-mono">
                  {formData.gps_latitude}, {formData.gps_longitude}
                </p>
              )}
            </div>
            <button
              onClick={requestLocation}
              disabled={locationStatus === 'loading'}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              {locationStatus === 'loading' ? '...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Survey Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Section 1: Survey Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-bold text-base mb-3 pb-2 border-b">Survey Information</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="surveyor_id">
                  Surveyor ID <span className="text-red-500">*</span>
                </label>
                <select
                  id="surveyor_id"
                  required
                  value={formData.surveyor_id}
                  onChange={(e) => handleFieldChange('surveyor_id', e.target.value)}
                  onBlur={() => handleFieldBlur('surveyor_id')}
                  className={getFieldClassName('surveyor_id')}
                >
                  <option value="">Select Code</option>
                  <option value="S1">S1</option>
                  <option value="S2">S2</option>
                  <option value="S3">S3</option>
                  <option value="S4">S4</option>
                </select>
                {errors.surveyor_id && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.surveyor_id}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="surveyor_name">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="surveyor_name"
                  type="text"
                  required
                  value={formData.surveyor_name}
                  onChange={(e) => handleFieldChange('surveyor_name', e.target.value)}
                  onBlur={() => handleFieldBlur('surveyor_name')}
                  placeholder="Enter your full name"
                  className={getFieldClassName('surveyor_name')}
                />
                {errors.surveyor_name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.surveyor_name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Location */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-bold text-base mb-3 pb-2 border-b">Location Details</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="district">
                  District <span className="text-red-500">*</span>
                </label>
                <select
                  id="district"
                  required
                  value={formData.district}
                  onChange={(e) => handleFieldChange('district', e.target.value)}
                  onBlur={() => handleFieldBlur('district')}
                  className={getFieldClassName('district')}
                >
                  <option value="">Choose District</option>
                  <option value="Akwa">Akwa</option>
                  <option value="Deido">Deido</option>
                  <option value="Bonanjo">Bonanjo</option>
                  <option value="New Bell">New Bell</option>
                  <option value="Bepanda">Bepanda</option>
                </select>
                {errors.district && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.district}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="street_intersection">
                  Street/Intersection <span className="text-red-500">*</span>
                </label>
                <input
                  id="street_intersection"
                  type="text"
                  required
                  value={formData.street_intersection}
                  onChange={(e) => handleFieldChange('street_intersection', e.target.value)}
                  onBlur={() => handleFieldBlur('street_intersection')}
                  placeholder="e.g., Rue de la Joie"
                  className={getFieldClassName('street_intersection')}
                />
                {errors.street_intersection && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.street_intersection}
                  </p>
                )}
              </div>

              {/* GPS Fields (Auto-filled) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-500">Latitude</label>
                  <input
                    type="text"
                    value={formData.gps_latitude}
                    readOnly
                    placeholder="Auto-captured"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-500">Longitude</label>
                  <input
                    type="text"
                    value={formData.gps_longitude}
                    readOnly
                    placeholder="Auto-captured"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Traffic */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-bold text-base mb-3 pb-2 border-b">Traffic Indicators</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="number_of_vehicles">
                  Vehicles <span className="text-red-500">*</span>
                </label>
                <input
                  id="number_of_vehicles"
                  type="number"
                  min="0"
                  required
                  value={formData.number_of_vehicles}
                  onChange={(e) => handleFieldChange('number_of_vehicles', e.target.value)}
                  onBlur={() => handleFieldBlur('number_of_vehicles')}
                  placeholder="0"
                  className={getFieldClassName('number_of_vehicles')}
                />
                {errors.number_of_vehicles && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.number_of_vehicles}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="average_speed_kmh">
                  Speed (km/h) <span className="text-red-500">*</span>
                </label>
                <input
                  id="average_speed_kmh"
                  type="number"
                  min="0"
                  step="0.1"
                  required
                  value={formData.average_speed_kmh}
                  onChange={(e) => handleFieldChange('average_speed_kmh', e.target.value)}
                  onBlur={() => handleFieldBlur('average_speed_kmh')}
                  placeholder="0"
                  className={getFieldClassName('average_speed_kmh')}
                />
                {errors.average_speed_kmh && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.average_speed_kmh}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="queue_length_vehicles">
                  Queue Length <span className="text-red-500">*</span>
                </label>
                <input
                  id="queue_length_vehicles"
                  type="number"
                  min="0"
                  required
                  value={formData.queue_length_vehicles}
                  onChange={(e) => handleFieldChange('queue_length_vehicles', e.target.value)}
                  onBlur={() => handleFieldBlur('queue_length_vehicles')}
                  placeholder="0"
                  className={getFieldClassName('queue_length_vehicles')}
                />
                {errors.queue_length_vehicles && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.queue_length_vehicles}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="delay_time_minutes">
                  Delay (min) <span className="text-red-500">*</span>
                </label>
                <input
                  id="delay_time_minutes"
                  type="number"
                  min="0"
                  required
                  value={formData.delay_time_minutes}
                  onChange={(e) => handleFieldChange('delay_time_minutes', e.target.value)}
                  onBlur={() => handleFieldBlur('delay_time_minutes')}
                  placeholder="0"
                  className={getFieldClassName('delay_time_minutes')}
                />
                {errors.delay_time_minutes && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.delay_time_minutes}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Violations */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-bold text-base mb-3 pb-2 border-b">Parking Violations</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="illegal_parking_instances">
                  Illegal Parking Count <span className="text-red-500">*</span>
                </label>
                <input
                  id="illegal_parking_instances"
                  type="number"
                  min="0"
                  required
                  value={formData.illegal_parking_instances}
                  onChange={(e) => handleFieldChange('illegal_parking_instances', e.target.value)}
                  onBlur={() => handleFieldBlur('illegal_parking_instances')}
                  placeholder="0"
                  className={getFieldClassName('illegal_parking_instances')}
                />
                {errors.illegal_parking_instances && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.illegal_parking_instances}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="obstruction"
                  checked={formData.pedestrian_obstruction}
                  onChange={(e) => handleFieldChange('pedestrian_obstruction', e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="obstruction" className="text-sm font-medium cursor-pointer">
                  Pedestrian path blocked <span className="text-red-500">*</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="observed_causes_congestion">
                  Causes of Congestion <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="observed_causes_congestion"
                  required
                  value={formData.observed_causes_congestion}
                  onChange={(e) => handleFieldChange('observed_causes_congestion', e.target.value)}
                  onBlur={() => handleFieldBlur('observed_causes_congestion')}
                  placeholder="Describe what's causing traffic..."
                  rows={3}
                  className={getFieldClassName('observed_causes_congestion')}
                />
                {errors.observed_causes_congestion && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.observed_causes_congestion}
                  </p>
                )}
              </div>

              {/* Photos */}
              <div>
                <label className="block text-sm font-medium mb-2">Photo Evidence (Max 5)</label>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <label className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 hover:bg-gray-50 transition">
                      <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-xs font-medium text-gray-600">Upload</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                  </label>

                  <label className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 hover:bg-gray-50 transition">
                      <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-xs font-medium text-gray-600">Camera</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                {photoPreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {photoPreviews.map((preview, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img 
                          src={preview} 
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow-md"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 5: Notes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <label className="block font-bold text-base mb-3 pb-2 border-b" htmlFor="additional_observations">
              Additional Notes <span className="text-red-500">*</span>
            </label>
            
            <textarea
              id="additional_observations"
              required
              value={formData.additional_observations}
              onChange={(e) => handleFieldChange('additional_observations', e.target.value)}
              onBlur={() => handleFieldBlur('additional_observations')}
              placeholder="Any other observations..."
              rows={4}
              className={getFieldClassName('additional_observations')}
            />
            {errors.additional_observations && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.additional_observations}
              </p>
            )}
          </div>

        </form>
      </div>

      {/* Submit - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg z-20">
        <button
          onClick={handleSubmit}
          disabled={submitting || !formData.gps_latitude}
          className="w-full max-w-4xl mx-auto block py-3.5 bg-black text-white rounded-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-gray-900 transition active:scale-[0.98]"
        >
          {submitting ? 'Submitting...' : 'Submit Survey'}
        </button>
        {!formData.gps_latitude && (
          <p className="text-center text-sm text-red-600 mt-2">Location required</p>
        )}
      </div>
    </div>
  )
}
