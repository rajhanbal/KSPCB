# KSPCB Dashboard: static site for Netlify

A static copy of the KSPCB sample dashboard (FY 2025-26). It needs no build step.

## Contents

- `index.html`: the dashboard page.
- `js/dash-shim.js`: loads the files in `data/`, runs the dashboard's calculations, and keeps the waste-type filter. It stands in for the hosted dashboard runtime.
- `css/tokens.css`: colours, fonts and spacing, with light and dark themes.
- `data/*.json`: one file per dataset. Files starting `ar_` hold the reported figures, `sample_` the illustrative ones, `ref_offices.json` the zone and regional-office mapping, and `geo_districts.json` the district boundaries for the zone map.
- `netlify.toml`: publishes this folder as-is and sets cache headers for `data/`.

The page loads d3 from cdnjs and fonts from Google Fonts. Everything else is served from this folder.

## Deploy

Use either option.

- **Drag and drop:** sign in at app.netlify.com, open *Sites*, then drag the `dashboard-site` folder onto the deploy area.
- **Netlify CLI:** run these two commands from this folder.

```bash
npm install -g netlify-cli
```

```bash
netlify deploy --prod --dir .
```

## Preview locally

Opening `index.html` straight from disk will not work, because browsers block `fetch` of local files. Serve the folder instead, for example:

```bash
npx serve .
```

## Updating figures

Edit the JSON files in `data/` and redeploy. Keep each file's column names, because the page reads them by name. Every row carries an `fy` column (for example `2025-26`), which drives the Financial year filter; add rows with a new `fy` value to add a year. `ref_offices.json` and `geo_districts.json` have no `fy`. To add a dataset, add it to `FILES` in `js/dash-shim.js`.

The header logo is `img/kspcb-logo.png`; replace it with the original artwork at the same path for a sharper image.
