import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL =
  Deno.env.get("WAITLIST_FROM_EMAIL") ?? "FounderBrief <onboarding@resend.dev>";
const APP_URL = Deno.env.get("APP_URL") ?? "https://founderbrief.com";

type EmailType = "welcome" | "invite";

type Payload = {
  type?: EmailType;
  email?: string;
  full_name?: string | null;
  record?: {
    email?: string;
    full_name?: string | null;
  };
};

function firstName(fullName: string | null | undefined): string {
  if (!fullName?.trim()) return "there";
  return fullName.trim().split(/\s+/)[0] ?? "there";
}

function welcomeHtml(name: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; color: #1a1a1a; line-height: 1.65;">
      <p style="font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; color: #666;">FounderBrief</p>
      <h1 style="font-size: 28px; line-height: 1.2; margin: 16px 0 12px;">You're on the waitlist</h1>
      <p>Hi ${name},</p>
      <p>Thanks for joining the FounderBrief waitlist. We're rolling out early access in small batches — you'll get an email from us as soon as a spot opens for you.</p>
      <p>Until then, one calm brief every Monday is almost yours.</p>
      <p style="color: #666; font-size: 14px; margin-top: 32px;">— The FounderBrief team</p>
    </div>
  `;
}

function inviteHtml(name: string, appUrl: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; color: #1a1a1a; line-height: 1.65;">
      <p style="font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; color: #666;">FounderBrief</p>
      <h1 style="font-size: 28px; line-height: 1.2; margin: 16px 0 12px;">You're in — early access is ready</h1>
      <p>Hi ${name},</p>
      <p>Your spot on FounderBrief is ready. Create your account and ship your first weekly brief:</p>
      <p><a href="${appUrl}/auth" style="display: inline-block; background: #1a1a1a; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 600;">Get started</a></p>
      <p style="color: #666; font-size: 14px; margin-top: 32px;">— The FounderBrief team</p>
    </div>
  `;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set");
    return new Response(JSON.stringify({ error: "Email service not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json()) as Payload;
    const type: EmailType = body.type ?? "welcome";
    const email = (body.email ?? body.record?.email)?.trim().toLowerCase();
    const full_name = body.full_name ?? body.record?.full_name ?? null;

    if (!email) {
      return new Response(JSON.stringify({ error: "Missing email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const name = firstName(full_name);
    const subject =
      type === "invite"
        ? "You're in — FounderBrief early access"
        : "You're on the FounderBrief waitlist";
    const html = type === "invite" ? inviteHtml(name, APP_URL) : welcomeHtml(name);

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject,
        html,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error("Resend error:", resendRes.status, errText);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await resendRes.json();
    return new Response(JSON.stringify({ ok: true, id: result.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-waitlist-email error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
