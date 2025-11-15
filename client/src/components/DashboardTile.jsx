import { motion } from 'framer-motion';
import AnimatedCard from './AnimatedCard.jsx';

export default function DashboardTile({ 
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = 'indigo',
  delay = 0,
  ...props
}) {
  const colors = {
    indigo: 'from-indigo-500 to-purple-600',
    green: 'from-green-500 to-emerald-600',
    blue: 'from-blue-500 to-cyan-600',
    orange: 'from-orange-500 to-amber-600',
    red: 'from-red-500 to-rose-600',
    purple: 'from-purple-500 to-pink-600'
  };

  return (
    <AnimatedCard delay={delay} className="p-6" {...props}>
      <div className="flex items-center justify-between mb-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.2, type: 'spring' }}
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-lg`}
        >
          {Icon && <Icon className="w-7 h-7 text-white" />}
        </motion.div>
        {trend && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.3 }}
            className={`flex items-center gap-1 text-sm font-semibold ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            <span>{trend === 'up' ? '↑' : '↓'}</span>
            <span>{trendValue}</span>
          </motion.div>
        )}
      </div>
      <div className="text-3xl font-bold text-gray-800 mb-1">{value}</div>
      <div className="text-sm text-gray-600 font-medium">{title}</div>
    </AnimatedCard>
  );
}

