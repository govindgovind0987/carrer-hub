'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const RadioGroup = React.forwardRef(({ className, value, onValueChange, children, ...props }, ref) => {
  return (
    <div className={cn('grid gap-2', className)} ref={ref} role="radiogroup" {...props}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, {
          selectedValue: value,
          onSelectValue: onValueChange,
        });
      })}
    </div>
  );
});
RadioGroup.displayName = 'RadioGroup';

const RadioGroupItem = React.forwardRef(({ className, value, selectedValue, onSelectValue, ...props }, ref) => {
  const isChecked = selectedValue === value;

  return (
    <div
      ref={ref}
      onClick={() => onSelectValue && onSelectValue(value)}
      className={cn(
        'aspect-square h-4 w-4 rounded-full border border-violet-500 text-violet-600 flex items-center justify-center cursor-pointer transition-all',
        isChecked ? 'bg-violet-600 border-violet-600' : 'bg-transparent border-muted-foreground/40',
        className
      )}
      {...props}
    >
      {isChecked && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
    </div>
  );
});
RadioGroupItem.displayName = 'RadioGroupItem';

export { RadioGroup, RadioGroupItem };
