# Vino Calculator

A clean, dark-themed calculator with a modern tech feel. Built as a small personal project using only HTML, CSS, and vanilla JavaScript — no frameworks.

## Features

- Basic arithmetic (`+`, `−`, `×`, `÷`)
- Percentage calculations
- Decimal and negative numbers
- Keyboard support
- Responsive layout for desktop, tablet, and mobile
- Dark modern interface

## Tech Stack

- HTML
- CSS
- JavaScript

## Run Locally

1. Clone or download this repository.
2. Open `index.html` in your browser.

That is enough — there is no build step or package install.

You can also serve the folder with any static file server, for example:

```bash
# Python 3
python -m http.server 5500
```

Then visit `http://localhost:5500`.

## GitHub

From inside the `vino-calculator` folder:

```bash
git init
git add .
git commit -m "Initial calculator project"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual repository URL.

## Deploy as a Public Website

Because this project is static HTML/CSS/JS, you can host it for free with **GitHub Pages**:

1. Push the project to a GitHub repository.
2. Open the repository on GitHub → **Settings** → **Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Choose the `main` branch and the `/` (root) folder, then save.
5. After a short wait, GitHub will show a public URL such as:

   `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

Other free static hosts (Netlify, Cloudflare Pages, Vercel) work the same way: connect the repo or drag-and-drop the folder, and point the publish directory at the project root.
