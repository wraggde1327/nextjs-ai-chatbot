# TripMate Design System

## Aesthetic Direction: Warm-Minimal

Inspired by Splitwise, Revolut, Airbnb. Clean, friendly, no visual noise.
Every element justifies its existence. Hierarchy through typography and space, not borders and boxes.

## Color Palette

```
--color-bg:        #FAFAF8     /* warm off-white background */
--color-surface:   #FFFFFF     /* card/surface white */
--color-border:    #EEEEE9     /* subtle warm border */
--color-text-1:    #1A1A1A     /* primary text */
--color-text-2:    #6B7280     /* secondary text */
--color-text-3:    #9CA3AF     /* muted/caption text */
--color-accent:    #4F46E5     /* indigo — CTAs, key numbers only */
--color-accent-bg: #EEF2FF     /* accent tint for subtle highlights */
--color-success:   #10B981     /* positive / completed */
--color-warning:   #F59E0B     /* attention / pending */
--color-danger:    #EF4444     /* destructive / over-budget */
```

60/30/10 rule:
- 60% — `--color-bg` and `--color-surface`
- 30% — `--color-text-1` and `--color-text-2`
- 10% — `--color-accent` (buttons, key values, active states only)

## Typography

- **Display:** 24px / weight 700 — screen titles, big numbers
- **Title:** 18px / weight 700 — section names, card titles
- **Body:** 15px / weight 400 — content text
- **Caption:** 12px / weight 400 — timestamps, metadata

Max 4 sizes. Max 2 weights (400, 700). No other weights.
Financial numbers use tabular-nums for alignment.

## Spacing (8px Grid)

All values divisible by 4 or 8:
- 4px — tight inner gaps
- 8px — compact padding
- 12px — between related items
- 16px — standard padding
- 24px — section gaps
- 32px — major section separation

## Icons

Use Ionicons exclusively. No emojis anywhere in the UI.
Icons at 18–20px, color inherits from text context.

Category mapping:
- housing → bedOutline
- transport → carOutline
- food → restaurantOutline
- fun → ticketOutline
- shopping → bagOutline
- other → cubeOutline

## Components

### Cards
- Background: white
- Border-radius: 16px
- Border: 1px solid var(--color-border) — no shadows, no border-left accents
- Padding: 16px
- No box-shadow on cards. Depth comes from bg contrast.

### Chat Cards (compact)
- Left accent via a small 4px-wide dot/indicator, not a full border-left bar
- Subtle bg tint per type instead of border color

### Section Headers
- 12px, weight 700, color text-3, uppercase, letter-spacing 0.5px
- No emojis before text

### Lists
- Edit/delete via swipe (ion-item-sliding) only — no visible buttons
- Swipe options use text labels, not emojis

### Modals
- Clean header with text-only buttons
- Grouped form items in rounded cards

### Avatars
- 32px circle, letter inside
- Color varies by user (hash-based from palette)

### Empty States
- Centered, muted text, single-line CTA button

## Forbidden

- Emojis in UI (icons only)
- Border-left colored accent bars on cards
- Box-shadows on surfaces
- More than 2 font weights
- Random spacing values outside the 8px grid
- Visible edit/delete button text (use swipe gestures)
- Uppercase labels on card content
- Section headers with emoji prefixes
