import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'outline' | 'soft';
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant = 'default', ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                    {
                        'border-transparent bg-primary text-white hover:bg-primary/80': variant === 'default',
                        'text-text border border-gray-200': variant === 'outline',
                        'bg-primary/10 text-primary hover:bg-primary/20': variant === 'soft',
                    },
                    className
                )}
                {...props}
            />
        );
    }
);

Badge.displayName = 'Badge';

export { Badge };
