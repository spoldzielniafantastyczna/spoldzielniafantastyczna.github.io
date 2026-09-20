# Spółdzielnia Fantastyczna — website

Static portfolio website for **Spółdzielnia Fantastyczna**, a hobby 3D printing
group. Plain HTML/CSS/vanilla JS, no build step, no backend. Three.js is used
only for the optional in-browser STL viewer and is lazy-loaded per project.

## Project structure

```
/
├── index.html              Homepage (hero, about, portfolio, capabilities, contact)
├── project.html            Project detail page, rendered from ?id=<project-id>
├── css/
│   ├── main.css            Base tokens, layout, header, hero, about, contact, footer
│   ├── gallery.css         Portfolio carousel, project cards, image gallery, lightbox
│   └── viewer.css          3D model viewer chrome (loading/error states, hint)
├── js/
│   ├── main.js             Mobile nav toggle + site.json driven contact links
│   ├── projects.js         projects.json loader + homepage carousel
│   ├── project-page.js     Project detail page controller (id lookup, prev/next, SEO tags)
│   ├── gallery.js          Reusable thumbnail gallery + lightbox (keyboard/swipe/Esc)
│   └── stl-viewer.js       Three.js STL viewer (dynamically imported, only when needed)
├── data/
│   ├── site.json           Contact details / MakerWorld link (edit this for real contact info)
│   └── projects.json       Project catalog — add new projects here
├── assets/
│   ├── branding/           Logo/avatar/banner downloaded from the MakerWorld profile
│   ├── icons/              Generated favicons + touch icons (derived from the avatar)
│   └── vendor/three/       Vendored three.js build + STLLoader/OrbitControls (MIT, see LICENSE)
├── projects/
│   ├── temperature-tower/  Real project (own MakerWorld model), images only
│   ├── shuriken-prop/      Real project (own MakerWorld model), images only
│   └── cube/                Demo project — generated STL + generated renders
├── robots.txt
├── sitemap.xml
└── .nojekyll                Tells GitHub Pages not to run Jekyll
```

## Local development

No build step and no dependencies to install. Because the pages use
`fetch()` for JSON and ES module imports, they must be served over HTTP(S) —
opening `index.html` directly via `file://` will fail (CORS-blocked `fetch`).

From the project root, run any static file server, for example:

```bash
python3 -m http.server 8080
# then open http://localhost:8080/
```

or, if you have Node.js:

```bash
npx serve .
```

## Adding a new project

1. Create a new folder under `projects/<your-project-id>/`.
2. Add an `images/` subfolder with a `cover.*` image and any number of
   additional images (`.jpg`, `.jpeg`, `.png`, `.webp` are all supported).
3. Optionally add a `model/<name>.stl` file (see the STL notes below).
4. Add one entry to [`data/projects.json`](data/projects.json):
   ```json
   {
     "id": "your-project-id",
     "title": "Project Title",
     "description": "One or two sentences about the project.",
     "cover": "projects/your-project-id/images/cover.jpg",
     "images": ["projects/your-project-id/images/cover.jpg", "..."],
     "stl": "projects/your-project-id/model/your-model.stl",
     "tags": ["Tag One", "Tag Two"]
   }
   ```
   Omit `"stl"` entirely for projects without a 3D model — the viewer section
   is hidden automatically when the field is missing.
5. Commit and push. No HTML or JavaScript changes are required.

## Contact information

Edit [`data/site.json`](data/site.json):

- `email` — replace the `TODO@example.com` placeholder with a real address.
- `phone` — leave as an empty string to hide the phone row, or fill it in.
- `makerworld` — the group's MakerWorld profile URL.

The contact form in `index.html` has no backend. On submit it opens the
visitor's email client via a `mailto:` link pre-filled with their message —
it does not send or store anything itself. To connect a real form service
later (e.g. Formspree), replace the `submit` handler in
[`js/main.js`](js/main.js) (`initContactForm`) with a `fetch()` POST to the
service's endpoint; `data/site.json` already has a placeholder
`formspreeEndpoint` field for this.

## STL models

- Keep browser-preview STL files small — a few MB at most. Decimate/simplify
  meshes intended purely for a preview; the viewer is not a CAD tool.
- ASCII STL is supported (it is what [`generate the demo cube`](projects/cube/model/cube.stl)
  uses) but binary STL is smaller for the same geometry and loads faster —
  prefer binary STL for anything beyond a simple demo shape.
- The viewer auto-centers and auto-scales the model, so the source unit
  scale and origin don't need to be exact, but keep real-world proportions
  (mm) for consistent results.

## GitHub Pages deployment

1. Push this repository to GitHub.
2. In the repository settings, enable **Pages** → **Deploy from a branch** →
   branch `main`, folder `/ (root)`.
3. `.nojekyll` is already included so GitHub Pages serves files as-is.
4. All internal links/asset paths are relative, so the site works whether it
   is served at the repository root or under a project path like
   `https://<user>.github.io/<repo>/`.

### Connecting the custom domain (spoldzielniafantastyczna.pl)

Do this once the domain is actually registered and its DNS can be edited:

1. Create a file named `CNAME` at the repository root containing exactly:
   ```
   spoldzielniafantastyczna.pl
   ```
2. At your DNS provider, point the domain at GitHub Pages:
   - `A` records for the apex domain to GitHub's Pages IPs, **or**
   - a `CNAME` record from `www` to `<user>.github.io`.
3. In the repository's **Settings → Pages**, set the custom domain and
   enable **Enforce HTTPS** once the certificate is issued.

Adding the `CNAME` file before the DNS is configured is harmless, but don't
add it while testing on the default `github.io` URL if you don't want GitHub
to redirect there prematurely — add it as the last step, once DNS is ready.

## MakerWorld assets used

- `assets/branding/makerworld-avatar.png` — the group's avatar (red square,
  white "SF" mark + printer motif), downloaded from the MakerWorld profile
  and reused as the site logo and favicon source.
- `assets/branding/makerworld-banner.png` — the profile's banner image,
  downloaded for potential future use (currently not placed on any page).
- Project photos in `projects/temperature-tower/` and
  `projects/shuriken-prop/` are the group's own renders/photos, downloaded
  from their own MakerWorld model pages (not from other creators).

No MakerWorld assets are hotlinked — everything above was downloaded and is
served from this repository.

## Third-party code

`assets/vendor/three/` contains a vendored, unmodified build of
[three.js](https://threejs.org/) (MIT license, see the included `LICENSE`
file) plus its `STLLoader` and `OrbitControls` addons. It is only fetched by
`js/stl-viewer.js`, which is dynamically imported solely on project pages
that declare an `"stl"` asset — pages without a 3D model never download it.
