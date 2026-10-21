// Vercel serverless function: POST /api/inquiry
// Sends the inquiry to your inbox through Resend. Secrets live in environment variables only.
const clean = (v, n) => String(v || "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });
  const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};

  // Spam protection: honeypot + minimum fill time
  if (b.website) return res.status(200).json({ ok: true });
  if (Date.now() - Number(b.t || 0) < 3000) return res.status(400).json({ ok: false, error: "Please try again." });

  const d = {
    track: clean(b.track, 20), name: clean(b.name, 100), email: clean(b.email, 150), org: clean(b.org, 120),
    type: clean(b.type, 80), message: clean(b.message, 3000), budget: clean(b.budget, 60), timeline: clean(b.timeline, 60),
  };
  if (!d.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email) || d.message.length < 20)
    return res.status(400).json({ ok: false, error: "Please complete the required fields." });

  const { RESEND_API_KEY, INQUIRY_TO_EMAIL, INQUIRY_FROM_EMAIL } = process.env;
  if (!RESEND_API_KEY || !INQUIRY_TO_EMAIL || !INQUIRY_FROM_EMAIL)
    return res.status(503).json({ ok: false, error: "not_configured" });

  const rows = [["Track", d.track], ["Name", d.name], ["Email", d.email], ["Business / startup", d.org || "-"], ["Project type", d.type],
    ["Budget", d.budget], ["Timeline", d.timeline]];
  const html = rows.map(([k, v]) => `<p><b>${k}:</b> ${esc(v)}</p>`).join("") + `<p><b>Message:</b><br>${esc(d.message).replace(/\n/g, "<br>")}</p>`;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: INQUIRY_FROM_EMAIL, to: [INQUIRY_TO_EMAIL], reply_to: d.email, subject: `New ${d.track} inquiry from ${d.name}`, html }),
    });
    if (!r.ok) return res.status(502).json({ ok: false, error: "send_failed" });
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({ ok: false, error: "send_failed" });
  }
}
