# BADDIECULTURE // BUILD YOUR OUTFIT — FINAL V1

## Project structure
- `index.html` — page structure and UI
- `css/styles.css` — responsive styling, pixel UI, motion and accessibility states
- `js/app.js` — outfit state, V10 fighter layering, presets, randomizer, persistence, loadout and WhatsApp order flow
- `assets/` — V10 character layers and separate product-card assets

## Final V1 additions
- V10 fighter layer assets remain separate from product-card assets.
- Character idle motion and lightweight outfit equip transitions.
- Product hover/micro-interactions and category tray states.
- Live loadout summary and dynamic total.
- Outfit presets: Default, All Black, Street, Angel.
- Randomize Fit.
- Item data/lore panel.
- Fighter stat HUD.
- Save Fit PNG from the current layered character.
- Local persistence for the current outfit and size/color selections.
- Subtle moving grid/CRT treatment and a hidden archive signal interaction.
- Mobile responsive controls and touch-friendly targets.
- Focus states and reduced-motion support.
- Broken product-image fallback behavior.

## Important
The WhatsApp number in `js/app.js` is still a placeholder and must be replaced before launch.

## V1.1 updates
- Fixed preset/randomizer interactions with delegated click handling.
- Added FULL FIT preset.
- Added persistent cart drawer with remove/view-loadout controls.
- Added variant color switching inside the loadout.
- Added shareable loadout URLs (`?top=...&bottom=...&accessory=...`).
- Added SAVE CHARACTER + SHARE CHARACTER actions.
- Share uses the Web Share API when supported, with a loadout-link clipboard fallback.
- Reduced initial image preloading to fighter layers only for faster startup.
- Increased fighter idle/breathing motion while preserving the V10 layer alignment.


## V1.2 Performance + Analytics

### Performance features
- Product-card images are loaded on demand; loadout/cart thumbnails use lazy loading.
- Fighter layers are preloaded so outfit changes stay instant.
- Images declare intrinsic dimensions to reduce layout shift.
- A service worker caches the core app shell for offline-ish resilience after the first successful visit.
- Reduced-motion, keyboard focus, touch targets, semantic buttons, alt text and image retry handling are preserved.

### Drop counter
`DROP_AVAILABLE` / `DROP_TOTAL` are configured in `js/app.js`. The current UI shows `37 / 100 AVAILABLE` as a placeholder. Replace these values with your real inventory source before launch.

### Analytics setup
1. Create a Google Analytics 4 web property and obtain the Measurement ID (format `G-XXXXXXXXXX`).
2. Open `js/app.js` and replace `ANALYTICS_MEASUREMENT_ID = 'G-XXXXXXXXXX'` with your real ID.
3. Deploy the site over HTTPS. The site will then send GA4 events.
4. In GA4, use **Reports → Engagement → Events** to inspect events and **Explore → Funnel exploration** to build the conversion funnel.

Tracked events include:
- `product_view` — product views
- `add_to_outfit` / `remove_from_outfit` — configurator interactions
- `outfit_changed` — outfit combinations and value
- `preset_selected` / `randomize_fit` — fit generation
- `view_loadout` — loadout intent
- `variant_selected` / `size_selected` — variant choices
- `fit_saved` / `fit_shared` — share/save behavior
- `checkout_started` — checkout funnel step
- `order_intent` — confirmation intent
- `abandoned_loadout` — session ended with an active loadout
- `shared_loadout_opened` — someone opened a shared fit
- `asset_error` / `asset_retry` — asset reliability

The site also keeps the last 100 analytics payloads in localStorage under `baddieculture-analytics-queue`, which is useful for debugging before GA4 is connected. This local queue is not a substitute for production analytics.

## V1.3 Retro Audio
- Added a lightweight procedural Web Audio sound system: no external audio files required.
- `♪ SOUND: OFF/ON` control in the HUD.
- Optional low-volume 8-bit/arcade-style background loop after the user enables sound.
- Retro SFX for navigation, item selection/equip, randomize, save/share, confirm, back, retry/error, and the hidden brand signal.
- Sound preference persists in `localStorage` under `baddieculture-retro-sound`.
- Audio does not autoplay with sound before a user gesture; this avoids browser autoplay blocking.
- If `prefers-reduced-motion` is enabled, the visual idle animation is reduced as before; audio remains independently controllable.


## V1.3.1 audio fix
- Bound the SOUND toggle to the audio engine.
- Added AudioContext error/state handling.
- Bumped the service-worker cache to force the updated app shell to propagate.
