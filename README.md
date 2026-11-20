# JSON Toolkit

A browser-based developer utility for formatting, minifying, validating, exploring, and converting structured data.

**Privacy-first:** parsing and conversions happen in your browser. The app does not send your input data to an application server.

## Features

- Format and minify JSON.
- Validate JSON syntax and show the error position when the browser reports it.
- Explore nested objects and arrays in a collapsible tree view.
- Sort object keys alphabetically.
- Convert JSON arrays of objects to CSV.
- Convert CSV data to JSON.
- Convert JSON to YAML and YAML to JSON.
- Upload local `.json`, `.csv`, `.yaml`, `.yml`, or `.txt` files.
- Copy results and export them as files.
- View line, character, and byte counts.

## Tech stack

- React 18
- TypeScript
- Vite
- js-yaml
- lucide-react

## Getting started

Requirements: Node.js 20 or newer and npm.

```bash
git clone https://github.com/YOUR_USERNAME/json-toolkit.git
cd json-toolkit
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Production build

```bash
npm run build
npm run preview
```

The production-ready files are written to `dist/`.

## Conversion notes

- **JSON → CSV:** expects a non-empty array of objects. Nested values are stored as JSON strings in their cells.
- **CSV → JSON:** values are kept as strings; this avoids guessing whether values such as `0012`, `true`, or `null` should be converted to another type.
- **YAML conversion:** powered by `js-yaml`.

## Privacy and security

The current app does not need an API key, backend, account, or environment variables. Keep it that way if you want to preserve its client-side privacy model. Do not add analytics or remote logging that captures editor contents.

## Project structure

```text
json-toolkit/
├── src/
│   ├── components/
│   │   └── JsonTree.tsx
│   ├── lib/
│   │   └── jsonTools.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
├── .env.example
├── .gitignore
├── index.html
├── TUTORIAL.md
├── README.md
├── package.json
├── tsconfig*.json
└── vite.config.ts
```

## License

MIT. See [LICENSE](LICENSE).
