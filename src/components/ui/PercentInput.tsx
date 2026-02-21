import React, { useState, useEffect, useId } from 'react';
import { cn } from '@/lib/utils';

interface PercentInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  onChange: (value: number) => void;
  label: string;
  error?: string;
}

export function PercentInput({ value, onChange, label, error, className, id: providedId, ...props }: PercentInputProps) {
  const generatedId = useId();
  const id = providedId || generatedId;
  const [displayValue, setDisplayValue] = useState(value.toString());

  useEffect(() => {
    setDisplayValue(value.toString());
  }, [value]);

  const handleBlur = () => {
    const parsed = parseFloat(displayValue);
    if (!isNaN(parsed)) {
      onChange(parsed);
      setDisplayValue(parsed.toString());
    } else {
      setDisplayValue(value.toString());
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*\.?\d*$/.test(val)) {
      setDisplayValue(val);
    }
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && <label htmlFor={id} className="text-sm font-medium text-foreground/80">{label}</label>}
      <div className="relative">
        <input
          id={id}
          type="text"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "w-full rounded-md border border-input bg-background px-3 py-2 pr-7 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow",
            error && "border-destructive focus-visible:ring-destructive"
          )}
          {...props}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true">%</span>
      </div>
      {error && <span id={`${id}-error`} className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
