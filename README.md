# NIZAMS-WEDDING — Optimized Astro Rebuild

This is a performance-focused rebuild of the existing Nizam's Family Wedding Invitation.

## What is preserved

- Existing wedding content, layout, colors and typography
- Welcome/splash gate and portal transition
- Wedding/event sections and countdown
- Family/gallery photos and lightbox
- Jhilmil Sitaron audio player
- Scratch cards and reveal celebrations
- RSVP + Google Apps Script email webhook
- Firebase guest messages
- Firebase visitor counter with editable live count and actual count
- Firebase admin console for messages/RSVPs
- Existing Firebase project/collections and admin UID

## Performance changes

- Removed the Tailwind browser runtime from production.
- Astro renders the invitation as static HTML/CSS.
- Local CSS/JS are bundled by Astro instead of being served as the original loose files.
- Scratch progress uses a 32×32 sampling buffer on a throttled timer instead of scanning the full canvas on every pointer event.
- Hover glow uses delegated pointer events instead of listeners on every card.
- Ambient particles are adaptive and disabled on lower-capability devices.
- Aurora pointer animation only runs on capable fine-pointer devices and only while the pointer is moving.
- Fireworks use adaptive particle counts and pause when the page is hidden.
- Non-essential backdrop/glow effects are reduced automatically on lower-capability devices.
- Images retain their original files and have intrinsic dimensions to reduce layout shift.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

Astro writes the static build to `dist/`.

## GitHub Pages

The repository includes `.github/workflows/deploy.yml`. Set GitHub Pages to **GitHub Actions** as the deployment source.

The included `public/CNAME` targets:

`nizamswedding.com`

If you temporarily want the project URL instead of the custom domain, remove `public/CNAME` and configure the appropriate GitHub Pages URL/base in `astro.config.mjs`.

## Firebase

The existing Firebase client configuration is intentionally preserved because it is required by the current invitation. Security must continue to come from the Firestore/Auth rules rather than hiding the client configuration.

## Important

The build could not be executed inside this packaging environment because outbound npm registry DNS/network access is unavailable here. The JavaScript source passes `node --check`. Run `npm install` and `npm run build` locally before pushing to the live repository.
