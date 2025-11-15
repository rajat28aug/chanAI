import { motion } from 'framer-motion';

export default function Card({ 
  children, 
  className = '', 
  hover = true,
  onClick,
  ...props 
}) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.04 } : {}}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`
        bg-white rounded-2xl shadow-lg hover:shadow-xl 
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

