# Valiant Media

An offline-first Vite and React site. All runtime assets, including the full
jellyfish carousel, are stored in this repository; the page does not depend on
hosted fonts, image CDNs, APIs, or a deployment platform.

## Requirements

- Node.js 22.13 or newer
- Dependencies installed locally

## Local development

```bash
npm run dev
```

Open the local address printed by Vite.

## Offline production build

```bash
npm run build --offline
```

The static site is written to `dist/`. Once dependencies are installed, the
build does not require a network connection.

## Checks

```bash
npm test --offline
npm run lint
```
