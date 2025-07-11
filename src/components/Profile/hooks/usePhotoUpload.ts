import { useState, useCallback } from 'react'
import { takePicture } from '../../Files'
import { resizeImage } from '../utils/imageResize'
import { IMAGE_CONFIG, ERROR_MESSAGES } from '../constants'

export const usePhotoUpload = (onUpload: (image: any) => void) => {
  const [isUploading, setIsUploading] = useState(false)

  const uploadPhoto = useCallback(async () => {
    try {
      setIsUploading(true)
      const photo = await takePicture()
      
      if (photo.dataUrl) {
        const resized = await resizeImage(
          photo.dataUrl,
          IMAGE_CONFIG.MAX_WIDTH,
          IMAGE_CONFIG.MAX_HEIGHT
        )
        
        onUpload({
          dataUrl: resized,
          format: IMAGE_CONFIG.FORMAT
        })
      }
    } catch (error) {
      console.error(ERROR_MESSAGES.UPLOAD_ERROR, error)
    } finally {
      setIsUploading(false)
    }
  }, [onUpload])

  return { uploadPhoto, isUploading }
}