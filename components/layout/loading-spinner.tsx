import { Loader2 } from 'lucide-react';
import { motion, Variants } from 'motion/react';

export function LoadingSpinner() {
  const dotVariants: Variants = {
    jump: {
      y: -30,
      transition: {
        duration: 0.8,
        repeat: Infinity,
        repeatType: 'mirror',
        ease: 'easeInOut',
      },
    },
  };

  return (
    <motion.div
      animate="jump"
      transition={{ staggerChildren: -0.2, staggerDirection: -1 }}
      className="flex items-center justify-center space-x-2">
      <motion.div
        className="w-5 h-5 rounded-full bg-white will-change-transform"
        variants={dotVariants}
      />
      <motion.div
        className="w-5 h-5 rounded-full bg-white will-change-transform"
        variants={dotVariants}
      />
      <motion.div
        className="w-5 h-5 rounded-full bg-white will-change-transform"
        variants={dotVariants}
      />
    </motion.div>
  );
}
