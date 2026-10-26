# puzzledbit.github.io

This site has moved to **https://puzzledbit.com** (source: [puzzledbit/puzzledbit-web](https://github.com/puzzledbit/puzzledbit-web)).

GitHub Pages can't send HTTP 301s, so every legacy page here is a redirect stub (JavaScript `location.replace`,
`<meta http-equiv="refresh">` and a canonical link to the new URL, plus a visible link for browsers without JavaScript).

| Old | New |
| --- | --- |
| `/`, `/index.html` | `https://puzzledbit.com/` |
| `/cv.html`, `/resume.html` | `https://puzzledbit.com/about` |
| `/blog.html`, `/chronicles.html` | `https://puzzledbit.com/blog` |
| `/post.html?id=<slug>` | `https://puzzledbit.com/post.html?id=<slug>` → 301 to `/blog/<slug>` (or `/blog`) |
| anything else (`404.html`) | same path on `https://puzzledbit.com` |

The pre-migration site is preserved in git history (last content commit `5424568`).
