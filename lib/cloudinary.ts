import { v2 as cloudinary } from 'cloudinary'
import { getConfig } from './config'

async function getCloudinary() {
  const [cloud_name, api_key, api_secret] = await Promise.all([
    getConfig('CLOUDINARY_CLOUD_NAME'),
    getConfig('CLOUDINARY_API_KEY'),
    getConfig('CLOUDINARY_API_SECRET'),
  ])
  cloudinary.config({ cloud_name, api_key, api_secret })
  return cloudinary
}

export async function uploadToCloudinary(
  filePath: string,
  folder = 'portfolio',
  options: { alt?: string; tags?: string[] } = {}
) {
  const cl = await getCloudinary()
  const result = await cl.uploader.upload(filePath, { folder, ...options })
  return {
    publicId: result.public_id,
    url: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
  }
}

export async function deleteFromCloudinary(publicId: string) {
  const cl = await getCloudinary()
  await cl.uploader.destroy(publicId)
}
