# Design System: Light Glassmorphism 3D

<!-- impeccable:design-schema 1 -->

## Direction Contract

- **THESIS**: Replace standard flat material containers with a translucent, multi-layered Light Glassmorphism spatial architecture. Use floating 3D geometric shapes (glass orbs & cubes) and subtle 3D card tilt transformations to create spatial depth while keeping high typography readability.
- **OWN-WORLD**: Frosted Pearl White surfaces (`rgba(255, 255, 255, 0.7)`), 16px backdrop blur filters, ultra-crisp 1px semi-transparent borders, and vibrant Indigo/Cyan gradients for primary actions and status accents.
- **STORY**: Visitors experience an ultra-modern, luminous e-commerce environment where items float on glass tiles with immediate visual feedback, soft depth shadows, and fluid interactive transitions.
- **FIRST VIEWPORT**: Floating sticky Glass Navbar with blur, Ambient 3D Glass Orbs animated in the background, a glowing glass Search & Filter hero bar, and elevated 3D glass Product Cards.

## Color Palette & Tokens

### Base & Backgrounds
- `--color-bg-base`: `#F8FAFC` (Frosted Pearl Slate)
- `--color-bg-gradient`: `linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 50%, #E0F2FE 100%)`
- `--glass-bg-primary`: `rgba(255, 255, 255, 0.75)`
- `--glass-bg-secondary`: `rgba(255, 255, 255, 0.55)`
- `--glass-bg-card`: `rgba(255, 255, 255, 0.8)`
- `--glass-bg-hover`: `rgba(255, 255, 255, 0.9)`

### Borders & Reflections
- `--glass-border`: `1px solid rgba(255, 255, 255, 0.8)`
- `--glass-border-subtle`: `1px solid rgba(226, 232, 240, 0.6)`
- `--glass-border-accent`: `1px solid rgba(99, 102, 241, 0.3)`

### Glass Filter Effects
- `--glass-blur-sm`: `blur(8px) saturate(160%)`
- `--glass-blur-md`: `blur(16px) saturate(180%)`
- `--glass-blur-lg`: `blur(24px) saturate(200%)`

### Accents & Gradients
- `--gradient-primary`: `linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)` (Indigo Glow)
- `--gradient-accent`: `linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)` (Violet Cyan)
- `--gradient-glass-glow`: `radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15), transparent 70%)`

### Typography & Contrast
- `--color-text-primary`: `#0F172A` (Slate 900 - High Contrast)
- `--color-text-secondary`: `#475569` (Slate 600)
- `--color-text-muted`: `#94A3B8` (Slate 400)
- `--color-text-accent`: `#4F46E5`

### Depth Shadows
- `--glass-shadow-sm`: `0 4px 12px rgba(15, 23, 42, 0.03), inset 0 1px 1px rgba(255, 255, 255, 0.8)`
- `--glass-shadow-md`: `0 12px 32px -8px rgba(99, 102, 241, 0.12), 0 4px 12px rgba(0, 0, 0, 0.03), inset 0 1px 2px rgba(255, 255, 255, 0.9)`
- `--glass-shadow-lg`: `0 24px 48px -12px rgba(79, 70, 229, 0.2), inset 0 1px 3px rgba(255, 255, 255, 1)`

## Typography

- **Font Family**: `'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif`
- **Headings**: Semi-bold to Bold (`600` / `700`), tight tracking (`-0.02em`), dark slate color.
- **Body**: Regular to Medium (`400` / `500`), optimal line height (`1.6`).

## 3D Floating Orbs & Animation Rules

### Ambient Background 3D Orbs
- Spherical gradients rendered with CSS `radial-gradient` and dynamic keyframe floating animations.
- Keyframes: `floatOrb1` (18s ease-in-out infinite alternate), `floatOrb2` (22s ease-in-out infinite alternate).
- Non-blocking pointer events (`pointer-events: none`).

### Interactive 3D Card Hover
- `transform: translateY(-6px) rotateX(2deg) scale(1.01)`
- Smooth cubic-bezier transition: `transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)`
- Glass sheen highlight on hover using pseudo-element linear gradient translation.

## Component Specifications

### Glass Card Utility (`.glass-card`)
- Background: `var(--glass-bg-card)`
- Backdrop Filter: `var(--glass-blur-md)`
- Border: `var(--glass-border)`
- Border Radius: `16px` (or `20px` for large containers)
- Box Shadow: `var(--glass-shadow-md)`

### Glass Button (`.btn-glass-primary`)
- Background: `var(--gradient-primary)`
- Color: `#FFFFFF`
- Font Weight: `600`
- Border Radius: `12px`
- Shadow: `0 8px 20px -4px rgba(99, 102, 241, 0.4)`
- Hover: Scale `1.02` with amplified shadow `0 12px 24px -4px rgba(99, 102, 241, 0.5)`

### Glass Input / Search Bar (`.glass-input`)
- Background: `rgba(255, 255, 255, 0.8)`
- Backdrop Filter: `var(--glass-blur-sm)`
- Border: `var(--glass-border-subtle)`
- Focus: `border-color: #6366F1`, glow shadow `0 0 0 3px rgba(99, 102, 241, 0.2)`

## Accessibility & Responsive Rules

- Ensure all body text maintains WCAG AA contrast ratio (> 4.5:1) over frosted glass panels.
- On screens smaller than `768px`, reduce backdrop blur to `8px` for optimal mobile GPU performance.
