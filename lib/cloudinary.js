import { v2 as cloudinary } from 'cloudinary';

/**
 * Resolves Cloudinary credentials from process.env with flexible variable support
 * (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_URL, etc.)
 */
export function getCloudinaryCredentials() {
  let cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD;
  let apiKey =
    process.env.CLOUDINARY_API_KEY ||
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  let apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (process.env.CLOUDINARY_URL) {
    try {
      // cloudinary://api_key:api_secret@cloud_name
      const parsed = new URL(process.env.CLOUDINARY_URL);
      apiKey = apiKey || parsed.username;
      apiSecret = apiSecret || parsed.password;
      cloudName = cloudName || parsed.hostname;
    } catch (e) {
      // Ignore URL parse error
    }
  }

  return { cloudName, apiKey, apiSecret };
}

// Automatically configure Cloudinary SDK
const { cloudName, apiKey, apiSecret } = getCloudinaryCredentials();

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

/**
 * Checks whether Cloudinary credentials are fully configured and valid.
 * @returns {Promise<{ isConfigured: boolean, cloudName?: string, status?: string, error?: string }>}
 */
export async function verifyCloudinaryConnection() {
  const { cloudName, apiKey, apiSecret } = getCloudinaryCredentials();

  if (!cloudName || !apiKey || !apiSecret) {
    return {
      isConfigured: false,
      error:
        'Cloudinary environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are incomplete.',
    };
  }

  try {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    const pingResult = await cloudinary.api.ping();
    return {
      isConfigured: true,
      cloudName,
      status: pingResult?.status || 'ok',
    };
  } catch (error) {
    return {
      isConfigured: true,
      cloudName,
      error: error?.message || 'Failed to ping Cloudinary API',
    };
  }
}

export default cloudinary;
