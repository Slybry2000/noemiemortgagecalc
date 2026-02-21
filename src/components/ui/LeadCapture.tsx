import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Send } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  message: z.string().optional(),
  consent: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms',
  }),
});

type FormData = z.infer<typeof formSchema>;

export function LeadCapture({ className }: { className?: string }) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      consent: false,
    },
  });

  const onSubmit = async (data: FormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Lead captured:', data);
    
    // Fallback to mailto link since no backend is configured
    const subject = encodeURIComponent('Mortgage Estimate Inquiry');
    const body = encodeURIComponent(`Name: ${data.name}\nEmail: ${data.email || 'N/A'}\nPhone: ${data.phone || 'N/A'}\n\nMessage:\n${data.message || 'I would like to get a personalized mortgage estimate.'}`);
    window.location.assign(`mailto:noemie@piardproperties.kw.com?subject=${subject}&body=${body}`);
    
    setIsSubmitted(true);
  };

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8", className)}>
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-serif font-semibold tracking-tight text-foreground">
          Want a personalized estimate?
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Talk to Noémie to explore your options and get pre-approved.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {isSubmitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-8 text-center"
          >
            <div className="mb-4 rounded-full bg-green-100 p-3 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h4 className="text-lg font-medium text-foreground">Message Sent</h4>
            <p className="mt-2 text-sm text-muted-foreground">
              Noémie will be in touch with you shortly.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground/80">Name</label>
              <input
                id="name"
                {...register('name')}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
                className={cn(
                  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-shadow",
                  errors.name && "border-destructive focus-visible:ring-destructive"
                )}
                placeholder="Jane Doe"
              />
              {errors.name && <p id="name-error" className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground/80">Email (Optional)</label>
                <input
                  id="email"
                  {...register('email')}
                  type="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={cn(
                    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-shadow",
                    errors.email && "border-destructive focus-visible:ring-destructive"
                  )}
                  placeholder="jane@example.com"
                />
                {errors.email && <p id="email-error" className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div>
                <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-foreground/80">Phone (Optional)</label>
                <input
                  id="phone"
                  {...register('phone')}
                  type="tel"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-shadow"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-foreground/80">Message (Optional)</label>
              <textarea
                id="message"
                {...register('message')}
                rows={3}
                className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-shadow"
                placeholder="I'm looking to buy in the next 3-6 months..."
              />
            </div>

            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="consent"
                {...register('consent')}
                className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
              <label htmlFor="consent" className="text-xs text-muted-foreground">
                I agree to be contacted by Noémie Piard regarding my real estate inquiry.
              </label>
            </div>
            {errors.consent && <p className="text-xs text-destructive">{errors.consent.message}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="animate-pulse">Sending...</span>
              ) : (
                <>
                  <span>Send Message</span>
                  <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
