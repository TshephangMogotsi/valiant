# Digital business cards

The card surface lives at `/card` and supports direct, shareable profile URLs:

- `/card/morwadi-mosenki`
- `/card/gomotsang-yvonne-dennison`

Each completed profile supports tap-to-call, tap-to-email, copying the contact details, and downloading a standard `.vcf` contact card.

## Production URL

The cards are published on the main domain:

- `https://valiantmedia.co.bw/card/morwadi-mosenki`
- `https://valiantmedia.co.bw/card/gomotsang-yvonne-dennison`

Vercel rewrites `/card/*` to the single-page app entry point so these links work on a direct visit or refresh.

## Updating a card

Update the `profiles` list in `app/digital-cards.tsx` with the profile's name, title, organisation, phone, email, postal address, and approved portrait.
