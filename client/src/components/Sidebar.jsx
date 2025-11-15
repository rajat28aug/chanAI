import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  ClipboardList, 
  GraduationCap, 
  Lightbulb, 
  Settings,
  LogOut,
  User
} from 'lucide-react';

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pdf-tools', label: 'PDF Tools', icon: FileText },
  { to: '/flashcards', label: 'Flashcards', icon: BookOpen },
  { to: '/quizzes', label: 'Quizzes', icon: ClipboardList },
  { to: '/study-plan', label: 'Study Plan', icon: GraduationCap },
  { to: '/doubt-solver', label: 'Doubt Solver', icon: Lightbulb },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-72 bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-900 min-h-screen flex flex-col text-white shadow-2xl"
    >
      {/* Profile Section */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="p-6 border-b border-white/10"
      >
        <div className="flex flex-col items-center">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center mb-4 text-2xl font-bold shadow-xl"
          >
            <User className="w-10 h-10 text-white" />
          </motion.div>
          <h3 className="font-bold text-lg mb-1">User Name</h3>
          <p className="text-indigo-200 text-sm">user@example.com</p>
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {nav.map((item, index) => (
          <motion.div
            key={item.to}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.05 }}
          >
            <NavLink
              to={item.to}
              className={({ isActive }) => 
                `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm' 
                    : 'text-indigo-100 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <motion.div
                    animate={{ rotate: isActive ? 360 : 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-indigo-300 group-hover:text-white'}`} />
                  </motion.div>
                  <span className="font-semibold">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 w-1 h-8 bg-white rounded-r-full"
                      initial={false}
                    />
                  )}
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Logout Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="p-4 border-t border-white/10"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-4 px-4 py-3 rounded-xl text-indigo-100 hover:bg-red-500/20 hover:text-white w-full transition-all duration-300 group"
        >
          <LogOut className="w-5 h-5 text-indigo-300 group-hover:text-white" />
          <span className="font-semibold">Logout</span>
        </motion.button>
      </motion.div>
    </motion.aside>
  );
}
