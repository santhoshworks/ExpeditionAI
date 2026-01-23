# CTA Button System Documentation

## Overview

This document outlines the standardized CTA (Call-to-Action) button system implemented to ensure consistent styling and behavior across all themes (light/dark) and states (default/hover/active).

## Component: CTAButton

Location: `components/ui/cta-button.tsx`

### Variants

#### Primary (`variant="primary"`)
- **Use case**: Main actions, sign-ups, primary conversions
- **Colors**: Indigo-based with proper dark mode support
- **Example**: "Start Your Expedition", "Sign Up Free"

```tsx
<CTAButton variant="primary" size="lg">
  Start Your Expedition
</CTAButton>
```

#### Secondary (`variant="secondary"`)
- **Use case**: Important but not primary actions
- **Colors**: Slate-based with inverted dark mode colors
- **Example**: "Sign In", "Begin Learning Journey"

```tsx
<CTAButton variant="secondary" size="default">
  Sign In
</CTAButton>
```

#### Outline (`variant="outline"`)
- **Use case**: Secondary actions, alternative options
- **Colors**: Transparent background with indigo border
- **Example**: "Try Demo", "Learn More"

```tsx
<CTAButton variant="outline" size="lg">
  Try Interactive Demo
</CTAButton>
```

#### Ghost (`variant="ghost"`)
- **Use case**: Subtle actions, navigation links
- **Colors**: Transparent with hover states
- **Example**: Navigation items, subtle links

```tsx
<CTAButton variant="ghost" size="sm">
  Back to Home
</CTAButton>
```

### Sizes

- `sm`: Height 36px (h-9) - For compact spaces
- `default`: Height 48px (h-12) - Standard size
- `lg`: Height 56px (h-14) - For emphasis
- `xl`: Height 64px (h-16) - For hero sections

### Props

```tsx
interface CTAButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "success"
  size?: "sm" | "default" | "lg" | "xl" | "icon"
  fullWidth?: boolean
  asChild?: boolean // For use with Link components
  disabled?: boolean
  className?: string
  children: React.ReactNode
}
```

## Theme Consistency

### Light Theme
- **Primary**: `bg-indigo-600 hover:bg-indigo-700`
- **Secondary**: `bg-slate-900 hover:bg-slate-800`
- **Outline**: `border-indigo-600 text-indigo-600 hover:bg-indigo-50`

### Dark Theme
- **Primary**: `dark:bg-indigo-600 dark:hover:bg-indigo-500`
- **Secondary**: `dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200`
- **Outline**: `dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-950/50`

## Usage Examples

### With Next.js Link
```tsx
<CTAButton asChild variant="primary" size="lg">
  <Link href="/signup">Get Started</Link>
</CTAButton>
```

### Form Submit Button
```tsx
<CTAButton 
  type="submit" 
  variant="secondary" 
  size="lg" 
  fullWidth
  disabled={loading}
>
  {loading ? "Processing..." : "Submit"}
</CTAButton>
```

### Icon Button
```tsx
<CTAButton variant="ghost" size="icon">
  <ArrowLeft className="w-4 h-4" />
</CTAButton>
```

## Migration Guide

### Before (Inconsistent)
```tsx
// Old inconsistent patterns
<Button className="bg-slate-900 hover:bg-indigo-600">Get Started</Button>
<Button className="bg-indigo-600 hover:bg-slate-900">Sign Up</Button>
```

### After (Consistent)
```tsx
// New consistent patterns
<CTAButton variant="secondary">Get Started</CTAButton>
<CTAButton variant="primary">Sign Up</CTAButton>
```

## Files Updated

1. **Landing Page** (`app/page.tsx`)
   - Header "Get Started" button
   - Hero section CTAs
   - Methodology section CTA
   - Final CTA section

2. **Auth Pages**
   - Login page (`app/(auth)/login/page.tsx`)
   - Signup page (`app/(auth)/signup/page.tsx`)

3. **Demo Pages**
   - Demo landing (`app/demo/page.tsx`)
   - Demo chat (`app/demo/chat/page.tsx`)

## Benefits

1. **Consistency**: All CTAs follow the same design patterns
2. **Theme Support**: Proper light/dark mode transitions
3. **Accessibility**: Consistent focus states and contrast ratios
4. **Maintainability**: Single source of truth for CTA styling
5. **Developer Experience**: Clear variant names and predictable behavior

## Best Practices

1. **Use `primary` for main conversion actions** (sign-up, purchase, etc.)
2. **Use `secondary` for important but not primary actions** (sign-in, continue, etc.)
3. **Use `outline` for alternative options** (demos, learn more, etc.)
4. **Use `ghost` for subtle navigation** (back buttons, menu items, etc.)
5. **Always test in both light and dark themes**
6. **Use `asChild` prop with Link components** for proper routing
7. **Include loading states** for async actions
8. **Use appropriate sizes** based on context and importance

## Testing Checklist

- [ ] All CTAs work in light theme
- [ ] All CTAs work in dark theme
- [ ] Hover states are consistent
- [ ] Active states provide feedback
- [ ] Focus states are accessible
- [ ] Loading states are clear
- [ ] Disabled states are obvious
- [ ] Mobile responsiveness maintained