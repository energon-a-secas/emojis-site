<div align="center">

# Emoji Archive

Browse, search, and download 202 custom Slack emojis across 7 categories. One-click download, no signup.

[![Live][badge-site]][url-site]
[![HTML5][badge-html]][url-html]
[![CSS3][badge-css]][url-css]
[![JavaScript][badge-js]][url-js]
[![Claude Code][badge-claude]][url-claude]
[![License][badge-license]](LICENSE)

</div>

---

## Overview

**Live:** [emojis.neorgon.com](https://emojis.neorgon.com/)

A searchable, browsable catalog of 202 Slack emojis across 7 categories: argentina, chile, development, essentials, logos, parrots, and think.

## Features

- Instant search by emoji name
- Category filter chips for quick browsing
- One-click download of any emoji
- Grid browse across all 202 emojis
- Submit new emojis via GitHub issue

## Categories

| Category | Description |
|---|---|
| argentina | Argentina-themed emojis |
| chile | Chile-themed emojis |
| development | Developer and engineering emojis |
| essentials | Everyday reaction emojis |
| logos | Brand and logo emojis |
| parrots | Animated party parrots |
| think | Thinking face variants |

## Architecture

Modular ES module app: `index.html` shell + `css/style.css` + `js/*.js`.

```
emoji-site/
├── index.html          # HTML shell
├── css/
│   └── style.css       # All styles
├── js/
│   ├── app.js          # Entry point, imports and initializes
│   ├── data.js         # Emoji catalog and category definitions
│   ├── state.js        # Shared mutable state, localStorage
│   ├── render.js       # DOM rendering, grid templates
│   ├── events.js       # Event handlers, search, filters
│   └── utils.js        # Shared helpers
└── emojis/             # Static emoji image files
```

**Backend:** Convex (for usage tracking), but works fully as a static site too.

## Run locally

```bash
python3 -m http.server
# open http://localhost:8000
```

ES modules require an HTTP server (`file://` will not work).

## Tech stack

- HTML5 + CSS3 + JavaScript ES modules
- Emoji images served as static files
- Convex (optional usage tracking)

---

<div align="center">

Part of [Neorgon](https://neorgon.com)

</div>

[badge-site]:    https://img.shields.io/badge/live_site-0063e5?style=for-the-badge&logo=googlechrome&logoColor=white
[badge-html]:    https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white
[badge-css]:     https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white
[badge-js]:      https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black
[badge-claude]:  https://img.shields.io/badge/Claude_Code-CC785C?style=for-the-badge&logo=anthropic&logoColor=white
[badge-license]: https://img.shields.io/badge/license-MIT-404040?style=for-the-badge

[url-site]:   https://emojis.neorgon.com/
[url-html]:   #
[url-css]:    #
[url-js]:     #
[url-claude]: https://claude.ai/code
