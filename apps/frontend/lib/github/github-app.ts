import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";

const GITHUB_APP_ID = process.env.GITHUB_APP_ID;
const GITHUB_PRIVATE_KEY = process.env.GITHUB_PRIVATE_KEY;

console.log("[DEBUG] GITHUB_APP_ID:", GITHUB_APP_ID);
console.log("[DEBUG] GITHUB_APP_SLUG:", process.env.GITHUB_APP_SLUG);

if (!GITHUB_APP_ID || !GITHUB_PRIVATE_KEY) {
  console.warn(
    "Missing required GitHub App environment variables - GitHub App functionality will be disabled"
  );
}

// Personal token mode helpers (used in local development)
export const IS_PRODUCTION =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "production";
export const PERSONAL_GITHUB_TOKEN =
  process.env.GITHUB_PERSONAL_ACCESS_TOKEN || process.env.GITHUB_TOKEN;
export const FORCE_GITHUB_APP =
  process.env.NEXT_PUBLIC_FORCE_GITHUB_APP?.toLowerCase() === "true";

export function isPersonalTokenMode(): boolean {
  // If forcing GitHub App usage, always use GitHub App mode
  if (FORCE_GITHUB_APP) {
    return false;
  }
  return !IS_PRODUCTION && !!PERSONAL_GITHUB_TOKEN;
}

export function createPersonalOctokit(): Octokit {
  if (!PERSONAL_GITHUB_TOKEN) {
    throw new Error("Personal GitHub token not configured");
  }
  // Use Bearer format for fine-grained tokens
  return new Octokit({ 
    auth: PERSONAL_GITHUB_TOKEN,
    request: {
      headers: {
        authorization: `Bearer ${PERSONAL_GITHUB_TOKEN}`,
      },
    },
  });
}

/**
 * Create an Octokit instance authenticated as a GitHub App installation
 */
export async function createInstallationOctokit(
  installationId: string
): Promise<Octokit> {
  if (!GITHUB_APP_ID || !GITHUB_PRIVATE_KEY) {
    throw new Error("GitHub App not configured");
  }

  const auth = createAppAuth({
    appId: GITHUB_APP_ID,
    privateKey: GITHUB_PRIVATE_KEY.replace(/\\n/g, "\n"), // Handle escaped newlines
    installationId,
  });

  const { token } = await auth({ type: "installation" });

  return new Octokit({
    auth: token,
  });
}

/**
 * Generate GitHub App installation URL
 */
export function getGitHubAppInstallationUrl() {
  const appSlug = process.env.GITHUB_APP_SLUG;
  console.log("[DEBUG] GITHUB_APP_SLUG:", appSlug); // Debug temporário
  if (!appSlug) {
    throw new Error("GITHUB_APP_SLUG environment variable is required");
  }

  return `https://github.com/apps/${appSlug}/installations/new`;
}
