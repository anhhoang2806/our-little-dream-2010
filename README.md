# Our Little Dream ❤️

> *Nhà mình, hoa và những giấc mơ nhỏ.* An interactive, mobile-first animated love letter for Vietnamese Women's Day (20/10), from a husband and his son, Chít.

**Live:** https://anhhoang2806.github.io/our-little-dream-2010/

## The experience (≈ 60–120 s)

| # | Scene | Interaction |
|---|-------|-------------|
| 1 | **A little surprise 💌**: dreamy sky, floating petals, a sealed envelope | Tap → envelope opens, warm light, hearts & swirling petals |
| 2 | **Every touch makes a flower bloom 🌸** | Tap / multi-touch / drag trails bloom roses, daisies, tulips, cherry blossoms & wildflowers. After ~10 touches the flowers gather into a heart with a secret message |
| 3 | **Our little family 👨‍👩‍👦**: illustrated Bố, Mẹ and Chít in a sunny garden (blinking, breathing, waving, ✌️) | Tap the family → group hug, hearts and glow |
| 4 | **Our little dream: Mazda 2 🚗**: road appears, the car drives in, flowers bloom, the family appears | Tap the car → headlights, hearts, the car rolls forward |
| 5 | **Happy Vietnamese Women's Day ❤️**: the greeting is revealed word by word | Save a real PNG keepsake card · share (Web Share API, copy-link fallback) · replay |

Music is an original, generative piano lullaby synthesised in the browser with the Web Audio API (no audio files, no copyrighted music). It starts only after the first tap and has a mute button.

## Edit the words

All text and character colours live in [`src/config/content.ts`](src/config/content.ts). The main greeting must stay exactly:

> Chúc vợ yêu ngày 20/10 vui vẻ, hạnh phúc bên chồng và Chít!

## Develop

```bash
npm install
npm run dev          # http://localhost:5173/our-little-dream-2010/
npm run build        # production build → dist/
npm run preview      # serve the build on :4173
```

Tip: `?scene=0…4` jumps straight to a scene.

## QA, QR code & printable card

These scripts use `puppeteer-core` with a locally installed Edge or Chrome:

```bash
npm run qa -- http://localhost:4173/our-little-dream-2010/ qa-shots   # end-to-end touch test + screenshots
npm run qr -- https://anhhoang2806.github.io/our-little-dream-2010/    # deliverables/qr-code.png + .svg (verified by decoding)
npm run card -- https://anhhoang2806.github.io/our-little-dream-2010/  # deliverables/greeting-card.png + .pdf (A6)
```

## Deploy (GitHub Pages)

Pushing to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds with the base path `/<repo-name>/` and publishes to Pages. One-time setup: **Settings → Pages → Source: GitHub Actions**.

For a custom domain (e.g. `nhaminh.love`), build with `BASE_PATH=/`, add a `public/CNAME` file containing the domain, and point DNS at GitHub Pages.

## Structure

```
src/
  config/content.ts           all personalised words + character looks
  components/                 SceneManager, FxLayer (particles), FlowerParticleSystem,
                              MusicController, PrintCard, ui
  scenes/                     Opening, FlowerGarden, Family, MazdaDream, FinalGreeting
  illustrations/              Characters (Bố, Mẹ, Chít, family), Mazda 2, backdrops, decor
  lib/                        audio (Web Audio), flowers (canvas), exportCard, perf
scripts/                      qa.mjs, make-qr.mjs, make-card.mjs
```

The characters are original SVG illustrations drawn using a family photo only as a reference. The photo itself is not included in this repository.
