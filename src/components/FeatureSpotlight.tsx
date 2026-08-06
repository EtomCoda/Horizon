import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface FeatureSpotlightProps {
  title: string;
  description: string;
  onDismiss: () => void;
  /** Horizontal alignment of the callout relative to its anchor. Defaults to right-aligned. */
  align?: 'left' | 'right';
}

const FeatureSpotlight = ({ title, description, onDismiss, align = 'right' }: FeatureSpotlightProps) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className={`absolute top-full mt-3 z-40 w-72 ${align === 'right' ? 'right-0' : 'left-0'}`}
      >
        {/* Arrow */}
        <div
          className={`absolute -top-1.5 w-3 h-3 bg-blue-600 rotate-45 ${align === 'right' ? 'right-6' : 'left-6'}`}
        />

        <div className="relative bg-blue-600 text-white rounded-xl shadow-xl p-4">
          <button
            onClick={onDismiss}
            className="absolute top-2 right-2 text-blue-200 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-100">What's New ?</span>
          </div>
          <h4 className="font-bold text-sm mb-1 pr-4">{title}</h4>
          <p className="text-xs text-blue-100 leading-relaxed mb-3">{description}</p>

          <button
            onClick={onDismiss}
            className="text-xs font-semibold bg-white text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Got it
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FeatureSpotlight;
