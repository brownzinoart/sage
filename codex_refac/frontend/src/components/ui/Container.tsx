import { forwardRef } from 'react'
import { clsx } from 'clsx'

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  children: React.ReactNode
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ size = 'lg', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          // Base container styles from design system
          {
            'container-sm': size === 'sm',
            'container-md': size === 'md',
            'container-lg': size === 'lg',
            'container-xl': size === 'xl',
            'w-full px-6': size === 'full',
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Container.displayName = 'Container'

export default Container