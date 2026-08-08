# Sircl

**Build rich and interactive web apps. Easy and quick. No JavaScript.**

Sircl is a client-side library that lets you build fast, interactive, multi-page or single-page web applications using **your server-side technology of choice** — ASP.NET, PHP, Ruby, Node.js, JSP/Servlets, or anything else that renders HTML. No JavaScript framework. No client-side coding. Just HTML.

📖 **Full documentation, guides and live examples: [www.getsircl.com](https://www.getsircl.com/)**

> This repository hosts the source code and distributable builds of Sircl. If you just want to *use* Sircl in a project, start at [www.getsircl.com](https://www.getsircl.com/) — it has the complete, up-to-date documentation, tutorials and reference.

[![npm version](https://img.shields.io/npm/v/sircl.svg)](https://www.npmjs.com/package/sircl)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Why Sircl?

Modern web apps often feel like they require a full JavaScript framework just to avoid full-page reloads. Sircl takes a different approach: it extends plain HTML with a set of declarative classes and attributes, and does the AJAX, DOM-patching and state-handling work for you.

- **Easy to learn** — no new language or framework to learn, and no client-side code to write. Sircl extends HTML with memorable classes and attributes.
- **Just HTML** — everything is expressed declaratively in markup. No imperative JavaScript required.
- **Interactive** — build rich interactions driven by click, hover, scroll, drag & drop and more.
- **Rich** — dynamic content loading, Ajax forms, dialogs and Bootstrap modals, all in plain HTML.
- **Compatible** — works with any server-side technology: PHP, Node.js, ASP.NET, Ruby, JSP/Servlets... even static sites benefit from Sircl.
- **Extendible** — Sircl is a library of HTML attributes and classes that you can freely extend with your own custom behaviors.

Sircl comes with extensions for **Bootstrap**, **Vue.js** and other libraries to support **toasts**, drag, drop & **sorting**, **QR code** generation and **scanning**.

## A quick taste

Show or hide an element, with no JavaScript at all:

```html
<button onclick-show="#info">Show info</button>
<p id="info" hidden>This is the info!</p>
```

Load a fragment of HTML from the server into part of the page:

```html
<a href="/info.part.html" target="#info">Load info</a>
<div id="info">...</div>
```

Turn a form into an Ajax form that updates only part of the page:

```html
<form action="/Add" target="#output">
  <input type="text" name="Name" placeholder="Name" />
  <button class="submit">Add</button>
</form>
<div id="output" aria-live="assertive"></div>
```

These building blocks — **event-actions** (`onclick-...`, `onhover-...`, `ifchecked-...`, ...) and **partial page loading** (`target`, `onload-load`, `ifinview-load`, ...) — are the core of Sircl. Combined, they even let you build full **single-page applications** rendered entirely server-side, complete with deep linking and browser history support.

👉 For the concepts, the full attribute/class reference, and many more examples, see the documentation:

- [Get Started](https://www.getsircl.com/Doc/v2/GetStarted)
- [Partial Loading](https://www.getsircl.com/Doc/v2/PartialLoading)
- [Event Actions](https://www.getsircl.com/Doc/v2/EventActions)
- [Single Page Mode](https://www.getsircl.com/Doc/v2/SinglePageMode)

## Installation

Sircl depends on jQuery 3.6+ (the "slim" build is sufficient).

**CDN (jsDelivr):**

```html
<link href="https://cdn.jsdelivr.net/npm/sircl@2/sircl-bundled.min.css" rel="stylesheet" />
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/sircl@2/sircl-bundled.min.js"></script>
```

**npm:**

```bash
npm i sircl
```

**Download:** grab a release directly from the [`dist`](dist) folder in this repository, or as a zip from [www.getsircl.com](https://www.getsircl.com/Doc/v2/GetStarted).

For **full setup instructions**, starter templates, and framework-specific tips (ASP.NET, etc.), see the [Get Started guide](https://www.getsircl.com/Doc/v2/GetStarted).

For a **quick tryout**, use the CodePen playground on:  
[https://codepen.io/codetuner-the-lessful/pen/abyLVZpJ](https://codepen.io/codetuner-the-lessful/pen/abyLVZp).


## Repository structure

- [`src/`](src) — Sircl source code, including a sample ASP.NET web application ([`src/SampleWebApplication`](src/SampleWebApplication)) demonstrating Sircl in a real server-rendered app.
- [`dist/`](dist) — versioned, ready-to-use distributable builds (bundled and modular `.js`/`.css`, minified and unminified).

The source code of the Sircl v2 library is in [`src/SampleWebApplication/wwwroot/lib/sircl-src-new`](src/SampleWebApplication/wwwroot/lib/sircl-src-new).

## License

Sircl is released under the [MIT License](LICENSE).

## Learn more

For everything else — concepts, tutorials, the complete attribute/class reference, and live CodePen examples — head to the official documentation site:

## 🔗 [www.getsircl.com](https://www.getsircl.com/)
