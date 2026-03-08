const colorMap = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    icon: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
    border: 'border-blue-100 dark:border-blue-800',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    icon: 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400',
    border: 'border-green-100 dark:border-green-800',
  },
  yellow: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    icon: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-100 dark:border-yellow-800',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    icon: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400',
    border: 'border-red-100 dark:border-red-800',
  },
};

export default function StatsCard({ title, value, icon: Icon, color = 'blue' }) {
  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div
      className={`rounded-xl border p-5 transition-shadow hover:shadow-md ${scheme.bg} ${scheme.border}`}
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white truncate">
            {value}
          </p>
        </div>
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${scheme.icon}`}
        >
          {Icon && <Icon size={24} />}
        </div>
      </div>
    </div>
  );
}
