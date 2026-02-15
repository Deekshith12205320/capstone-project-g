import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'rounded-2xl border-2 border-gray-100 bg-white text-text shadow-md transition-all duration-300 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1',
                    className
                )}
                {...props}
            />
        );
    }
);
Card.displayName = 'Card';

export { Card };
