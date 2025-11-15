import { motion } from 'framer-motion';

export default function Button({ 
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  className = '',
  disabled = false,
  ...props
}) {
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg',
    secondary: 'bg-white text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg',
    danger: 'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:shadow-lg',
    ghost: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      disabled={disabled}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-xl font-semibold
        transition-all duration-300
        flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-5 h-5" />}
      {children}
      {Icon && iconPosition === 'right' && <Icon className="w-5 h-5" />}
    </motion.button>
  );
}

