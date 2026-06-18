import { supabase } from "@/integrations/supabase/client";

type WaitlistEmailType = "welcome" | "invite";

/** Fire-and-forget — never blocks signup if email fails. */
export async function sendWaitlistEmail(
  email: string,
  full_name: string | null,
  type: WaitlistEmailType = "welcome",
) {
  try {
    const { error } = await supabase.functions.invoke("send-waitlist-email", {
      body: { email, full_name, type },
    });
    if (error) console.warn("[waitlist email]", error.message);
  } catch (err) {
    console.warn("[waitlist email]", err);
  }
}
