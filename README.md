# FounderBrief

AI PRD and build-plan generator. Public site: https://founderbreif.vercel.app

## Google Search Console

Set `VITE_GSC_VERIFICATION` to the token from Search Console’s HTML tag method (the `content` value only, not the whole meta tag).

The root layout renders `<meta name="google-site-verification">` only when that variable is non-empty. It is a public `VITE_` variable, so add it in Vercel (Production and Preview) and redeploy. A build without the variable ships no verification tag.
