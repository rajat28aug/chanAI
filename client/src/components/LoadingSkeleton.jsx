import { motion } from 'framer-motion';

export default function LoadingSkeleton({ 
  variant = 'default',
  className = '' 
}) {
  if (variant === 'card') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`bg-white rounded-2xl shadow-lg p-6 border border-gray-100 ${className}`}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded-xl w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded-lg w-full"></div>
          <div className="h-4 bg-gray-200 rounded-lg w-5/6"></div>
        </div>
      </motion.div>
    );
  }

  if (variant === 'tile') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`bg-white rounded-2xl shadow-lg p-6 border border-gray-100 ${className}`}
      >
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-14 h-14 bg-gray-200 rounded-2xl"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded-xl w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`animate-pulse ${className}`}
    >
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </motion.div>
  );
}






