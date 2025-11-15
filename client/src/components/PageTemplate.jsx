import { motion } from 'framer-motion';
import PageHeader from './PageHeader.jsx';

export default function PageTemplate({ 
  title, 
  subtitle, 
  icon,
  action,
  children, 
  className = '' 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`space-y-6 ${className}`}
    >
      {/* Header */}
      {(title || subtitle) && (
        <PageHeader 
          title={title} 
          subtitle={subtitle} 
          icon={icon}
          action={action}
        />
      )}

      {/* Content */}
      {children}
    </motion.div>
  );
}

