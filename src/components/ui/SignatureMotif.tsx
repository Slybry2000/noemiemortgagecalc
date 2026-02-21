import { motion } from 'framer-motion';

export function SignatureMotif({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <motion.path
        d="M0 10 Q 25 0, 50 10 T 100 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      <motion.circle
        cx="50"
        cy="10"
        r="2"
        fill="currentColor"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, duration: 0.5, type: "spring" }}
      />
    </svg>
  );
}
