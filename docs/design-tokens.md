# Reusable design tokens

Import `src/styles/tokens.css`. Components consume semantic aliases so future pages can use the same theme. These are every authored UI color and font used on the registration page; the raster logo is preserved as an asset, not converted into palette tokens.

| CSS custom property | Value | Purpose |
| --- | --- | --- |
| `--color-impact-ink` | `#20211F` | Text and footer background |
| `--color-impact-muted` | `#66665F` | Secondary text and desktop links |
| `--color-impact-orange` | `#EC7B26` | Primary buttons |
| `--color-impact-paper` | `#FFFCF8` | Page background |
| `--color-impact-white` | `#FFFFFF` | Cards, inputs, header and footer text |
| `--color-input-border` | `#D9D9D9` | Input borders |

Semantic aliases: `--color-text`, `--color-text-secondary`, `--color-surface`, `--color-page`, `--color-action`.

Font family: `--font-family-primary: 'Manrope', sans-serif`. Manrope files are included for weights 400 (`--font-weight-regular`), 500 (`--font-weight-medium`) and 700 (`--font-weight-bold`). Generic sans-serif is only a load-failure fallback.

| Role | Size token | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Desktop heading / wordmark | `--font-size-heading` | 40px | 700 | 56px |
| Mobile heading | `--font-size-heading-mobile` | 32px | 700 | 45px |
| Footer title | `--font-size-title` | 24px | 700 | 34px |
| Body / input / field label | `--font-size-body` | 16px | 400 | 22px |
| Button / navigation | `--font-size-label` | 14px | 700 | 20px |
| Caption / consent | `--font-size-caption` | 12px | 500 | 17px |

Figma specifies 140% line height; these pixel values preserve its rounded text bounds. The instructor navigation label uses Figma's automatic line height (`normal`). Letter spacing is the normal font spacing throughout.

Reusable dimensions include 8px input corners, 10px button corners, 20px card corners, 8px field gap, 24px vertical stack gap, and 64px/16px desktop/mobile page gutters. All are named in tokens.css.

```css
.future-card {
  background: var(--color-surface);
  color: var(--color-text);
  border-radius: var(--radius-card);
  font-family: var(--font-family-primary);
}
```
