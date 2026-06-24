export function appGeminiKey(): string | undefined {
  return process.env.APP_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
}

export function appAdminEmail(): string | undefined {
  return process.env.APP_ADMIN_EMAIL || process.env.ADMIN_EMAIL;
}

export function appAdminPassword(): string | undefined {
  return process.env.APP_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
}

export function appJwtSecret(): string {
  return (
    process.env.APP_JWT_SECRET ||
    process.env.JWT_SECRET ||
    "founderbrief-dev-secret-change-in-production"
  );
}
