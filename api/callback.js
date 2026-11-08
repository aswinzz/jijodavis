// Step 2 of the editor sign-in: GitHub sends the user back here with a code.
// We swap it for an access token and hand that to the editor window that
// opened this popup (the standard Netlify/Decap/Sveltia CMS handshake).

const page = (origin, status, payload) => `<!doctype html>
<html><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Signing in…</title></head>
<body style="font-family:system-ui;padding:2rem">
<p>${status === "success" ? "Signed in. This window will close." : "Sign-in failed. Close this window and try again."}</p>
<script>
(function () {
  var origin = ${JSON.stringify(origin)};
  var message = "authorization:github:${status}:" + ${JSON.stringify(JSON.stringify(payload)).replace(/</g, "\\u003c")};
  function receive(e) {
    if (e.origin !== origin) return;
    window.removeEventListener("message", receive);
    window.opener.postMessage(message, origin);
  }
  if (!window.opener) return;
  window.addEventListener("message", receive);
  window.opener.postMessage("authorizing:github", origin);
})();
</script></body></html>`;

const readCookie = (req, name) =>
  (req.headers.cookie || "")
    .split(";")
    .map((c) => c.trim().split("="))
    .find(([k]) => k === name)?.[1];

export default async function handler(req, res) {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const origin = `https://${host}`;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Set-Cookie", "jd_oauth_state=; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=0");

  const { code, state, error } = req.query;
  if (error || !code) {
    res.status(400).send(page(origin, "error", { message: String(error || "No code from GitHub") }));
    return;
  }
  if (!state || state !== readCookie(req, "jd_oauth_state")) {
    res.status(400).send(page(origin, "error", { message: "Sign-in expired. Please try again." }));
    return;
  }

  try {
    const r = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${origin}/api/callback`,
      }),
    });
    const data = await r.json();
    if (!data.access_token) throw new Error(data.error_description || data.error || "No token");
    res.status(200).send(page(origin, "success", { token: data.access_token, provider: "github" }));
  } catch (e) {
    res.status(500).send(page(origin, "error", { message: e.message }));
  }
}
