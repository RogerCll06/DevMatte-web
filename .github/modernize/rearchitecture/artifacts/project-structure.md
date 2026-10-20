# Project Structure

- Classification: fullstack monolith with a static frontend and Express backend.
- Entry points: `index.html` in the browser and `server.js` in Node.js.
- Frontend layers: HTML composition, one CSS stylesheet, feature-oriented browser scripts and image assets.
- Backend layer: Express static delivery plus `/api/contact` and `/api/estimate`.
- Functional areas: landing/navigation, services, portfolio, Calendly booking, estimate wizard and contact.
- External integrations: Calendly iframe and Gmail SMTP through Nodemailer.
- Runtime assets: `assets/css/`, `assets/js/` and `assets/images/`.
- Operational exclusions: `node_modules/` and `.env` are not application source.
