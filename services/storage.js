import cloudinary, { getCloudinaryCredentials } from '@/lib/cloudinary';

/**
 * File Storage & Upload Service (Cloudinary SDK Integration with fallback)
 * Handles PDF resume uploads, candidate avatars, and company logos.
 *
 * @param {File} file - File object to upload
 * @param {string} folder - Destination subfolder ('resumes', 'avatars', 'companies')
 * @param {object} [options] - Additional options (e.g. custom publicId)
 * @returns {Promise<{ success: boolean, url: string, publicId: string, size: number, format: string }>}
 */
export async function uploadFile(file, folder = 'resumes', options = {}) {
  if (!file) {
    throw new Error('No file provided');
  }

  const { cloudName, apiKey, apiSecret } = getCloudinaryCredentials();

  // Use Cloudinary official SDK when configured
  if (cloudName && apiKey && apiSecret) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mimeType = file.type || 'application/octet-stream';
      const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;

      // Determine resource type and transformations
      const isImage = mimeType.startsWith('image/');
      const resourceType = isImage ? 'image' : 'raw';

      const uploadOptions = {
        folder: `careerhub/${folder}`,
        resource_type: resourceType,
        overwrite: true,
        ...options,
      };

      if (isImage) {
        uploadOptions.quality = 'auto';
        uploadOptions.fetch_format = 'auto';

        if (folder === 'avatars') {
          uploadOptions.transformation = [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' },
          ];
        } else if (folder === 'companies') {
          uploadOptions.transformation = [
            { width: 1200, height: 800, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' },
          ];
        }
      }

      const result = await cloudinary.uploader.upload(base64Data, uploadOptions);

      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        size: result.bytes || file.size,
        format: result.format || file.name.split('.').pop() || 'pdf',
      };
    } catch (error) {
      console.warn('Cloudinary SDK upload failed, attempting fallback:', error);
    }
  }

  // Fallback: Base64 Data URL
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const mimeType = file.type || 'application/pdf';
  const base64 = buffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64}`;

  return {
    success: true,
    url: dataUrl,
    publicId: `local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    size: file.size,
    format: file.name.split('.').pop() || 'pdf',
  };
}

/**
 * Deletes a file from Cloudinary given its publicId.
 *
 * @param {string} publicId - The public ID of the resource to delete
 * @param {string} [resourceType='image'] - Resource type ('image', 'raw', 'video')
 * @returns {Promise<{ success: boolean, result?: string, error?: string }>}
 */
export async function deleteFile(publicId, resourceType = 'image') {
  if (!publicId || publicId.startsWith('local_')) {
    return { success: true };
  }

  const { cloudName, apiKey, apiSecret } = getCloudinaryCredentials();

  if (!cloudName || !apiKey || !apiSecret) {
    return { success: true };
  }

  try {
    let res = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    if (res.result !== 'ok' && resourceType === 'image') {
      // Retry with 'raw' resource_type if 'image' destroy didn't match (e.g. for raw PDFs)
      res = await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    }
    return { success: true, result: res.result };
  } catch (error) {
    console.error('Cloudinary destroy error:', error);
    return { success: false, error: error.message };
  }
}
