# Woodford XR media pack

Stereo W mark, Archivo 700 wordmark. Built 2026-11-03. All type is outlined to paths; no font is needed to use any file.

## Folders

- `svg/`      vector masters on transparent background. Use these wherever vector is accepted.
- `png/`      the same masters as PNG with alpha, at several widths (file name ends in the pixel width).
- `mono/`     single-colour versions, white (for dark grounds) and black (for light grounds), SVG and PNG.
- `icon/`     mark and stacked lockup on a solid field, squared corners, no transparency. For app stores, developer pages, anything that asks for a solid icon. 512 and 1024.
- `favicon/`  `favicon.svg` (W on an ink rounded square), PNGs at 16/32/48/64/192/512, `apple-touch-icon-180.png`, plus a transparent W for browsers that draw their own tile.
- `social/`   ready-cut images: 1024 avatar (round-crop safe), OG image 1200x630, X header 1500x500, LinkedIn cover 1128x191, YouTube banner 2560x1440 (lockup inside the 1546x423 safe area), 1920x1080 title card. SVG source beside each PNG.
- `index.html` the brand sheet with colour values and usage rules (served at /brand/ on the site).

## Naming

`<asset>-<ground>[-<width>].<ext>`

- `mark`              the stereo W alone
- `mark-xr`           W with XR underneath (compact square)
- `lockup-stacked`    W over WOODFORD XR (the square version for avatars and icons)
- `lockup-horizontal` W beside WOODFORD XR (the primary lockup)
- `wordmark`          WOODFORD XR alone
- `-dark`             for dark backgrounds: bone wordmark, brighter red and cyan
- `-light`            for light backgrounds: ink wordmark, deeper red and cyan

## Colour

| Role | On dark | On light |
| --- | --- | --- |
| Ink (background, wordmark on light) | `#0B0D10` | `#0B0D10` |
| Bone (background on light, wordmark on dark) | `#F2EEE6` | `#F2EEE6` |
| Left eye | `#FF3D33` | `#E8362D` |
| Right eye | `#19D2E6` | `#12B4C6` |
| Fused core | `#F7F7F2` | `#FFFFFF` |

## Rules

- Clear space: at least one W stroke width (about a fifth of the mark's height) on every side.
- Minimum width for the horizontal lockup is about 140 px; below that use the mark alone.
- Do not recolour the eyes, swap red and cyan, add gradients or shadows, outline the mark, rotate it, or set the wordmark in a live font.
- Next to Depthray: company lockup small in a corner, product lockup as the headline. They share red and cyan on purpose.

## Regenerating

The generator lives in the Claude session that built this (`pack.js` on top of `lib.js` and `concepts.js`, Node with opentype.js and resvg). Ask for it if you want to tweak sizes or add formats.
