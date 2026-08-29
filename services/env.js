/**
 * Environment variable validation service.
 * Validates that required environment variables are present at startup.
 * Import this in server-side code to ensure env vars are configured.
 */

const requiredServerEnvVars = [
  'AUTH_SECRET',
];

const optionalServerEnvVars = [
  'DATABASE_URL',
  'AUTH_GOOGLE_ID',
  'AUTH_GOOGLE_SECRET',
  'AUTH_GITHUB_ID',
  'AUTH_GITHUB_SECRET',
];

const requiredPublicEnvVars = [];

const optionalPublicEnvVars = [
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_APP_NAME',
];

/**
 * Validates that all required environment variables are set.
 * Logs warnings for optional variables that are missing.
 */
export function validateEnv() {
  const missing = [];
  const warnings = [];

  for (const envVar of requiredServerEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  for (const envVar of requiredPublicEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  for (const envVar of optionalServerEnvVars) {
    if (!process.env[envVar]) {
      warnings.push(envVar);
    }
  }

  for (const envVar of optionalPublicEnvVars) {
    if (!process.env[envVar]) {
      warnings.push(envVar);
    }
  }

  if (warnings.length > 0) {
    console.warn(
      `⚠️  Optional environment variables not set: ${warnings.join(', ')}`
    );
  }

  if (missing.length > 0) {
    console.error(
      `❌ Missing required environment variables: ${missing.join(', ')}`
    );
    console.error('Please check your .env.local file.');
  }

  return { valid: missing.length === 0, missing, warnings };
}

/**
 * Gets a required environment variable or throws.
 */
export function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Gets an optional environment variable with a fallback.
 */
export function getOptionalEnv(name, fallback = '') {
  return process.env[name] || fallback;
}
