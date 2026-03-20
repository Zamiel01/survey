/**
 * Cloudinary Upload Utility
 * Handles uploading images to Cloudinary using unsigned uploads
 */

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

interface UploadResponse {
  secure_url: string
  public_id: string
  format: string
  width: number
  height: number
  bytes: number
}

/**
 * Upload a file to Cloudinary
 * @param file - The file to upload
 * @returns Promise with the secure URL of the uploaded image
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('Cloudinary configuration is missing. Please check your environment variables.')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'Failed to upload image to Cloudinary')
    }

    const data: UploadResponse = await response.json()
    return data.secure_url
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw error
  }
}

/**
 * Upload multiple files to Cloudinary
 * @param files - Array of files to upload
 * @returns Promise with array of secure URLs
 */
export async function uploadMultipleToCloudinary(files: File[]): Promise<string[]> {
  const urls: string[] = []
  
  for (const file of files) {
    try {
      const url = await uploadToCloudinary(file)
      urls.push(url)
    } catch (error) {
      console.error(`Failed to upload file ${file.name}:`, error)
      // Continue with other files even if one fails
    }
  }

  return urls
}
