import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'neon'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full font-medium transition-all',
          'focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
          variant === 'default' && 'bg-white text-black hover:bg-gray-100 px-4 py-2',
          variant === 'neon' && 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold shadow-lg',
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }
