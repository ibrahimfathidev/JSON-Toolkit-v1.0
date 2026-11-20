# JSON Toolkit — Quick Tutorial

This guide explains how to run the project, use its tools, and make a small change.

## 1. Install and run

1. Install Node.js 20+.
2. Open a terminal inside the project folder.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL shown in the terminal.

## 2. Use the workspace

1. Paste JSON into the **Input** panel, or choose **Upload** to open a local file.
2. Choose a tool from the top bar:
   - **Format** — adds indentation and line breaks.
   - **Minify** — removes unnecessary whitespace.
   - **Validate** — checks whether the input is valid JSON.
   - **Tree view** — displays nested objects and arrays as expandable nodes.
   - **Convert** — converts between JSON, CSV, and YAML.
3. Press the main action button. `Ctrl + Enter` (or `Cmd + Enter` on macOS) also runs the selected tool while the input editor is focused.
4. Use **Copy** or **Export** to take the result.
5. Use **Sort keys** to alphabetize object keys in the output.

## 3. Conversion examples

### JSON to CSV

The input must be a non-empty array of objects:

```json
[
  { "name": "Ada", "role": "Engineer" },
  { "name": "Linus", "role": "Developer" }
]
```

Choose **Convert → JSON → CSV**. The first object keys become the CSV headers.

### CSV to JSON

Use a header row followed by data rows:

```csv
name,role
Ada,Engineer
Linus,Developer
```

Choose **Convert → CSV → JSON**. CSV values remain strings. Convert numeric or boolean values yourself after conversion when needed.

### JSON and YAML

Choose **JSON → YAML** or **YAML → JSON** from the conversion selector. The result appears in the Output panel.

## 4. Understand the source code

| File | Purpose |
|---|---|
| `src/App.tsx` | Main screen, editor state, actions, upload, copy, and export |
| `src/lib/jsonTools.ts` | Formatting, validation, sorting, CSV, and YAML conversion logic |
| `src/components/JsonTree.tsx` | Recursive collapsible JSON tree |
| `src/styles.css` | Layout, colors, responsive behavior, and component styles |
| `src/main.tsx` | React entry point |

## 5. Make a small change

For example, to change the sample JSON:

1. Open `src/lib/jsonTools.ts`.
2. Find `SAMPLE_JSON` near the top.
3. Replace its contents with valid JSON text.
4. Save the file. Vite refreshes the browser automatically.

To add another conversion:

1. Add its type to `Conversion` in `src/lib/jsonTools.ts`.
2. Add an option to the `conversions` array in `src/App.tsx`.
3. Add a `case` in `convertData()`.
4. Test both valid input and invalid input.

## 6. Build for deployment

Run:

```bash
npm run build
```

Upload the generated `dist/` folder to a static host such as GitHub Pages, Cloudflare Pages, or Netlify. No backend is required for the included features.

## 7. Before publishing to GitHub

- Review `README.md` and update the repository URL after creating your repo.
- Keep `node_modules/` and `dist/` out of Git using `.gitignore`.
- Never commit API keys or private data.
- Test the production build with `npm run build`.
- Add screenshots to the README after taking them from your running app.
