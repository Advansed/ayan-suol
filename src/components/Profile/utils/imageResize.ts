export const resizeImage = (
  base64: string, 
  maxWidth: number, 
  maxHeight: number
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = base64
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      
      let { width, height } = img
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width *= ratio
        height *= ratio
      }
      
      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)
      
      resolve(canvas.toDataURL('image/jpeg', 0.9))
    }
  })
}
