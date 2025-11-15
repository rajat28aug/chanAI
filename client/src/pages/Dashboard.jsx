import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  BookOpen, 
  AlertTriangle, 
  TrendingUp,
  Target,
  Activity,
  Calendar,
  LayoutDashboard
} from 'lucide-react';
import api from '../utils/api.js';
import PageTemplate from '../components/PageTemplate.jsx';
import PageHeader from '../components/PageHeader.jsx';
import DashboardTile from '../components/DashboardTile.jsx';
import AnimatedCard from '../components/AnimatedCard.jsx';
import GlassCard from '../components/GlassCard.jsx';
import MotionContainer from '../components/MotionContainer.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics')
      .then(r => setAnalytics(r.data))
      .catch(() => setAnalytics({ history: [] }))
      .finally(() => setLoading(false));
  }, []);

  const metrics = [
    {
      title: 'Daily Study Time',
      value: '2h 30m',
      icon: Clock,
      trend: 'up',
      trendValue: '+15%',
      color: 'green'
    },
    {
      title: 'Chapters Completed',
      value: '12',
      icon: BookOpen,
      trend: 'up',
      trendValue: '+3',
      color: 'blue'
    },
    {
      title: 'Weak Topics',
      value: '5',
      icon: AlertTriangle,
      trend: 'down',
      trendValue: '-2',
      color: 'orange'
    },
    {
      title: 'Quiz Score',
      value: '85%',
      icon: TrendingUp,
      trend: 'up',
      trendValue: '+5%',
      color: 'purple'
    }
  ];

  const recentActivities = [
    { type: 'quiz', title: 'Completed Quiz', time: '2 hours ago', color: 'blue' },
    { type: 'chapter', title: 'New Chapter', time: '5 hours ago', color: 'green' },
    { type: 'flashcard', title: 'Created Flashcards', time: '1 day ago', color: 'purple' }
  ];

  return (
    <PageTemplate>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's your study overview"
        icon={LayoutDashboard}
      />

      {/* Metrics Grid */}
      <MotionContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <DashboardTile
            key={index}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            trend={metric.trend}
            trendValue={metric.trendValue}
            color={metric.color}
            delay={index * 0.1}
          />
        ))}
      </MotionContainer>

      {/* Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Study Progress */}
        <AnimatedCard delay={0.4} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Study Progress</h3>
            <Target className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex items-center gap-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg"
            >
              <Activity className="w-10 h-10 text-white" />
            </motion.div>
            <div>
              <div className="text-4xl font-bold text-gray-800 mb-1">68%</div>
              <div className="text-sm text-gray-600 font-medium">Completion Rate</div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '68%' }}
                transition={{ delay: 0.6, duration: 1 }}
                className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mt-2"
              />
            </div>
          </div>
        </AnimatedCard>

        {/* Recent Activity */}
        <AnimatedCard delay={0.5} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Recent Activity</h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className={`w-3 h-3 rounded-full bg-${activity.color}-500`} />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-800">{activity.title}</div>
                  <div className="text-xs text-gray-500">{activity.time}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedCard>

        {/* Performance Chart */}
        <GlassCard delay={0.6} className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Performance</h3>
          <div className="h-48 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-indigo-400 mx-auto mb-2" />
              <p className="text-gray-400 text-sm font-medium">Chart coming soon</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Attempt History */}
      <AnimatedCard delay={0.7} className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Attempt History</h3>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <LoadingSkeleton key={i} variant="card" />
            ))}
          </div>
        ) : analytics && analytics.history && analytics.history.length > 0 ? (
          <MotionContainer className="space-y-3">
            {analytics.history.slice(0, 5).map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-800">{item.topic || 'Quiz'}</div>
                    <div className="text-sm text-gray-600">
                      Score: {item.score}/{item.total} ({Math.round((item.score / item.total) * 100)}%)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-600">
                      {item.timeTakenSec ? `${Math.round(item.timeTakenSec / 60)}m` : 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.at ? new Date(item.at).toLocaleDateString() : 'Recently'}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </MotionContainer>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-gray-600 font-medium mb-2">No attempt history available</p>
            <p className="text-sm text-gray-400">Your study attempts will appear here</p>
          </div>
        )}
      </AnimatedCard>
    </PageTemplate>
  );
}
