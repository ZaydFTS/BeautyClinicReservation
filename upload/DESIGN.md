---
name: Velvet Bloom
colors:
  surface: '#fff7f9'
  surface-dim: '#e3d7dc'
  surface-bright: '#fff7f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fdf0f6'
  surface-container: '#f7eaf0'
  surface-container-high: '#f2e5eb'
  surface-container-highest: '#ecdfe5'
  on-surface: '#201a1e'
  on-surface-variant: '#54424b'
  inverse-surface: '#362e33'
  inverse-on-surface: '#faedf3'
  outline: '#87717c'
  outline-variant: '#d9c0cc'
  surface-tint: '#a42c82'
  primary: '#a42c82'
  on-primary: '#ffffff'
  primary-container: '#ff79d1'
  on-primary-container: '#78005d'
  inverse-primary: '#ffaedd'
  secondary: '#943e7e'
  on-secondary: '#ffffff'
  secondary-container: '#fd97dd'
  on-secondary-container: '#7b2867'
  tertiary: '#635c62'
  on-tertiary: '#ffffff'
  tertiary-container: '#afa6ad'
  on-tertiary-container: '#423c41'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd8eb'
  primary-fixed-dim: '#ffaedd'
  on-primary-fixed: '#3b002d'
  on-primary-fixed-variant: '#850a68'
  secondary-fixed: '#ffd8ee'
  secondary-fixed-dim: '#ffade3'
  on-secondary-fixed: '#3b0030'
  on-secondary-fixed-variant: '#782565'
  tertiary-fixed: '#eae0e6'
  tertiary-fixed-dim: '#cec4ca'
  on-tertiary-fixed: '#1f1a1f'
  on-tertiary-fixed-variant: '#4b454a'
  background: '#fff7f9'
  on-background: '#201a1e'
  surface-variant: '#ecdfe5'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

The design system is centered on a premium, feminine aesthetic that balances clinical precision with high-end luxury. The brand personality is welcoming, sophisticated, and revitalizing. 

The visual style leverages **Glassmorphism** combined with **Minimalism**. We use soft backdrop blurs and translucent surfaces to create a sense of airiness and cleanliness, while maintaining structural integrity through precise typography and ample whitespace. The goal is to evoke the feeling of a serene, upscale spa environment—modern, polished, and meticulously cared for.

## Colors

The palette is derived directly from the clinic's core identity, utilizing a hierarchy that ensures legibility and "pop."

- **Primary (Vibrant Pink):** Used for primary calls to action, active states, and brand-defining accents. It represents energy and beauty.
- **Secondary (Dark Purple):** Used for headings and high-contrast UI elements. It provides the "clinical" anchor and professional weight.
- **Tertiary (Soft Blush):** A very light tint of the primary pink, used for large background sections to soften the UI.
- **Neutral:** A deep, almost-black charcoal with a hint of purple for body text, and pure white for surface backgrounds.

## Typography

This design system uses a high-contrast serif and sans-serif pairing. **Playfair Display** provides the editorial, high-fashion elegance required for headlines, while **Be Vietnam Pro** offers a contemporary, approachable, and highly readable experience for functional text.

Titles and headlines should use the secondary Dark Purple color to maintain authority. Body text should maintain a generous line height to ensure the UI feels "breathable" and calm.

## Layout & Spacing

The layout follows a **Fluid Grid** system based on an 8px baseline. 

- **Desktop:** 12-column grid with 24px gutters and large 64px side margins to focus content in the center.
- **Tablet:** 8-column grid with 20px gutters.
- **Mobile:** 4-column grid with 16px gutters and 16px side margins.

Spacing should be generous. Use 'xl' spacing between major sections to emphasize the premium nature of the brand. Components should favor internal padding over external margins to maintain a clean "card-like" structure.

## Elevation & Depth

We avoid heavy, dark shadows in favor of **Tonal Layers** and **Glassmorphism**. 

- **Level 1 (Base):** White or Blush (#FDF2F9) background.
- **Level 2 (Cards):** White background with a very soft, high-spread shadow (10% opacity of the secondary color) or a 1px soft border (#F1E4EE).
- **Level 3 (Modals/Overlays):** Semi-transparent white (80% opacity) with a 20px backdrop blur. 

Depth is primarily communicated through color shifts rather than physical distance, keeping the interface feeling modern and light.

## Shapes

The shape language is **Rounded**, reflecting the organic and soft nature of beauty and skin. 

A standard radius of 0.5rem (8px) is used for most UI elements like input fields and small cards. Larger containers and buttons should use the `rounded-lg` (16px) or `rounded-xl` (24px) variants to reinforce the friendly, approachable brand personality. Icons should use rounded terminals to match the font geometry.

## Components

- **Buttons:** Primary buttons use a solid Vibrant Pink fill with white text. Secondary buttons use a Dark Purple outline with a subtle Blush background on hover. Use `rounded-xl` for a more premium, pill-like feel.
- **Chips:** Used for treatment categories (e.g., "Facial," "Laser"). Use light Blush backgrounds with Dark Purple text.
- **Inputs:** Clean, white backgrounds with a subtle 1px border. On focus, the border transitions to Vibrant Pink with a soft outer glow.
- **Cards:** Use a white background, `rounded-lg` corners, and a subtle drop shadow. Ensure generous internal padding (min 24px).
- **Lists:** Service menus should use the Serif font for item names and a small, uppercase Label-MD for the price/duration, separated by a thin horizontal rule.
- **Booking Calendar:** A custom component using high-contrast selection states in Vibrant Pink, ensuring the user's path to conversion is visually prioritized.