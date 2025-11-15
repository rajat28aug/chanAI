import { motion } from 'framer-motion';

export default function AnimatedCard({ 
  children, 
  className = '', 
  hover = true,
  delay = 0,
  onClick,
  ...props 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={hover ? { 
        scale: 1.02, 
        y: -4,
        transition: { duration: 0.2 }
      } : {}}
      onClick={onClick}
      className={`
        bg-white rounded-2xl shadow-lg hover:shadow-2xl 
        transition-all duration-300 border border-gray-100
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}






