import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line,
  PieChart, 
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from 'recharts';
import { 
  Loader,
  XCircle,
  Calendar,
  Target,
  Activity,
  TrendingUp,
  AlertCircle,
  Clock
} from 'lucide-react';
import { getTranslation } from '../../utils/translations';
import googleSheetsService from '../../services/googleSheets';
import GlassmorphicContainer from '../ui/GlassmorphicContainer';

const calculateTotalGoals = (data) => {
  return data.length;
};

const calculateCompletedGoals = (data) => {
  return data.filter(goal => goal.status === 'completed').length;
};

const calculateSuccessRate = (data) => {
  const completed = calculateCompletedGoals(data);
  return data.length > 0 ? Math.round((completed / data.length) * 100) : 0;
};

const getUpcomingDeadlines = (data) => {
  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(now.getDate() + 30);

  return data
    .filter(goal => {
      const deadline = new Date(goal.deadline);
      return deadline >= now && deadline <= thirtyDaysFromNow && goal.status !== 'completed';
    })
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
};

const calculateStatusDistribution = (data) => {
  const statusCounts = data.reduce((acc, goal) => {
    acc[goal.status] = (acc[goal.status] || 0) + 1;
    return acc;
  }, {});

  const total = data.length;
  return Object.entries(statusCounts).map(([status, count]) => ({
    id: status,
    name: status,
    value: Math.round((count / total) * 100)
  }));
};

const calculateCategoryBreakdown = (data) => {
  const categoryCounts = data.reduce((acc, goal) => {
    acc[goal.category] = (acc[goal.category] || 0) + 1;
    return acc;
  }, {});

  const total = data.length;
  return Object.entries(categoryCounts).map(([category, count]) => ({
    id: category,
    name: category,
    value: Math.round((count / total) * 100)
  }));
};

const calculatePriorityDistribution = (data) => {
  const priorityCounts = data.reduce((acc, goal) => {
    acc[goal.priority] = (acc[goal.priority] || 0) + 1;
    return acc;
  }, {});

  const total = data.length;
  return Object.entries(priorityCounts).map(([priority, count]) => ({
    id: priority,
    name: priority,
    value: Math.round((count / total) * 100)
  }));
};

const calculateMonthlyProgress = (data) => {
  const monthlyData = data.reduce((acc, goal) => {
    const date = new Date(goal.timestamp);
    const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
    
    if (!acc[monthYear]) {
      acc[monthYear] = {
        total: 0,
        completed: 0
      };
    }
    
    acc[monthYear].total++;
    if (goal.status === 'completed') {
      acc[monthYear].completed++;
    }
    
    return acc;
  }, {});

  return Object.entries(monthlyData).map(([month, stats]) => ({
    name: month,
    value: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
  }));
};

const calculateCompletionTrend = (data) => {
  const dates = data
    .filter(goal => goal.status === 'completed')
    .map(goal => new Date(goal.timestamp))
    .sort((a, b) => a - b);

  if (dates.length === 0) return [];

  const firstDate = dates[0];
  const lastDate = dates[dates.length - 1];
  const months = [];
  
  let current = new Date(firstDate);
  while (current <= lastDate) {
    months.push({
      name: current.toLocaleString('default', { month: 'short', year: '2-digit' }),
      date: new Date(current)
    });
    current.setMonth(current.getMonth() + 1);
  }

  return months.map(month => ({
    name: month.name,
    value: dates.filter(date => 
      date.getMonth() === month.date.getMonth() && 
      date.getFullYear() === month.date.getFullYear()
    ).length
  }));
};

const calculateCategoryCompletion = (data) => {
  const categoryStats = data.reduce((acc, goal) => {
    if (!acc[goal.category]) {
      acc[goal.category] = {
        total: 0,
        completed: 0
      };
    }
    
    acc[goal.category].total++;
    if (goal.status === 'completed') {
      acc[goal.category].completed++;
    }
    
    return acc;
  }, {});

  return Object.entries(categoryStats).map(([category, stats]) => ({
    id: category,
    name: category,
    value: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
  }));
};

const Progress = ({ language = 'el', userEmail }) => {
  const [timeFilter, setTimeFilter] = useState('week');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [stats, setStats] = useState({
    totalGoals: 0,
    completedGoals: 0,
    successRate: 0,
    upcomingDeadlines: [],
    statusDistribution: [],
    categoryBreakdown: [],
    priorityDistribution: [],
    monthlyProgress: [],
    completionTrend: [],
    categoryCompletion: []
  });

  const t = (path) => getTranslation(language, path);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [timeFilter, userEmail]);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await googleSheetsService.getGoalsStats(userEmail, timeFilter);
      
      if (response.success) {
        const processedStats = processStats(response.data);
        setStats(processedStats);
      } else {
        throw new Error('Failed to fetch stats');
      }
    } catch (err) {
      setError(t('states.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const processStats = (data) => {
    return {
      totalGoals: calculateTotalGoals(data),
      completedGoals: calculateCompletedGoals(data),
      successRate: calculateSuccessRate(data),
      upcomingDeadlines: getUpcomingDeadlines(data),
      statusDistribution: calculateStatusDistribution(data),
      categoryBreakdown: calculateCategoryBreakdown(data),
      priorityDistribution: calculatePriorityDistribution(data),
      monthlyProgress: calculateMonthlyProgress(data),
      completionTrend: calculateCompletionTrend(data),
      categoryCompletion: calculateCategoryCompletion(data)
    };
  };

  // Chart customization components
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <GlassmorphicContainer className="p-3 rounded-lg">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm">{`${Math.round(payload[0].value)}%`}</p>
        </GlassmorphicContainer>
      );
    }
    return null;
  };

  // Mobile-optimized chart wrapper
  const MobileResponsiveChart = ({ children, height = 300 }) => (
    <div className={`w-full ${isMobile ? 'h-[300px]' : 'aspect-square'}`}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader className="w-8 h-8 animate-spin text-white/50" />
        <p className="text-white/70">{t('states.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <XCircle className="w-12 h-12 text-red-400" />
        <p className="text-white/70">{error}</p>
        <GlassmorphicContainer
          as="button"
          onClick={fetchStats}
          className="px-4 py-2 rounded-xl"
          hover={true}
        >
          {t('states.retry')}
        </GlassmorphicContainer>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header with filters */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-semibold">
          {t('progress.title')}
        </h1>
        
        <div className="flex rounded-xl overflow-hidden glassmorphic">
          {Object.entries(t('progress.filters')).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setTimeFilter(key)}
              className={`
                px-4 py-2 text-sm transition-colors
                ${timeFilter === key 
                  ? 'bg-white/20 shadow-inner' 
                  : 'bg-white/5 hover:bg-white/10'}
              `}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {/* Quick stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <GlassmorphicContainer className="p-4 md:p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-blue-300" />
            <h3 className="text-base">{t('progress.stats.totalGoals')}</h3>
          </div>
          <p className="text-2xl md:text-3xl font-semibold">{stats.totalGoals}</p>
        </GlassmorphicContainer>

        <GlassmorphicContainer className="p-4 md:p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-green-300" />
            <h3 className="text-base">{t('progress.stats.completedGoals')}</h3>
          </div>
          <p className="text-2xl md:text-3xl font-semibold">{stats.completedGoals}</p>
        </GlassmorphicContainer>

        <GlassmorphicContainer className="p-4 md:p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-300" />
            <h3 className="text-base">{t('progress.stats.successRate')}</h3>
          </div>
          <p className="text-2xl md:text-3xl font-semibold">{stats.successRate}%</p>
        </GlassmorphicContainer>

        <GlassmorphicContainer className="p-4 md:p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-300" />
            <h3 className="text-base">{t('progress.stats.upcomingDeadlines')}</h3>
          </div>
          <p className="text-2xl md:text-3xl font-semibold">
            {stats.upcomingDeadlines.length}
          </p>
        </GlassmorphicContainer>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        {/* Status Distribution */}
        <GlassmorphicContainer className="p-4 md:p-6 rounded-xl">
          <h3 className="text-lg mb-4">{t('progress.charts.status')}</h3>
          <MobileResponsiveChart>
            <PieChart>
              <Pie
                data={stats.statusDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={isMobile ? "60%" : "70%"}
              >
                {stats.statusDistribution.map((entry, i) => (
                  <Cell 
                    key={`cell-${i}`}
                    fill={`var(--goal-${entry.id})`}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </MobileResponsiveChart>
        </GlassmorphicContainer>

        {/* Category Breakdown */}
        <GlassmorphicContainer className="p-4 md:p-6 rounded-xl">
          <h3 className="text-lg mb-4">{t('progress.charts.category')}</h3>
          <MobileResponsiveChart>
            <BarChart data={stats.categoryBreakdown}>
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: isMobile ? 10 : 12 }}
                height={60}
                angle={-45}
                textAnchor="end"
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {stats.categoryBreakdown.map((entry, i) => (
                  <Cell 
                    key={`cell-${i}`}
                    fill={`var(--category-${entry.id})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </MobileResponsiveChart>
        </GlassmorphicContainer>

        {/* Priority Distribution */}
        <GlassmorphicContainer className="p-4 md:p-6 rounded-xl">
          <h3 className="text-lg mb-4">{t('progress.charts.priority')}</h3>
          <MobileResponsiveChart>
            <PieChart>
              <Pie
                data={stats.priorityDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={isMobile ? "60%" : "70%"}
              >
                {stats.priorityDistribution.map((entry, i) => (
                  <Cell 
                    key={`cell-${i}`}
                    fill={`var(--priority-${entry.id})`}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </MobileResponsiveChart>
        </GlassmorphicContainer>

        {/* Completion Trend */}
        <GlassmorphicContainer className="p-4 md:p-6 rounded-xl">
          <h3 className="text-lg mb-4">{t('progress.charts.completionTrend')}</h3>
          <MobileResponsiveChart>
            <LineChart data={stats.completionTrend}>
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: isMobile ? 10 : 12 }}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="value"
                stroke="var(--goal-completed)"
                strokeWidth={2}
                dot={{ fill: "var(--goal-completed)", strokeWidth: 2 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </MobileResponsiveChart>
        </GlassmorphicContainer>
      </div>

      {/* Upcoming Deadlines */}
      {stats.upcomingDeadlines.length > 0 && (
        <GlassmorphicContainer className="p-4 md:p-6 rounded-xl mt-8">
          <h3 className="text-lg mb-4">{t('progress.stats.upcomingDeadlines')}</h3>
          <div className="space-y-3">
            {stats.upcomingDeadlines.map((goal) => (
              <GlassmorphicContainer 
                key={goal.id}
                className="p-3 rounded-lg flex items-center justify-between"
                style={{
                  backgroundColor: `var(--priority-${goal.priority})`
                }}
              >
                <div className="flex items-center gap-3">
                  <Target className="w-4 h-4" />
                  <span>{goal.title}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" />
                  {new Date(goal.deadline).toLocaleDateString(
                    language === 'el' ? 'el-GR' : 'en-US'
                  )}
                </div>
              </GlassmorphicContainer>
            ))}
          </div>
        </GlassmorphicContainer>
      )}
    </div>
  );
};

export default Progress;
