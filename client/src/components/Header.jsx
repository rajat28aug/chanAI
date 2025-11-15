import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, Sun, Moon, User } from 'lucide-react';

export default function Header() {
  const [isDark, setIsDark] = useState(false);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-6 py-4 shadow-sm sticky top-0 z-40"
    >
      <div className="flex items-center justify-between">
        {/* Left: Welcome Message */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Welcome User!
          </h2>
        </motion.div>

        {/* Center: Search Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex-1 max-w-md mx-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-4 py-3 pl-12 pr-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50/50 backdrop-blur-sm transition-all"
            />
          </div>
        </motion.div>

        {/* Right: Action Icons */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-3"
        >
          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsDark(!isDark)}
            className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-gray-600" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600" />
            )}
          </motion.button>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-gray-600" />
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full"
            />
          </motion.button>

          {/* Profile */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            aria-label="Profile"
          >
            <User className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </motion.header>
  );
}
