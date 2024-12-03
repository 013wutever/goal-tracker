import React, { useState, useEffect } from 'react';
import { 
  Target,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  Plus,
  Minus,
  Calendar,
  Bell
} from 'lucide-react';
import { getTranslation } from '../../utils/translations';
import googleSheetsService from '../../services/googleSheets';
import GlassmorphicContainer from '../ui/GlassmorphicContainer';

const GoalEntry = ({ language = 'el', userEmail }) => {
  const [goalData, setGoalData] = useState({
    title: '',
    category: '',
    priority: '',
    description: '',
    deadline: '',
    steps: [''],
    reminderFrequency: 'none',
    status: 'notStarted'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isLandscape, setIsLandscape] = useState(window.innerHeight < window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsLandscape(window.innerHeight < window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', () => {
      setTimeout(handleResize, 100);
    });
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const t = (path) => getTranslation(language, path);

  const categories = [
    'personal', 'friends', 'family', 'work', 
    'studies', 'health', 'finances', 'entertainment'
  ];

  const priorities = ['low', 'medium', 'high'];
  const reminderOptions = ['none', 'daily', 'weekly', 'monthly'];

  const validateForm = () => {
    const newErrors = {};
    if (!goalData.title.trim()) {
      newErrors.title = true;
    }
    if (!goalData.category) {
      newErrors.category = true;
    }
    if (!goalData.priority) {
      newErrors.priority = true;
    }
    if (!goalData.deadline) {
      newErrors.deadline = true;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const result = await googleSheetsService.addGoalEntry({
        userEmail,
        ...goalData,
        steps: goalData.steps.filter(step => step.trim())
      });

      if (result.success) {
        setSubmitStatus('success');
        setTimeout(() => {
          setGoalData({
            title: '',
            category: '',
            priority: '',
            description: '',
            deadline: '',
            steps: [''],
            reminderFrequency: 'none',
            status: 'notStarted'
          });
          setSubmitStatus(null);
        }, 2000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStepChange = (index, value) => {
    const newSteps = [...goalData.steps];
    newSteps[index] = value;
    setGoalData(prev => ({ ...prev, steps: newSteps }));
  };

  const addStep = () => {
    setGoalData(prev => ({ 
      ...prev, 
      steps: [...prev.steps, '']
    }));
  };

  const removeStep = (index) => {
    setGoalData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="w-full space-y-6">
      {/* Status Messages */}
      {submitStatus && (
        <GlassmorphicContainer 
          className={`
            p-4 rounded-xl flex items-center gap-2
            ${submitStatus === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'}
          `}
        >
          {submitStatus === 'success' ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span>{t('goalEntry.success')}</span>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-red-300" />
              <span>{t('goalEntry.error')}</span>
            </>
          )}
        </GlassmorphicContainer>
      )}

      {/* Title Section */}
      <div className="space-y-2">
        <label className="block text-lg font-medium">
          {t('goalEntry.fields.title')}
        </label>
        <GlassmorphicContainer className="rounded-xl bg-white/5">
          <input
            type="text"
            value={goalData.title}
            onChange={(e) => setGoalData(prev => ({ ...prev, title: e.target.value }))}
            placeholder={t('goalEntry.fields.titlePlaceholder')}
            className={`
              w-full p-3 bg-transparent border-none focus:ring-2 
              focus:ring-white/30 rounded-xl placeholder-white/50
              ${errors.title ? 'ring-2 ring-red-400' : ''}
            `}
          />
        </GlassmorphicContainer>
      </div>

      {/* Category & Priority Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Categories */}
        <div className="space-y-2">
          <label className="block text-lg font-medium">
            {t('goalEntry.categories.title')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map(category => (
              <GlassmorphicContainer
                key={category}
                as="button"
                onClick={() => setGoalData(prev => ({ ...prev, category }))}
                className={`
                  p-3 rounded-xl text-sm min-h-[44px]
                  ${errors.category ? 'ring-2 ring-red-400' : ''}
                `}
                hover={true}
                active={goalData.category === category}
                style={{
                  backgroundColor: goalData.category === category 
                    ? `var(--category-${category})`
                    : undefined
                }}
              >
                {t(`goalEntry.categories.${category}`)}
              </GlassmorphicContainer>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <label className="block text-lg font-medium">
            {t('goalEntry.priority.title')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {priorities.map(priority => (
              <GlassmorphicContainer
                key={priority}
                as="button"
                onClick={() => setGoalData(prev => ({ ...prev, priority }))}
                className={`
                  p-3 rounded-xl text-sm min-h-[44px]
                  ${errors.priority ? 'ring-2 ring-red-400' : ''}
                `}
                hover={true}
                active={goalData.priority === priority}
                style={{
                  backgroundColor: goalData.priority === priority 
                    ? `var(--priority-${priority})`
                    : undefined
                }}
              >
                {t(`goalEntry.priority.${priority}`)}
              </GlassmorphicContainer>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="block text-lg font-medium">
          {t('goalEntry.fields.description')}
        </label>
        <GlassmorphicContainer className="rounded-xl bg-white/5">
          <textarea
            value={goalData.description}
            onChange={(e) => setGoalData(prev => ({ ...prev, description: e.target.value }))}
            placeholder={t('goalEntry.fields.descriptionPlaceholder')}
            className="w-full p-3 min-h-[100px] bg-transparent border-none 
                     focus:ring-2 focus:ring-white/30 rounded-xl 
                     placeholder-white/50 resize-none"
          />
        </GlassmorphicContainer>
      </div>

      {/* Deadline & Reminder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Deadline */}
        <div className="space-y-2">
          <label className="block text-lg font-medium">
            {t('goalEntry.fields.deadline')}
          </label>
          <GlassmorphicContainer className="rounded-xl bg-white/5">
            <input
              type="date"
              value={goalData.deadline}
              onChange={(e) => setGoalData(prev => ({ ...prev, deadline: e.target.value }))}
              className={`
                w-full p-3 bg-transparent border-none focus:ring-2 
                focus:ring-white/30 rounded-xl text-white
                ${errors.deadline ? 'ring-2 ring-red-400' : ''}
              `}
              min={new Date().toISOString().split('T')[0]}
            />
          </GlassmorphicContainer>
        </div>

        {/* Reminder Frequency */}
        <div className="space-y-2">
          <label className="block text-lg font-medium">
            {t('goalEntry.fields.reminder')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {reminderOptions.map(option => (
              <GlassmorphicContainer
                key={option}
                as="button"
                onClick={() => setGoalData(prev => ({ ...prev, reminderFrequency: option }))}
                className="p-3 rounded-xl text-sm min-h-[44px]"
                hover={true}
                active={goalData.reminderFrequency === option}
              >
                {t(`goalEntry.reminders.${option}`)}
              </GlassmorphicContainer>
            ))}
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-lg font-medium">
            {t('goalEntry.fields.steps')}
          </label>
          <GlassmorphicContainer
            as="button"
            onClick={addStep}
            className="p-2 rounded-full"
            hover={true}
          >
            <Plus className="w-5 h-5" />
          </GlassmorphicContainer>
        </div>
        <div className="space-y-2">
          {goalData.steps.map((step, index) => (
            <div key={index} className="flex gap-2">
              <GlassmorphicContainer className="flex-1 rounded-xl bg-white/5">
                <input
                  type="text"
                  value={step}
                  onChange={(e) => handleStepChange(index, e.target.value)}
                  placeholder={t('goalEntry.fields.stepsPlaceholder')}
                  className="w-full p-3 bg-transparent border-none 
                           focus:ring-2 focus:ring-white/30 rounded-xl 
                           placeholder-white/50"
                />
              </GlassmorphicContainer>
              {goalData.steps.length > 1 && (
                <GlassmorphicContainer
                  as="button"
                  onClick={() => removeStep(index)}
                  className="p-3 rounded-xl"
                  hover={true}
                >
                  <Minus className="w-5 h-5" />
                </GlassmorphicContainer>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <GlassmorphicContainer
        as="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full py-4 rounded-xl min-h-[44px] mt-8"
        hover={true}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center gap-2">
            <Loader className="w-5 h-5 animate-spin" />
            <span>{t('goalEntry.submitting')}</span>
          </div>
        ) : (
          t('goalEntry.submit')
        )}
      </GlassmorphicContainer>

      {/* Timestamp */}
      <div className="text-center text-sm text-white/50 flex items-center justify-center gap-2 mt-4">
        <Calendar className="w-4 h-4" />
        {new Date().toLocaleDateString(language === 'el' ? 'el-GR' : 'en-US')}
      </div>
    </div>
  );
};

export default GoalEntry;
