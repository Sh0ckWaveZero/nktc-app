# Design System

Auto-extracted from codebase. Source of truth: `src/@core/theme/`.

---

## Color

### Strategy: Restrained

One accent (primary blue) ≤10% of surface. Neutrals tinted toward cool purple-grey. Dark mode default.

### Palette

| Role | Hex | Usage |
|---|---|---|
| primary | `#16B1FF` | CTAs, active states, focus rings, links |
| primary.light | `#32BAFF` | Hover highlights, info chips |
| primary.dark | `#139CE0` | Pressed state |
| secondary | `#8A8D93` | Muted actions, secondary buttons |
| success | `#56CA00` | Present/check-in, positive status |
| error | `#FF4C51` | Validation errors, absent/alert status |
| warning | `#FFB400` | Late/partial attendance |
| purple (other) | `#9155FD` | Used sparingly for special roles |

### Surfaces

| Token | Light | Dark |
|---|---|---|
| background.default | `#ECEEF6` | `#1a1625` |
| background.paper | `#F7F8FD` | `#2a1f3d` |
| tableHeaderBg | `#E8EAF4` | `#2a1f3d` |
| darkBg (fixed) | — | `#1a1625` |

### Text

| Role | Light | Dark |
|---|---|---|
| text.primary | `rgba(58,53,65, 0.98)` | `rgba(231,227,252, 0.98)` |
| text.secondary | `rgba(58,53,65, 0.85)` | `rgba(231,227,252, 0.85)` |
| text.disabled | `rgba(58,53,65, 0.50)` | `rgba(231,227,252, 0.50)` |
| divider | `rgba(main, 0.12)` | same formula |
| headerText | `#637381` | — |

### Border on inputs (OutlinedInput)

- Default: `rgba(main, 0.22)`
- Hover: `rgba(main, 0.32)`
- Disabled: `text.disabled`

---

## Typography

### Font Stack

```
Kanit, 'Noto Sans Thai', Sarabun, sans-serif, -apple-system, BlinkMacSystemFont, ...
```

Kanit is primary. Thai glyph coverage via Noto Sans Thai fallback. `responsiveFontSizes: true`.

### Scale

| Variant | Weight | Letter Spacing | Notes |
|---|---|---|---|
| h1 | 500 | -1.5px | |
| h2 | 500 | -0.5px | |
| h3 | 500 | 0 | |
| h4 | 500 | 0.25px | |
| h5 | 500 | 0 | |
| h6 | 400 | 0.15px | |
| subtitle1 | — | 0.15px | color: text.primary |
| subtitle2 | — | 0.1px | color: text.secondary — section labels |
| body1 | — | 0.15px | color: text.primary |
| body2 | — | 0.15px | lineHeight 1.5, color: text.secondary |
| caption | — | 0.4px | color: text.secondary — metadata, dates |
| button | 500 | 0.3px | |
| overline | — | 1px | color: text.secondary |

### Patterns in use

- Section labels: `variant='subtitle2'` + `color='text.secondary'` + `fontWeight: 500`
- Dialog header: `variant='h6'` for title, `variant='caption'` for date subtitle
- InfoRow labels: `variant='caption'` stacked above value
- Status text: `variant='body2'`

---

## Spacing

Base unit: `0.25rem` (4px). All spacing uses MUI's `theme.spacing(n)` = `n × 0.25rem`.

| Factor | Value | Usage |
|---|---|---|
| 0.5 | 2px | Icon gaps, tight inline |
| 1 | 4px | Small gaps |
| 2 | 8px | Compact padding |
| 2.5 | 10px | Inner Grid spacing, dense sections |
| 3 | 12px | Section Grid spacing |
| 4 | 16px | Standard padding |
| 5 | 20px | Card/CardContent/CardHeader/Dialog padding |
| 6 | 24px | Section gaps |

### Rhythm rule

Vary spacing between sections for visual rhythm. Never uniform padding top-to-bottom.

---

## Shape

```
borderRadius: 6   // global (theme.shape.borderRadius)
borderRadius: 5   // Button override
```

Cards, Dialogs, Chips, Inputs all inherit 6px unless overridden.

---

## Elevation

Source: `src/@core/theme/shadows/index.ts`. Shadow color: `rgba(58,53,65, …)` light / `rgba(19,17,32, …)` dark.

| Level | Usage |
|---|---|
| 0 | Bordered skin, flat |
| 3 | Contained buttons |
| 6 | Cards, Dialogs (`0px 2px 10px 0px rgba(58,53,65, 0.1)`) |

Dialogs do **not** have extra border in `default` skin — box-shadow only.

---

## Motion

View transitions: `200ms cubic-bezier(0.4, 0, 0.2, 1)`.

```css
@keyframes fade-in  { from { opacity:0; transform: translateY(10px) } to { opacity:1; transform: translateY(0) } }
@keyframes fade-out { from { opacity:1; transform: translateY(0) } to { opacity:0; transform: translateY(-10px) } }
```

`prefers-reduced-motion`: collapses all animations to `0.01ms`.

Do not animate layout properties. No bounce, no elastic.

---

## Components

### Button

```
root:      padding spacing(1.875, 3),  borderRadius 5, fontWeight 500
contained: padding spacing(1.875, 5.5), boxShadow[3]
outlined:  padding spacing(1.625, 5.25)
sizeSmall: padding spacing(1, 2.25)
sizeLarge: padding spacing(2.125, 5.5)
```

Loading state: `CircularProgress size={16} color='inherit'` as `startIcon`.

Secondary text actions (map, preview): `variant='text'` `size='small'` `color='secondary'` or `color='primary'`, `sx={{ fontSize:'0.72rem', px:1, minWidth:0 }}`.

### Card

- `boxShadow: shadows[6]`
- Padding: `spacing(5)` on CardHeader, CardContent, CardActions
- Border only when `skin === 'bordered'`

### Dialog

- `boxShadow: shadows[6]`
- `MuiDialogTitle`: `padding spacing(5)`
- `MuiDialogContent`: `padding spacing(5)`
- `MuiDialogActions`: default padding (dense class uses `spacing(2.5)`)
- Mobile (`max-width: 599px`): `margin spacing(4)`, full-width with `spacing(8)` total bleed

### TextField / OutlinedInput

- Label color: `text.secondary`
- Border: `rgba(main, 0.22)` → hover `0.32` → focused `primary.main`
- Disabled: `text.disabled` border, `borderBottomStyle: solid` for standard variant
- `InputAdornment` + `IconButton` for end-of-input actions (clear, etc.)

### Chip

- Outlined default: `borderColor rgba(main, 0.22)`
- Delete icon: 18×18px

### DataGrid

Uses `src/@core/theme/overrides/dataGrid.ts`. Table header: `tableHeaderBg`.

---

## Layout

- **Layout**: Vertical nav
- **Skin**: `default` (no border, shadow only)
- **Mode default**: `dark`
- **ContentWidth**: `boxed`
- **Nav width**: 260px (collapsed: 68px)
- **AppBar**: fixed, blur enabled
- **Footer**: static

### Dialog layout pattern

```
DialogTitle
  └─ Stack direction='row' alignItems='flex-start' justifyContent='space-between'
       ├─ Box (left: title + subtitle text)
       └─ IconButton (close ×)
DialogContent id='…-dialog-content'
  └─ Grid container spacing={3}  ← section-level
       └─ Grid size={12} (each section)
            └─ Grid container spacing={2.5}  ← field-level inner
DialogActions
  └─ Button outlined (cancel) + Button contained (save)
```

Section label pattern:
```tsx
<Typography variant='subtitle2' color='text.secondary' sx={{ fontWeight: 500, mb: 1 }}>
  ชื่อ Section
</Typography>
```

---

## Accessibility

WCAG 2.1 AA:
- Body text contrast ≥ 4.5:1
- UI components / large text ≥ 3:1
- Keyboard navigation on all interactive elements
- Dark mode supported (primary mode)
- Every interactive element **must** have an `id` prop (kebab-case)

---

## Conventions

- Styling: MUI `sx` prop only. No custom CSS files.
- No styled-components. No raw `<div style={…}>`.
- Grid: MUI v9 `<Grid size={n}>` (not `xs/sm/md`).
- Icons: `mdi-material-ui` package for action icons; `@mui/icons-material` for standard MUI icons.
- Toast: `react-hot-toast`, position `top-right`.
- Date display: Thai Buddhist calendar via `Intl.DateTimeFormat('th-TH-u-ca-buddhist')`.
- No comments explaining what code does. Comment only non-obvious WHY.
