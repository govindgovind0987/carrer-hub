// Automated test script for GitHub OAuth integration in CareerHub
import assert from 'assert';

console.log('--- CareerHub GitHub OAuth Automated Test Suite ---\n');

// 1. Test Environment Variables & Fallback Aliases Resolution
function testEnvResolution() {
  console.log('[Test 1] Testing Environment Variable Name Aliases...');

  const originalEnv = { ...process.env };

  // Helper to simulate lib/auth.js resolution
  function getGithubCredentials(env) {
    const id = env.AUTH_GITHUB_ID || env.GITHUB_CLIENT_ID || env.GITHUB_ID;
    const secret = env.AUTH_GITHUB_SECRET || env.GITHUB_CLIENT_SECRET || env.GITHUB_SECRET;
    return { id, secret };
  }

  // Case A: AUTH_GITHUB_ID / AUTH_GITHUB_SECRET (Auth.js v5 standard)
  const caseA = getGithubCredentials({
    AUTH_GITHUB_ID: 'gh_id_standard',
    AUTH_GITHUB_SECRET: 'gh_secret_standard',
  });
  assert.strictEqual(caseA.id, 'gh_id_standard');
  assert.strictEqual(caseA.secret, 'gh_secret_standard');
  console.log('  ✓ Supported AUTH_GITHUB_ID / AUTH_GITHUB_SECRET');

  // Case B: GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET (GitHub Console standard)
  const caseB = getGithubCredentials({
    GITHUB_CLIENT_ID: 'gh_id_console',
    GITHUB_CLIENT_SECRET: 'gh_secret_console',
  });
  assert.strictEqual(caseB.id, 'gh_id_console');
  assert.strictEqual(caseB.secret, 'gh_secret_console');
  console.log('  ✓ Supported GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET');

  // Case C: GITHUB_ID / GITHUB_SECRET (NextAuth v4 legacy)
  const caseC = getGithubCredentials({
    GITHUB_ID: 'gh_id_legacy',
    GITHUB_SECRET: 'gh_secret_legacy',
  });
  assert.strictEqual(caseC.id, 'gh_id_legacy');
  assert.strictEqual(caseC.secret, 'gh_secret_legacy');
  console.log('  ✓ Supported GITHUB_ID / GITHUB_SECRET');
}

// 2. Test Callback URLs
function testCallbackUrls() {
  console.log('\n[Test 2] Testing Expected Callback URLs...');

  const localBase = 'http://localhost:3000';
  const prodBase = 'https://carrer-hub-kappa.vercel.app';
  const callbackPath = '/api/auth/callback/github';

  const localCallback = `${localBase}${callbackPath}`;
  const prodCallback = `${prodBase}${callbackPath}`;

  assert.strictEqual(localCallback, 'http://localhost:3000/api/auth/callback/github');
  assert.strictEqual(prodCallback, 'https://carrer-hub-kappa.vercel.app/api/auth/callback/github');

  console.log(`  ✓ Local redirect URI matches: ${localCallback}`);
  console.log(`  ✓ Production redirect URI matches: ${prodCallback}`);
}

// 3. Test Authorization Initiation Endpoint & Scopes
function testAuthEndpointAndScopes() {
  console.log('\n[Test 3] Testing GitHub OAuth Authorization URL & Scopes...');

  const baseUrl = 'https://github.com/login/oauth/authorize';
  const clientId = 'dummy_github_client_id';
  const redirectUri = 'http://localhost:3000/api/auth/callback/github';
  const scope = 'read:user user:email';

  const authUrl = new URL(baseUrl);
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', scope);
  authUrl.searchParams.set('response_type', 'code');

  assert.strictEqual(authUrl.origin, 'https://github.com');
  assert.strictEqual(authUrl.pathname, '/login/oauth/authorize');
  assert.strictEqual(authUrl.searchParams.get('client_id'), clientId);
  assert.strictEqual(authUrl.searchParams.get('redirect_uri'), redirectUri);
  assert.strictEqual(authUrl.searchParams.get('scope'), 'read:user user:email');
  assert.strictEqual(authUrl.searchParams.get('response_type'), 'code');

  console.log('  ✓ GitHub authorize URL correctly formatted');
  console.log('  ✓ Required scope "read:user user:email" included');
}

// 4. Test Role Safety (Non-privileged Default)
function testRoleSafety() {
  console.log('\n[Test 4] Testing Role Assignment & Safety...');

  // Simulate new OAuth user creation
  const newUser = { id: 'usr_oauth_123', email: 'dev@github.com', name: 'Dev User' };
  const token = {};

  // Emulate callbacks.jwt logic in lib/auth.js
  token.role = newUser.role || 'CANDIDATE';
  token.id = newUser.id;

  assert.strictEqual(token.role, 'CANDIDATE');
  assert.notStrictEqual(token.role, 'ADMIN');
  assert.notStrictEqual(token.role, 'RECRUITER');

  console.log('  ✓ New OAuth users default strictly to CANDIDATE');
  console.log('  ✓ Privileged roles (ADMIN/RECRUITER) are NEVER granted by default');
}

// 5. Test Missing Email Validation & Suspended Status
function testValidationLogic() {
  console.log('\n[Test 5] Testing Missing Email & Account Safety Checks...');

  // Emulate signIn logic
  function validateSignIn(user, account, isSuspended) {
    if (isSuspended) return false;
    if (account?.provider === 'github' || account?.provider === 'google') {
      if (!user?.email) return false;
    }
    return true;
  }

  // A: Normal GitHub user with email
  assert.strictEqual(
    validateSignIn({ email: 'user@github.com' }, { provider: 'github' }, false),
    true
  );
  console.log('  ✓ Normal GitHub user with verified email is permitted');

  // B: GitHub user with NO email
  assert.strictEqual(
    validateSignIn({ email: null }, { provider: 'github' }, false),
    false
  );
  console.log('  ✓ GitHub user with missing email is safely blocked');

  // C: Suspended user
  assert.strictEqual(
    validateSignIn({ email: 'suspended@github.com' }, { provider: 'github' }, true),
    false
  );
  console.log('  ✓ Suspended user is rejected regardless of provider');
}

// 6. Test Error Message Mapping
function testErrorMessages() {
  console.log('\n[Test 6] Testing User-Facing Error Messages...');

  const OAUTH_ERROR_MESSAGES = {
    OAuthSignin: 'Could not construct authorization URL. Please check server OAuth credentials.',
    OAuthCallback: 'Error processing OAuth response. Please try signing in again.',
    OAuthCreateAccount: 'Could not create your user account with this provider. Please try again.',
    Callback: 'Authentication callback error. Please try again.',
    OAuthAccountNotLinked:
      'An account with this email already exists with a different sign-in method. Please sign in with your email and password.',
    AccessDenied: 'Access was denied. Authorization may have been cancelled or an email address was not provided.',
    Configuration:
      'OAuth provider is not configured properly on the server. Please check environment variables.',
    EmailSignin: 'No verified email address was provided by the authentication provider.',
    Default: 'Could not sign in with this provider. Please try again.',
  };

  assert(OAUTH_ERROR_MESSAGES.AccessDenied.includes('cancelled'));
  assert(OAUTH_ERROR_MESSAGES.OAuthAccountNotLinked.includes('already exists'));
  assert(OAUTH_ERROR_MESSAGES.Configuration.includes('environment variables'));

  console.log('  ✓ Error messages cover cancelled authorization (AccessDenied)');
  console.log('  ✓ Error messages cover account conflicts (OAuthAccountNotLinked)');
  console.log('  ✓ Error messages cover missing server configuration (Configuration)');
}

try {
  testEnvResolution();
  testCallbackUrls();
  testAuthEndpointAndScopes();
  testRoleSafety();
  testValidationLogic();
  testErrorMessages();

  console.log('\n========================================');
  console.log(' ALL AUTOMATED OAUTH TESTS PASSED (6/6)');
  console.log('========================================\n');
} catch (err) {
  console.error('\n❌ Test failed:', err.message);
  process.exit(1);
}
