# Abhilash Shah — Portfolio

Personal portfolio of **Abhilash Shah**, a B.Tech Computer Science student at VIT Bhopal University (class of 2028) and full-stack engineer looking for **Software Engineer (SDE)**, **Forward Deployed Engineer (FDE)** and **AI/ML** roles.

## Tech stack

A hand-built static site in plain **HTML, CSS and JavaScript**, with no framework, no libraries and no build step.

| File | What it does |
|---|---|
| `index.html` | All page content and sections |
| `styles.css` | Bluish-green theme (CSS variables), layout (Grid/Flexbox), animations and the phone/tablet layouts |
| `main.js` | Loader, scroll reveals, counters, phone menu, ink-pen cursor trail, magnetic buttons and the project mocks (CartSense, MeriYatra) |
| `assets/` | Photos (WebP with transparent backgrounds) and résumé PDF |

Fonts come from Google Fonts: Bricolage Grotesque, Caveat, Kalam and JetBrains Mono.

## What's on the page

- **Loading screen:** "Abhilash" is written out by hand on a blank paper page, then wipes away.
- **Hero:** my photo with handwritten notes on both sides (college, roles, highlights) and my name in big letters underneath.
- **About:** a cut-out photo, a short intro, animated stats, and links to LinkedIn, GitHub, Instagram, email and my résumé.
- **What I bring:** SDE, FDE and AI/ML cards.
- **Projects:**
  1. **VIT Bhopal Sports Facilities.** My main project: a booking and access system live at VIT Bhopal with 1,000+ real users, built with Next.js, Hono, Supabase (Postgres RLS) and Vitest.
  2. **CartSense.** An explainable ML recommendation engine for a video game store, trained on 814K real Amazon reviews. A hybrid of ALS, item-kNN, TF-IDF and popularity is re-ranked by XGBoost LambdaMART (+39% NDCG@10 over the best single model), served through FastAPI with a React storefront. Shown with an animated "Recommended for you / Why this?" mock.
  3. **MeriYatra.** Real-time public-transit tracking with sub-100 ms WebSocket updates and OSRM ETAs, shown with an animated live-map mock.
  4. **More things I've built:** HPL Auction, Meetly, Gesture Vision, DevScope, TaskFlow, plus svh-2026, Innovit-2026, WanderLust and VaccineRush.
- **Skills, experience and certificates:** a timeline plus animated certificate cards that fly in and get stamped "verified".
- **Contact.**

### Interactions

- An ink-pen trail follows the mouse and magnetic buttons pull toward it. Both are mouse-only, so touch devices are unaffected.
- The layout works on phones (320 px and up), tablets and laptops.
- Animations are turned off for visitors who enable "reduce motion" on their device.

## Run locally

```bash
python -m http.server 5173
```

Then open http://localhost:5173.

## Deploy

No build step is needed, so any static host works:

- **GitHub Pages:** in **Settings → Pages**, deploy from the `main` branch, folder `/ (root)`.
- **Vercel / Netlify:** import the repo, leave the build command empty, and set the output directory to the repo root.

## Contact

- Email: abhilashshah2006@gmail.com
- LinkedIn: [abhilash-shah-a46613369](https://www.linkedin.com/in/abhilash-shah-a46613369)
- GitHub: [shahabhilash](https://github.com/shahabhilash)
- Instagram: [@abhilash_._18](https://www.instagram.com/abhilash_._18/)
