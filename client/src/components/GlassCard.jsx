import { motion } from 'framer-motion';

export default function GlassCard({ 
  children, 
  className = '', 
  hover = true,
  delay = 0,
  onClick,
  ...props 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      whileHover={hover ? { 
        scale: 1.02,
        transition: { duration: 0.2 }
      } : {}}
      onClick={onClick}
      className={`
        backdrop-blur-xl bg-white/70 border border-white/20
        rounded-3xl shadow-xl hover:shadow-2xl
        transition-all duration-300
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.6) 100%)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}






