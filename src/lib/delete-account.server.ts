import { createClient } from "@supabase/supabase-js";

export function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export class DeleteAccountError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "DeleteAccountError";
    this.status = status;
  }
}

export async function deleteAccountByCredentials(
  email: string,
  password: string,
): Promise<{ userId: string }> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publishableKey) {
    throw new DeleteAccountError("Account deletion is not configured on the server.", 503);
  }

  const authClient = createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const normalizedEmail = email.trim().toLowerCase();
  const { data, error } = await authClient.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error || !data.user) {
    throw new DeleteAccountError("Invalid email or password.", 401);
  }

  if (data.user.email?.toLowerCase() !== normalizedEmail) {
    throw new DeleteAccountError("Email does not match the authenticated account.", 403);
  }

  const userId = data.user.id;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Explicit cleanup before auth delete (profiles/briefs also cascade from auth.users)
  await supabaseAdmin.from("metrics").delete().eq("user_id", userId);
  await supabaseAdmin.from("priorities").delete().eq("user_id", userId);
  await supabaseAdmin.from("briefs").delete().eq("user_id", userId);
  await supabaseAdmin.from("profiles").delete().eq("id", userId);

  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (deleteError) {
    throw new DeleteAccountError(deleteError.message, 500);
  }

  return { userId };
}
