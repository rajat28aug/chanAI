import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  BookOpen, 
  Target, 
  TrendingUp,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import api from '../utils/api.js';
import PageTemplate from '../components/PageTemplate.jsx';
import PageHeader from '../components/PageHeader.jsx';
import AnimatedCard from '../components/AnimatedCard.jsx';
import GlassCard from '../components/GlassCard.jsx';
import Button from '../components/Button.jsx';
import MotionContainer from '../components/MotionContainer.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';

export default function StudyPlan() {
  const [performance, setPerformance] = useState({
    DS: { correctRate: 0.5 },
    OS: { correctRate: 0.8 },
    Networks: { correctRate: 0.6 },
    Algorithms: { correctRate: 0.7 }
  });
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const getPlan = async () => {
    setLoading(true);
    setSubmitted(false);
    try {
      const r = await api.post('/study-path', { performance });
      setRecommendations(r.data.recommendation || []);
      setSubmitted(true);
    } catch (error) {
      console.error('Error getting study plan:', error);
      // Fallback to mock data
      setRecommendations([
        { topic: 'Data Structures', level: 'easy' },
        { topic: 'Operating Systems', level: 'medium' },
        { topic: 'Networks', level: 'easy' }
      ]);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const updatePerformance = (topic, rate) => {
    setPerformance(prev => ({
      ...prev,
      [topic]: { correctRate: parseFloat(rate) }
    }));
  };

  const topics = ['DS', 'OS', 'Networks', 'Algorithms'];
  const levelColors = {
    easy: 'from-green-400 to-emerald-500',
    medium: 'from-yellow-400 to-orange-500',
    hard: 'from-red-400 to-rose-500'
  };

  const levelLabels = {
    easy: 'Beginner',
    medium: 'Intermediate',
    hard: 'Advanced'
  };

  return (
    <PageTemplate>
      <PageHeader
        title="Study Plan"
        subtitle="Get personalized study recommendations based on your performance"
        icon={GraduationCap}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Input */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatedCard className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Target className="w-6 h-6 text-indigo-600" />
              Your Performance
            </h3>
            <p className="text-gray-600 mb-6">
              Rate your performance in each topic (0.0 to 1.0). Lower scores indicate areas that need more attention.
            </p>
            <div className="space-y-4">
              {topics.map((topic, index) => (
                <motion.div
                  key={topic}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{topic}</div>
                        <div className="text-xs text-gray-500">Correct Rate</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-indigo-600">
                        {Math.round((performance[topic]?.correctRate || 0) * 100)}%
                      </div>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={performance[topic]?.correctRate || 0}
                    onChange={(e) => updatePerformance(topic, e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-6">
              <Button
                icon={Sparkles}
                onClick={getPlan}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? 'Generating Plan...' : 'Get Study Recommendations'}
              </Button>
            </div>
          </AnimatedCard>
        </div>

        {/* Recommendations */}
        <div className="lg:col-span-1">
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              Recommendations
            </h3>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <LoadingSkeleton key={i} variant="card" />
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <MotionContainer className="space-y-3">
                {recommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      p-4 rounded-xl border-2 border-transparent
                      bg-gradient-to-br ${levelColors[rec.level] || levelColors.medium}
                      text-white shadow-lg
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-bold text-lg mb-1">{rec.topic}</div>
                        <div className="text-sm opacity-90">
                          {levelLabels[rec.level] || rec.level}
                        </div>
                      </div>
                      <CheckCircle2 className="w-6 h-6 opacity-80 flex-shrink-0" />
                    </div>
                  </motion.div>
                ))}
              </MotionContainer>
            ) : submitted ? (
              <div className="text-center py-12">
                <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm font-medium">No recommendations yet</p>
                <p className="text-xs text-gray-400 mt-1">Submit your performance to get started</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <ArrowRight className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm font-medium">Get started</p>
                <p className="text-xs text-gray-400 mt-1">Rate your performance and generate a plan</p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </PageTemplate>
  );
}
