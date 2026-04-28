// Cloudinary has been removed. All uploads use local filesystem storage.
// If you see this error, a code path still references this module.
export function uploadToCloudinary(): never {
  throw new Error('Cloudinary is not configured. Use local storage instead.')
}
export function deleteFromCloudinary(): never {
  throw new Error('Cloudinary is not configured. Use local storage instead.')
}
