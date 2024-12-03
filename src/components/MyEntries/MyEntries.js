import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Loader,
  XCircle,
  ArrowLeft,
  Clock,
  Target,
  Edit2,
  Trash2,
  Filter,
  SortDesc
} from 'lucide-react';
import { getTranslation } from '../../utils/translations';
import googleSheetsService from '../../services/googleSheets';
import GlassmorphicContainer from '../ui/GlassmorphicContainer';

const MyEntries = ({ language = 'el', userEmail }) => {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(null);

  const t = (path) => getTranslation(language, path);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [userEmail, filter, sortBy]);

  const fetchGoals = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await googleSheetsService.getGoals(userEmail);
      
      if (response.success) {
        let filteredGoals = response.data;

        // Apply filters
        if (filter !== 'all') {
          filteredGoals = filteredGoals.filter(goal => goal.status === filter);
        }

        // Apply sorting
        filteredGoals.sort((a, b) => {
          switch (sortBy) {
            case 'deadline':
              return new Date(a.deadline) - new Date(b.deadline);
            case 'priority':
              const priorityOrder = { high: 0, medium: 1, low: 2 };
              return priorityOrder[a.priority] - priorityOrder[b.priority];
            case 'status':
              const statusOrder = { notStarted: 0, inProgress: 1, completed: 2, overdue: 3 };
              return statusOrder[a.status] - statusOrder[b.status];
            default:
              return 0;
          }
        });

        setGoals(filteredGoals);
      } else {
        throw new Error('Failed to fetch goals');
      }
    } catch (err) {
      setError(t('states.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      const result = await googleSheetsService.deleteGoal(goalId);
      if (result.success) {
        setGoals(prev => prev.filter(goal => goal.id !== goalId));
        setIsConfirmingDelete(null);
      } else {
        throw new Error('Failed to delete goal');
      }
    } catch (error) {
      setError(t('states.error'));
    }
  };

  const renderGoalCard = (goal) => (
    <GlassmorphicContainer 
      key={goal.id}
      className="p-4 md:p-6 rounded-xl space-y-4"
      style={{
        backgroundColor: `var(--priority-${goal.priority})`
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1">
          <h3 className="font-medium text-lg">{goal.title}</h3>
          <span className="text-sm text-white/70">
            {t(`goalEntry.categories.${goal.category}`)}
          </span>
        </div>
        <div className="flex gap-2">
          <GlassmorphicContainer
            as="button"
            onClick={() => {/* handle edit */}}
            className="p-2 rounded-full"
            hover={true}
          >
            <Edit2 className="w-4 h-4" />
          </GlassmorphicContainer>
          <GlassmorphicContainer
            as="button"
            onClick={() => setIsConfirmingDelete(goal.id)}
            className="p-2 rounded-full"
            hover={true}
          >
            <Trash2 className="w-4 h-4" />
          </GlassmorphicContainer>
        </div>
      </div>

      {/* Description */}
      {goal.description && (
        <p className="text-sm text-white/90">{goal.description}</p>
      )}

      {/* Steps */}
      {goal.steps.length > 0 && (
        <div className="space-y-2">
          <span className="text-sm font-medium">{t('goalEntry.fields.steps')}</span>
          <div className="space-y-1">
            {goal.steps.map((step, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                {step}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center text-sm text-white/70">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          {new Date(goal.deadline).toLocaleDateString(
            language === 'el' ? 'el-GR' : 'en-US'
          )}
        </div>
        <span className="px-2 py-1 rounded-full bg-white/10">
          {t(`goalEntry.status.${goal.status}`)}
        </span>
      </div>
    </GlassmorphicContainer>
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
          onClick={fetchGoals}
          className="px-4 py-2 rounded-xl"
          hover={true}
        >
          {t('states.retry')}
        </GlassmorphicContainer>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-xl md:text-2xl font-semibold">
          {t('myEntries.title')}
        </h1>
        
        <div className="flex gap-2">
          {/* Filter dropdown */}
          <GlassmorphicContainer className="relative rounded-xl">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="appearance-none bg-transparent px-4 py-2 pr-8 rounded-xl 
                       focus:ring-2 focus:ring-white/30 border-none"
            >
              {Object.entries(t('myEntries.filters')).map(([key, value]) => (
                <option key={key} value={key} className="text-black">
                  {value}
                </option>
              ))}
            </select>
            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4" />
          </GlassmorphicContainer>

          {/* Sort dropdown */}
          <GlassmorphicContainer className="relative rounded-xl">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-transparent px-4 py-2 pr-8 rounded-xl
                       focus:ring-2 focus:ring-white/30 border-none"
            >
              {Object.entries(t('myEntries.sort')).map(([key, value]) => (
                <option key={key} value={key} className="text-black">
                  {value}
                </option>
              ))}
            </select>
            <SortDesc className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4" />
          </GlassmorphicContainer>
        </div>
      </div>

      {/* Goals grid */}
      {goals.length === 0 ? (
        <div className="text-center py-12 text-white/70">
          {t('myEntries.noGoals')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(renderGoalCard)}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isConfirmingDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <GlassmorphicContainer className="max-w-md w-full p-6 rounded-xl space-y-4">
            <h3 className="text-lg font-medium">
              {t('myEntries.confirmDelete')}
            </h3>
            <div className="flex justify-end gap-2">
              <GlassmorphicContainer
                as="button"
                onClick={() => setIsConfirmingDelete(null)}
                className="px-4 py-2 rounded-xl"
                hover={true}
              >
                {t('states.cancel')}
              </GlassmorphicContainer>
              <GlassmorphicContainer
                as="button"
                onClick={() => handleDeleteGoal(isConfirmingDelete)}
                className="px-4 py-2 rounded-xl bg-red-500/20"
                hover={true}
              >
                {t('states.delete')}
              </GlassmorphicContainer>
            </div>
          </GlassmorphicContainer>
        </div>
      )}
    </div>
  );
};

export default MyEntries;
