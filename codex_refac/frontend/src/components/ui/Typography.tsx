import { forwardRef } from 'react'
import { clsx } from 'clsx'

// Display Typography Components
interface DisplayProps extends React.HTMLAttributes<HTMLHeadingElement> {
  size?: 'xl' | 'lg' | 'md'
  children: React.ReactNode
}

const Display = forwardRef<HTMLHeadingElement, DisplayProps>(
  ({ size = 'lg', className, children, ...props }, ref) => {
    return (
      <h1
        ref={ref}
        className={clsx(
          // Base display styles from design system
          {
            'text-display-xl': size === 'xl',
            'text-display-lg': size === 'lg', 
            'text-display-md': size === 'md',
          },
          'text-text-primary',
          className
        )}
        {...props}
      >
        {children}
      </h1>
    )
  }
)

// Heading Typography Components
interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6
  size?: 'xl' | 'lg' | 'md' | 'sm'
  children: React.ReactNode
}

const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level = 2, size = 'lg', className, children, ...props }, ref) => {
    const Tag = `h${level}` as const

    return (
      <Tag
        ref={ref}
        className={clsx(
          // Base heading styles from design system
          {
            'text-heading-xl': size === 'xl',
            'text-heading-lg': size === 'lg',
            'text-heading-md': size === 'md', 
            'text-heading-sm': size === 'sm',
          },
          'text-text-primary',
          className
        )}
        {...props}
      >
        {children}
      </Tag>
    )
  }
)

// Body Typography Components
interface BodyProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: 'lg' | 'md' | 'sm'
  color?: 'primary' | 'secondary' | 'tertiary' | 'disabled'
  children: React.ReactNode
}

const Body = forwardRef<HTMLParagraphElement, BodyProps>(
  ({ size = 'md', color = 'primary', className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={clsx(
          // Base body styles from design system
          {
            'text-body-lg': size === 'lg',
            'text-body': size === 'md',
            'text-body-sm': size === 'sm',
          },
          // Color variants
          {
            'text-text-primary': color === 'primary',
            'text-text-secondary': color === 'secondary',
            'text-text-tertiary': color === 'tertiary',
            'text-text-disabled': color === 'disabled',
          },
          className
        )}
        {...props}
      >
        {children}
      </p>
    )
  }
)

// Caption Typography Component
interface CaptionProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
}

const Caption = forwardRef<HTMLSpanElement, CaptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={clsx('text-caption text-text-tertiary', className)}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Display.displayName = 'Display'
Heading.displayName = 'Heading'
Body.displayName = 'Body'
Caption.displayName = 'Caption'

export { Display, Heading, Body, Caption }