// Step 1 of the editor sign-in: send the user to GitHub to approve access.
// Needs GITHUB_CLIENT_ID (and GITHUB_CLIENT_SECRET for step 2) set in Vercel.
import { randomBytes } from "node:crypto";

export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    res.status(500).send("Sign-in isn't set up yet: add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in Vercel → Settings → Environment Variables.");
    return;
  }
  const state = randomBytes(16).toString("hex");
  const scope = req.query.scope === "public_repo" ? "public_repo" : "repo";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const redirect = `https://${host}/api/callback`;

  res.setHeader("Set-Cookie", `jd_oauth_state=${state}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
  res.redirect(
    302,
    `https://github.com/login/oauth/authorize?${new URLSearchParams({ client_id: clientId, redirect_uri: redirect, scope, state })}`
  );
}
