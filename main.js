(() => {
  const C = window.HAYAH || {};
  const wa = (msg) => `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(msg || "Hello HayahLab, I'd like to talk about a project.")}`;
  document.querySelectorAll("[data-wa]").forEach((a) => (a.href = wa(a.dataset.wa)));
  document.querySelectorAll("[data-email]").forEach((a) => (C.email ? (a.href = "mailto:" + C.email) : a.remove()));
  document.querySelectorAll("[data-ig]").forEach((a) => (a.href = "https://instagram.com/" + C.instagram));

  // mobile nav
  const burger = document.querySelector(".burger"), menu = document.querySelector(".menu");
  if (burger) {
    burger.addEventListener("click", () => { const o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); } });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); } });
  }

  // live preview scaling
  const fit = () => document.querySelectorAll(".vp").forEach((v) => {
    const f = v.querySelector("iframe"); if (!f) return;
    const w = +f.dataset.w || 1280, h = +f.dataset.h || 800, s = v.clientWidth / w;
    f.style.width = w + "px"; f.style.height = h + "px"; f.style.transform = `scale(${s})`; v.style.height = h * s + "px"; v.style.aspectRatio = "auto";
  });
  addEventListener("resize", fit); addEventListener("load", fit); fit();

  // inquiry form
  const form = document.getElementById("inquiry"); if (!form) return;
  const T = {
    business: { types: ["Business website", "Landing page", "Property / real estate website", "Booking or ordering system", "Dashboard or management system", "Workflow automation", "Not sure yet"],
      ph: "What does your business do, and what should this project fix or improve? Who will use it?" },
    founder: { types: ["Product discovery & scoping", "MVP / web application", "Prototype or proof of concept", "Improving an existing product", "Not sure yet"],
      ph: "What is the idea, who is it for, and what would a successful first version let you learn?" },
  };
  let track = "business";
  const type = form.elements.type, msg = form.elements.message, tabs = document.querySelectorAll(".tab");
  const render = () => {
    type.innerHTML = '<option value="">Select…</option>' + T[track].types.map((t) => `<option>${t}</option>`).join("");
    msg.placeholder = T[track].ph; form.dataset.t = Date.now();
    tabs.forEach((b) => b.setAttribute("aria-selected", b.dataset.track === track));
  };
  tabs.forEach((b) => b.addEventListener("click", () => { track = b.dataset.track; render(); }));
  document.querySelectorAll("[data-track-link]").forEach((a) => a.addEventListener("click", () => { track = a.dataset.trackLink; render(); }));
  render();

  const status = document.getElementById("status");
  const show = (cls, html) => { status.className = "status show " + cls; status.innerHTML = html; status.focus(); };
  const rules = { name: (v) => !v.trim() && "Please enter your name.", email: (v) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && "Enter a valid email address.",
    type: (v) => !v && "Choose the closest project type.", message: (v) => v.trim().length < 20 && "Add a few more details (at least 20 characters).",
    budget: (v) => !v && "Pick a range, or “Not sure yet”.", timeline: (v) => !v && "Choose a timeline." };
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); status.className = "status"; let bad = null;
    Object.keys(rules).forEach((k) => {
      const el = form.elements[k], m = rules[k](el.value), er = document.getElementById("e-" + k);
      el.setAttribute("aria-invalid", !!m); er.textContent = m || ""; if (m && !bad) bad = el;
    });
    if (bad) return bad.focus();
    const btn = form.querySelector("button[type=submit]"); btn.disabled = true; btn.textContent = "Sending…";
    const data = Object.fromEntries(new FormData(form)); data.track = track; data.t = form.dataset.t;
    try {
      const r = await fetch("/api/inquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) { form.reset(); render(); show("ok", "Thank you — your inquiry was sent. You’ll get a reply by email, usually within two working days."); }
      else if (j.error === "not_configured") show("bad", `The form isn’t connected yet. Please <a class="link" href="${wa("Hello HayahLab, I'd like to discuss a project.")}">message on WhatsApp</a> instead.`);
      else show("bad", `We couldn’t send that. Please check your details or <a class="link" href="${wa("Hello HayahLab, my form didn't send. I'd like to discuss a project.")}">use WhatsApp</a>.`);
    } catch { show("bad", `Network problem — nothing was sent. Try again or <a class="link" href="${wa()}">use WhatsApp</a>.`); }
    btn.disabled = false; btn.textContent = "Send inquiry";
  });
})();
