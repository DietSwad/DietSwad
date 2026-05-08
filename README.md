# Diet Swad — Website

Static marketing website for **Diet Swad**, a D2C healthy snacks brand based in Kolkata. Served via GitHub Pages at [dietswad.in](https://dietswad.in).

> ## ⚠️ CRITICAL — WHEN ADDING A NEW PAGE
>
> `dietswad.in/{slug}` also routes to the URL shortener. Short codes and page slugs share the same flat namespace.
>
> **Every PR that adds a new page must also update all three places below in the same commit:**
>
> 1. **`DietSwad/DietSwad_URL_shortener_Azure_Function` → `RESERVED_WORDS` set** — add the new slug, redeploy the Function App.
> 2. **Cloudflare Transform Rule allowlist** (`Details/CLOUDFLARE_SETUP_GUIDE.md` Step 2b) — add the slug, deploy the rule.
> 3. **This repo** — add the page + update `sitemap.xml` / nav links (your normal change).
>
> Skipping #1 or #2 causes live regressions: either a real short link gets overridden, or Cloudflare routes your new page to the shortener and visitors see a 404.
> Decision record: `Details/DECISIONS_LOG.md` → 2026-04-13 "URL shortener format: flat".

---

## Pages

| File | URL | Status |
|---|---|---|
| `index.html` | `dietswad.in/` | ✅ Live |
| `power-bites.html` | `dietswad.in/power-bites` | ✅ Live (image mapping pending) |
| `royal-bites.html` | `dietswad.in/royal-bites` | ⏳ Pending |
| `peanut-sesame-delights.html` | `dietswad.in/peanut-sesame-delights` | ⏳ Pending |
| `millet-butter-cookies.html` | `dietswad.in/millet-butter-cookies` | ⏳ Pending |
| `millet-coconut-cookies.html` | `dietswad.in/millet-coconut-cookies` | ⏳ Pending |
| `millet-choco-cookies.html` | `dietswad.in/millet-choco-cookies` | ⏳ Pending |
| `roasted-cashews.html` | `dietswad.in/roasted-cashews` | ⏳ Pending |
| `hampers.html` | `dietswad.in/hampers` | ⏳ Pending |
| `privacy-policy.html` | `dietswad.in/privacy-policy` | ✅ Live |
| `refund-policy.html` | `dietswad.in/refund-policy` | ✅ Live |
| `shipping-policy.html` | `dietswad.in/shipping-policy` | ✅ Live |
| `terms-of-service.html` | `dietswad.in/terms-of-service` | ✅ Live |
| `thank-you.html` | `dietswad.in/thank-you` | ✅ Live |

---

## Products (V4.1 — current catalogue)

All products are priced at **₹499** with pan-India shipping.

| Product | Weight | Key spec |
|---|---|---|
| Power Bites | 180g · 12 pc | 11 superfoods · 7.5g protein |
| Royal Bites | 180g · 12 pc | 14.8g protein · peanut butter |
| Peanut-Sesame Delights | 180g · 12 pc | 4 ingredients · 13.2g protein |
| Millet Butter Cookies | 150g | Sorghum 30.8% · real butter |
| Millet Coconut Cookies | 150g | Jowar · oats · coconut · no maida |
| Millet Choco Cookies | 150g | Jowar + ragi · almond flour |
| Roasted Cashews | 200g | 2 ingredients · 18.2g protein/100g |

---

## Tech stack

- **HTML5 / CSS3 / Vanilla JS** — no frameworks, no build step
- **Google Fonts** — Cormorant Garamond (display) + DM Sans (body), loaded via CDN
- **Canvas 2D API** — scroll-driven hero animation (`hero-animation.js`), 26 WebP frames
- **CSS custom properties** — single `:root` token set in `style.css`; per-product `--p-tint` and per-review `--r-tint` as the only overrides
- **GitHub Pages** — push to `main` → live within ~1 min

---

## File structure

```
DietSwad/
├── index.html                   # Landing page
├── power-bites.html             # Product page (template for all 7 products)
├── style.css                    # Site-wide styles + design tokens
├── hero.css                     # Hero section styles
├── hero-animation.js            # Scroll-driven canvas animation engine
├── product.css                  # Product page styles
├── product-animations.js        # Product page scroll + sticky CTA logic
│
├── hero-frames/                 # 26 WebP frames for hero canvas animation
│   ├── frame_001.webp
│   └── … frame_026.webp
│
├── Assets/
│   ├── Landing_Page_images/     # Product carousel webps + why-*.webp section images
│   ├── Logo_and_icons/          # Logo PNGs (default + golden)
│   ├── Product_hero_image/      # Full-bleed hero shot per product page
│   ├── Product_ingredients_images/  # Transparent ingredient cutout PNGs
│   ├── Product_Persona_images/  # Lifestyle persona JPEGs
│   ├── Product_USP_card_images/ # USP section card images
│   ├── Product_comparison_images/   # (reserved — future use)
│   └── Product_galler_images/
│       ├── Power_Bites/         # Gallery shots + infographics
│       ├── Royal_Bites/
│       ├── Peanut_sesame_delight/
│       ├── Millet_Butter_Cookies/
│       ├── Millet_Coconut_Cookies/
│       ├── Millet_Choco_Cookies/
│       └── Roasted_Cashews/
│
├── privacy-policy.html
├── refund-policy.html
├── shipping-policy.html
├── terms-of-service.html
├── thank-you.html               # Post-payment confirmation page
│
├── CNAME                        # dietswad.in
└── README.md
```

**Pending sweep (not part of the new design):**
- `test-checkout.html`, `test-thankyou.html` — Phase 2 backend sandbox pages
- `refference_pics/` — original reference images from old design

---

## Image upload guide

Product images live in `Assets/` subfolders. Empty folders contain a `.gitkeep` — just drop images in and the `.gitkeep` can be removed. Naming conventions match the references already in the HTML:

| Slot | Folder | Naming example |
|---|---|---|
| Product page hero | `Product_hero_image/` | `Power_bites_hero_shot_46.png` |
| Gallery / infographics | `Product_galler_images/{Product}/` | `Power_bites_hero_shot_1.png` |
| USP card images | `Product_USP_card_images/` | to be named when image-mapping session runs |
| Persona photos | `Product_Persona_images/` | `Power_bites_persona_pic_1.jpeg` |
| Ingredient cutouts | `Product_ingredients_images/` | `transparent_date.png` |
| Landing page carousel | `Landing_Page_images/` | `product-power-bites.webp` |
| "Why" section | `Landing_Page_images/` | `why-no-maida.webp` (placeholder until real asset ready) |

---

## Local development

No build process required.

```bash
git clone https://github.com/DietSwad/DietSwad.git
cd DietSwad
# Open index.html in a browser — or serve locally to avoid canvas CORS on some browsers:
python -m http.server 8080
# Then visit http://localhost:8080
```

The hero canvas animation requires frames to be served over HTTP (not `file://`). Use any local server if the animation appears blank.

---

## Brand

- **Brand name:** Diet Swad
- **Legal entity:** Radiant Twins Enterprise
- **Location:** Kolkata, West Bengal, India
- **Website:** [dietswad.in](https://dietswad.in)
- **Instagram:** [@dietswad](https://www.instagram.com/dietswad/)
- **WhatsApp / Phone:** +91 89107 25854
- **Email:** dietswad143@gmail.com

---

© 2025 Diet Swad · Radiant Twins Enterprise · Handcrafted in Kolkata
