# Little Fox Cups + Cones — redesign concept

A single-page, static redesign of littlefoxcupsandcones.com. No build step.

```bash
node server.js        # → http://localhost:4810
```

## What's in it
| Section | What it does |
|---|---|
| Loader | Waffle cone slides in, three scoops drop with squash + stretch as the counter climbs, the fox scoop wakes up, then the screen melts away in periwinkle drips and the cone flies into the hero |
| Hero | WebGL "lavender ripple" ice-cream surface (stirred by the cursor), giant script wordmark split around the cone, parallax floating ingredients, spinning est. 2020 sticker |
| Marquees | Two crossing bands whose speed reacts to scroll velocity |
| Our story | Word-by-word scroll-filled statement with inline fox/cone pills, three tilt cards, purveyor ticker |
| Flavor lab | Pinned horizontal scroll through 8 flavors; the page color morphs per flavor |
| Full board | All 24 flavors with filters (GF, plant-based, Cardiff, Oceanside); hover shows a scoop that follows the cursor |
| Stack it | Build-a-cone toy: up to 4 scoops, bounce physics, optional fox ears |
| Treats | Cake, tacos, pints, e-gift cards (links to the live order pages) |
| Shops | Both shops with a live open/closed status in Pacific time, plus an illustrated coast map where a fox drives down the 101 as you scroll |
| Join the pack | Hiring CTA with a row of fox scoops whose eyes follow the cursor |
| Footer | Gooey wordmark that keeps dripping |

## Files
- `js/data.js`: flavors, ingredients, taglines and availability (edit this when the menu changes; colors are per flavor)
- `js/art.js`: procedural SVG kit (scoops, fox scoops, cones, cups, treats, icons). Every illustration is generated, so there are no image files
- `js/shader.js`: the hero WebGL shader
- `js/main.js`: loader, smooth scroll (Lenis), GSAP/ScrollTrigger choreography, interactions
- `css/style.css`: brand tokens (periwinkle `#4455A1`, lilac `#CCA1CA`, cream `#FBEED7`, mint `#9CCEBF`) and layout

## Before launch
- The newsletter form is front-end only. Wire it to the email provider in `main.js` (search "newsletter").
- Both "join the team" buttons go to `/applytolittlefox`; point each at its own form if you want.
- Libraries load from CDNs (GSAP 3.12.5, Lenis 1.1.13, Google Fonts). Self-host them for production.
- Honors `prefers-reduced-motion`: the loader is skipped, motion is stilled and smooth scroll is off.
