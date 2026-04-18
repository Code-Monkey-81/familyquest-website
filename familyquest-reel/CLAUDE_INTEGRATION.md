# FamilyQuest Demo Reel — Integration Guide for Claude (VS Code)

Hi Claude! You're helping integrate a short vertical demo-reel animation into an existing FamilyQuest landing page. Everything you need is in the `familyquest-reel/` folder of this repo. Please follow the steps below **exactly**.

---

## What you have

A self-contained 9:16 HTML animation (45 s, auto-loop, no controls) built with React + inline Babel:

```
familyquest-reel/
├── index.html        ← entry point (loads React, Babel, animations, scenes)
├── animations.jsx    ← Stage / Sprite / easing engine (DO NOT EDIT)
├── scenes.jsx        ← the scenes themselves (edit here if copy changes)
└── assets/
    ├── icon.png      ← chest illustration used in intro & CTA scenes
    └── logo.png      ← brand logo
```

The reel runs in its own iframe. It is completely self-contained — no build step, no npm install, no bundler. Just static files.

---

## Task

Embed the reel **in the header area** of the existing landing page (the one the user already has in this repo — you'll need to locate the hero / header section yourself).

### Placement rules

- The reel is **vertical 9:16** — treat it like a phone-shaped video, not a banner.
- On **desktop**: place it next to or near the headline, max width **~420 px**, centered within its column.
- On **mobile**: full width with side padding, max width **~340 px**, centered.
- The reel background is **cream `#FBF7EF`** — blend the container into the surrounding section if the page background differs, or keep the cream as a deliberate "card."
- Add a soft shadow + rounded corners (`border-radius: 24–28px`) so it reads as a premium asset, not a raw iframe.
- **Never** let the browser render scrollbars inside the iframe. Use `scrolling="no"` and a fixed `aspect-ratio: 9 / 16`.

### Integration steps

1. **Move the folder** into the web root of the landing page (e.g. `public/familyquest-reel/` for Next.js, `static/familyquest-reel/` for Gatsby/Hugo, or `/familyquest-reel/` at the site root for plain HTML). Preserve the folder structure — `index.html`, `animations.jsx`, `scenes.jsx`, and `assets/` must stay siblings.

2. **Find the landing page's hero / header component**. Look for the main headline ("Family Quest", "Coming Soon", or similar). If the site uses a framework (Next, Astro, SvelteKit, etc.), this will usually be in `app/page.tsx`, `src/routes/+page.svelte`, `pages/index.*`, or similar.

3. **Add the iframe embed** inside the hero, next to the headline / CTA block. Use this exact markup (adapt JSX/template syntax as needed for the framework):

   ```html
   <div class="fq-reel">
     <iframe
       class="fq-reel__frame"
       src="/familyquest-reel/index.html"
       title="FamilyQuest Demo Reel"
       loading="lazy"
       allow="autoplay"
       scrolling="no"
     ></iframe>
   </div>
   ```

4. **Add the CSS** (scoped to the landing page's stylesheet, or inline in a `<style>` block — match the project's existing conventions):

   ```css
   .fq-reel {
     display: flex;
     justify-content: center;
     align-items: center;
     width: 100%;
   }
   .fq-reel__frame {
     width: 100%;
     max-width: 420px;
     aspect-ratio: 9 / 16;
     border: 0;
     border-radius: 28px;
     box-shadow:
       0 1px 2px rgba(20, 16, 10, 0.06),
       0 12px 40px -8px rgba(20, 16, 10, 0.18);
     background: #FBF7EF;
     display: block;
   }
   @media (max-width: 640px) {
     .fq-reel__frame { max-width: 340px; border-radius: 22px; }
   }
   ```

5. **Adjust the `src` path** if the framework serves static assets from a non-root path (e.g. `/static/familyquest-reel/index.html`).

6. **Verify locally**: run the dev server, confirm the reel autoplays, loops silently, and shows no scrollbar or playback bar. The intro (chest + "Family Quest") should appear within ~1 s.

---

## Framework-specific notes

- **Next.js / Vite / CRA**: put the folder in `public/`. Reference it as `/familyquest-reel/index.html`.
- **Astro / SvelteKit / Nuxt**: put the folder in the project's static/public directory (`public/`, `static/`).
- **Hugo**: `static/familyquest-reel/`.
- **Plain HTML site**: put the folder next to the main `index.html`.
- **WordPress / CMS**: upload the folder to the theme's asset directory or `/wp-content/uploads/` and reference the absolute URL.

---

## What to avoid

- ❌ Do **not** inline the reel's JSX into the landing page itself. It must run isolated in its own iframe to avoid React version clashes and global style leaks.
- ❌ Do **not** edit `animations.jsx`. It's a stable engine.
- ❌ Do **not** remove `allow="autoplay"` — the reel relies on it.
- ❌ Do **not** add audio or controls — this is a silent ambient loop.
- ❌ Do **not** set `width`/`height` attributes on the iframe — use CSS `aspect-ratio` instead so it stays responsive.

---

## If the user wants copy changes later

Copy/scene edits live in `familyquest-reel/scenes.jsx`. Search for the German strings (e.g. `"Kein Bock."`, `"Gleich."`, `"Quests abhaken."`) and replace in place. No rebuild required — just refresh the page.

---

## Success criteria

- [ ] Reel loads in the hero, centered, 9:16 aspect, rounded corners, soft shadow.
- [ ] Autoplays silently on page load, loops forever.
- [ ] No playback bar, no scrollbars, no horizontal overflow.
- [ ] Responsive: shrinks gracefully on mobile, doesn't dominate the fold.
- [ ] Lighthouse / PageSpeed: no major regressions (iframe is lazy-loaded).

That's it. Drop the folder in, add the iframe + CSS, ship it. 🚀
