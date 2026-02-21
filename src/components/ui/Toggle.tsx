import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ToggleProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  'aria-label'?: string;
}

export function Toggle({ options, value, onChange, className, 'aria-label': ariaLabel }: ToggleProps) {
  return (
    <div 
      className={cn("flex rounded-md bg-muted p-1", className)}
      role="radiogroup"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative flex-1 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isSelected ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isSelected && (
              <motion.div
                layoutId="toggle-indicator"
                className="absolute inset-0 rounded-sm bg-background shadow-sm"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
