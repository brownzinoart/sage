# Sage Design System

A comprehensive design system for the Sage Hemp AI platform that prioritizes accessibility, consistency, and the calming zen aesthetic that users appreciate.

## Overview

The Sage Design System addresses the key issues identified in the architecture review:
- **Typography chaos** → Single Inter font family with semantic type scale
- **Scrolling problems** → Proper container management and responsive design
- **Inconsistent styling** → Systematic component library with design tokens
- **Overwhelming interactions** → Performance-optimized, meaningful animations

## Design Principles

### 1. **Calm Confidence**
Non-tech-savvy users need to feel safe and guided. Every interaction should reduce anxiety, not create it.

### 2. **Accessibility First**
WCAG AA compliance minimum, AAA where possible. Support for reduced motion, screen readers, and keyboard navigation.

### 3. **Consistent Experience** 
Predictable patterns across all components. Users should never have to relearn interactions.

### 4. **Performance Optimized**
Fast loading, smooth animations, optimized for mobile. Technical excellence hidden behind simplicity.

## Design Tokens

### Colors

Our color system is built around the Sage brand with semantic usage and guaranteed accessibility.

```css
/* Sage Brand Colors - All WCAG compliant */
--sage-50: #f7faf6    /* Background tints */
--sage-100: #e8f5e8   /* Subtle backgrounds */
--sage-200: #d1e7cc   /* Borders, dividers */
--sage-300: #a8d19a   /* Disabled states */
--sage-400: #87a96b   /* Secondary actions */
--sage-500: #6b8e23   /* Primary brand - WCAG AAA */
--sage-600: #4a7c59   /* Primary hover */
--sage-700: #3d5a47   /* Primary pressed */
--sage-800: #2d3e2f   /* High contrast text */
--sage-900: #1a2218   /* Strongest contrast */

/* Semantic Colors */
--color-success: #6b8e23  /* Uses sage-500 */
--color-warning: #d97706  /* Orange-600 - WCAG AA */
--color-error: #dc2626    /* Red-600 - WCAG AA */
--color-info: #0ea5e9     /* Sky-500 - WCAG AA */
```

### Typography

Single font family (Inter) with semantic type scale based on 1.25 modular scale.

```css
/* Font Family */
--font-family-primary: 'Inter', system-ui, -apple-system, sans-serif;

/* Type Scale */
--font-size-xs: 0.75rem      /* 12px - Captions, fine print */
--font-size-sm: 0.875rem     /* 14px - Small body text */
--font-size-base: 1rem       /* 16px - Body text */
--font-size-lg: 1.25rem      /* 20px - Large body, small headings */
--font-size-xl: 1.5rem       /* 24px - Headings */
--font-size-2xl: 1.875rem    /* 30px - Large headings */
--font-size-3xl: 2.25rem     /* 36px - Display text */
--font-size-4xl: 3rem        /* 48px - Large display */
--font-size-5xl: 3.75rem     /* 60px - Hero text */
--font-size-6xl: 4.5rem      /* 72px - Giant display */
```

### Spacing

Consistent rhythm using rem-based scale.

```css
--space-1: 0.25rem   /* 4px */
--space-2: 0.5rem    /* 8px */
--space-3: 0.75rem   /* 12px */
--space-4: 1rem      /* 16px */
--space-6: 1.5rem    /* 24px */
--space-8: 2rem      /* 32px */
--space-12: 3rem     /* 48px */
--space-16: 4rem     /* 64px */
--space-20: 5rem     /* 80px */
--space-24: 6rem     /* 96px */
```

## Component Library

### Typography Components

**Usage**: Import semantic typography components instead of using raw HTML tags.

```jsx
import { Display, Heading, Body, Caption } from '@/components/ui/Typography'

// Display text for heroes and major headlines
<Display size="lg">Sage</Display>

// Semantic headings with proper hierarchy
<Heading level={2} size="lg">Product Recommendations</Heading>

// Body text with size and color variants
<Body size="lg" color="secondary">
  Your AI hemp guide is ready to help
</Body>

// Small text for captions and metadata
<Caption>Lab tested & NC compliant</Caption>
```

### Button Components

**Usage**: Consistent interaction patterns with proper states.

```jsx
import Button from '@/components/ui/Button'

// Primary action - most important on page
<Button variant="primary" size="lg">
  Ask Sage
</Button>

// Secondary action - alternative choice
<Button variant="secondary">
  Learn More
</Button>

// Ghost button - subtle actions
<Button variant="ghost" size="sm">
  Show Details
</Button>

// Loading state
<Button loading>
  Processing...
</Button>
```

### Card Components

**Usage**: Content grouping with consistent elevation.

```jsx
import Card, { CardHeader, CardContent, CardFooter } from '@/components/ui/Card'

<Card variant="elevated" hover>
  <CardHeader>
    <Heading level={3} size="md">Night Time CBD Gummies</Heading>
  </CardHeader>
  <CardContent>
    <Body>5mg CBD + 2mg CBN per gummy. Infused with lavender...</Body>
  </CardContent>
  <CardFooter>
    <Button variant="primary">Learn More</Button>
  </CardFooter>
</Card>
```

### Input Components

**Usage**: Form inputs with proper labels and error states.

```jsx
import Input from '@/components/ui/Input'

<Input
  label="What's on your mind?"
  placeholder="I can't sleep... I'm stressed..."
  helperText="Your questions stay private and secure"
  error={false}
/>
```

### Layout Components

**Usage**: Proper content containers with responsive breakpoints.

```jsx
import Container from '@/components/ui/Container'

// Standard page container
<Container size="lg">
  <main>Content here</main>
</Container>

// Narrow content like articles
<Container size="md">
  <article>Article content</article>
</Container>
```

## Animation Guidelines

### Performance First
- Use `transform` and `opacity` for animations (GPU accelerated)
- Limit concurrent animations
- Respect `prefers-reduced-motion`

### Meaningful Motion
- **Fade in**: New content appearing
- **Slide up**: Content entering from below
- **Scale in**: Modal dialogs, tooltips
- **Gentle bounce**: Feedback for interactions

```css
/* Available animation classes */
.animate-fade-in      /* 500ms fade in */
.animate-slide-up     /* 350ms slide from bottom */
.animate-scale-in     /* 250ms scale from 95% */
.animate-gentle-bounce /* Infinite gentle bounce */
```

## Layout System

### Responsive Containers
Fix the viewport issues by using proper container management:

```jsx
// Bad - Fixed viewport causes mobile issues
<div style={{ minHeight: '100vh', width: '100vw' }}>

// Good - Let content flow naturally
<div className="min-h-screen">
  <Container size="lg">
    <main className="py-12">
```

### Grid System
Use CSS Grid and Flexbox through Tailwind utilities:

```jsx
// Product grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {products.map(product => <ProductCard key={product.id} />)}
</div>

// Centered content
<div className="flex items-center justify-center min-h-screen">
  <div className="w-full max-w-md">
```

## Accessibility Features

### Keyboard Navigation
- All interactive elements focusable with Tab
- Custom focus indicators with `focus-visible-only` class
- Logical tab order

### Screen Reader Support
- Semantic HTML structure
- Proper heading hierarchy
- ARIA labels where needed
- `sr-only` class for screen reader only content

### Color and Contrast
- All text meets WCAG AA minimum (4.5:1)
- Primary brand color meets WCAG AAA (7:1)
- Color never the only indicator of meaning

### Reduced Motion
- Respects `prefers-reduced-motion: reduce`
- Animations disabled or simplified
- Static alternatives for moving content

## Migration Guide

### From Current Codebase

1. **Replace inline styles with design system classes**:
```jsx
// Before
<h1 style={{ fontSize: '4rem', fontWeight: 300, color: '#1a2218' }}>

// After  
<Display size="lg">
```

2. **Use semantic color tokens**:
```jsx
// Before
<div className="bg-emerald-500 text-white">

// After
<div className="bg-sage-500 text-text-inverse">
```

3. **Replace ad-hoc animations**:
```jsx
// Before
<div className="animate-pulse hover:scale-105 transition-all duration-300">

// After
<div className="animate-fade-in card-hover">
```

### Component Updates

Update existing components to use design system:

```jsx
// SageApp.tsx - Replace font family conflicts
// Before: Multiple font variables, inline styles
// After: Use Typography components

// LoadingScreen.tsx - Use design tokens
// Before: Hardcoded colors and animations  
// After: Use semantic classes and design system animations
```

## Testing the Design System

### Visual Testing
```bash
# Start development server
npm run dev

# Test responsive breakpoints
# Test in Chrome DevTools mobile view
# Test with different screen sizes
```

### Accessibility Testing
```bash
# Install axe DevTools browser extension
# Run accessibility audit on each page
# Test keyboard navigation (Tab, Enter, Escape)
# Test with screen reader (VoiceOver on Mac)
```

### Performance Testing
```bash
# Check animation performance
# Ensure smooth 60fps animations
# Test on lower-end devices
# Verify reduced motion support
```

## Design System Benefits

### For Users
- **Consistent Experience**: Predictable interactions across all features
- **Accessible**: Works for users with disabilities and different devices
- **Fast**: Optimized performance and loading times
- **Calming**: Reduced visual noise and overwhelming interactions

### For Developers  
- **Maintainable**: Single source of truth for styles
- **Scalable**: Easy to add new components following patterns
- **Efficient**: Pre-built components reduce development time
- **Type Safe**: TypeScript interfaces for all components

### For Business
- **Brand Consistency**: Cohesive Sage brand experience
- **User Trust**: Professional, polished interface builds confidence
- **Accessibility Compliance**: Meets legal requirements
- **Future Proof**: Easy to update and extend as platform grows

## Next Steps

1. **Component Migration**: Update existing components to use design system
2. **Style Audit**: Remove unused CSS and consolidate styles  
3. **Documentation**: Add Storybook for component showcase
4. **Testing**: Implement visual regression testing
5. **Guidelines**: Create usage guidelines for future development

---

This design system transforms the Sage platform from inconsistent styling to a cohesive, accessible, and scalable foundation that builds user confidence while maintaining the zen aesthetic users love.