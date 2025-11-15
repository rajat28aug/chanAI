import { motion } from 'framer-motion';

export default function PageHeader({ 
  title, 
  subtitle, 
  icon: Icon,
  action,
  className = '' 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`mb-8 ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          {Icon && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg"
            >
              <Icon className="w-7 h-7 text-white" />
            </motion.div>
          )}
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-lg text-gray-600 font-medium">{subtitle}</p>
            )}
          </div>
        </div>
        {action && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {action}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

