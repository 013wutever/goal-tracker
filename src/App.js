import React, { useState, useEffect } from 'react';
import { 
  Target, 
  BarChart, 
  Info as InfoIcon,
  Languages,
  LogOut,
  Calendar
} from 'lucide-react';
import GoalEntry from './components/GoalEntry/GoalEntry';
import Progress from './components/Progress/Progress';
import Info from './components/Info/Info';
import MyEntries from './components/MyEntries/MyEntries';
import Login from './components/Auth/Login';
import { getTranslation } from './utils/translations';
import GlassmorphicContainer from './components/ui/GlassmorphicContainer';

const App = () => {
  const [activeTab, setActiveTab] = useState('goal-entry');
  const [language, setLanguage] = useState('el');
  const [user, setUser] = useState(null);
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

  useEffect(() => {
    const savedUser = localStorage.getItem('goalTrackerUser');
    const savedLanguage = localStorage.getItem('goalTrackerLanguage');
    if (savedUser) {
      setUser(savedUser);
    }
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const navItems = [
    { id: 'goal-entry', icon: Target },
    { id: 'my-entries', icon: Calendar },
    { id: 'progress', icon: BarChart },
    { id: 'info', icon: InfoIcon }
  ];

  const handleLanguageChange = () => {
    const newLanguage = language === 'el' ? 'en' : 'el';
    setLanguage(newLanguage);
    localStorage.setItem('goalTrackerLanguage', newLanguage);
  };

  const handleLogin = (email) => {
    setUser(email);
    localStorage.setItem('goalTrackerUser', email);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('goalTrackerUser');
    setActiveTab('goal-entry');
  };

  const getContentMaxWidth = () => {
    switch (activeTab) {
      case 'progress':
        return 'max-w-6xl';
      case 'info':
        return 'max-w-4xl';
      case 'my-entries':
        return 'max-w-6xl';
      default:
        return 'max-w-2xl';
    }
  };

  const renderContent = () => {
    if (!user) {
      return <Login language={language} onLogin={handleLogin} />;
    }

    switch (activeTab) {
      case 'goal-entry':
        return <GoalEntry language={language} userEmail={user} />;
      case 'my-entries':
        return <MyEntries language={language} userEmail={user} />;
      case 'progress':
        return <Progress language={language} userEmail={user} />;
      case 'info':
        return <Info language={language} />;
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="content-wrapper">
        {renderContent()}
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      {/* Top navigation - Fixed */}
      <GlassmorphicContainer 
        className={`
          fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-4
          ${isLandscape ? 'bg-white/10' : 'glassmorphic'}
        `}
        hover={false}
        simplified={isMobile && isLandscape}
      >
        <div className="flex items-center space-x-1">
          <span className={`text-white/70 text-sm mr-4 ${isLandscape ? 'opacity-100' : ''}`}>
            {getTranslation(language, 'nav.welcomeBack')}, {user.split('@')[0]}
          </span>
          
          {navItems.map((item) => {
            const ItemIcon = item.icon;
            return (
              <GlassmorphicContainer
                key={item.id}
                as="button"
                onClick={() => setActiveTab(item.id)}
                className={`
                  p-2 rounded-full flex items-center justify-center
                  ${isMobile ? 'touch-manipulation' : ''}
                  ${isLandscape ? 'bg-white/10' : 'glassmorphic'}
                `}
                hover={!isLandscape}
                active={activeTab === item.id}
                isButton={true}
                simplified={isMobile && isLandscape}
              >
                <ItemIcon className={`w-6 h-6 ${isLandscape ? 'opacity-100' : ''}`} />
                <span className="sr-only">
                  {getTranslation(language, `nav.${item.id}`)}
                </span>
              </GlassmorphicContainer>
            );
          })}
        </div>

        <div className="flex items-center space-x-2">
          {/* Language toggle */}
          <GlassmorphicContainer
            as="button"
            onClick={handleLanguageChange}
            className={`
              p-2 rounded-full flex items-center justify-center
              ${isMobile ? 'touch-manipulation' : ''}
              ${isLandscape ? 'bg-white/10' : 'glassmorphic'}
            `}
            hover={!isLandscape}
            isButton={true}
            simplified={isMobile && isLandscape}
          >
            <Languages className={`w-6 h-6 ${isLandscape ? 'opacity-100' : ''}`} />
            <span className="sr-only">
              {language === 'el' ? 'Switch to English' : 'Αλλαγή σε Ελληνικά'}
            </span>
          </GlassmorphicContainer>

          {/* Logout button */}
          <GlassmorphicContainer
            as="button"
            onClick={handleLogout}
            className={`
              p-2 rounded-full flex items-center justify-center
              ${isMobile ? 'touch-manipulation' : ''}
              ${isLandscape ? 'bg-white/10' : 'glassmorphic'}
            `}
            hover={!isLandscape}
            isButton={true}
            simplified={isMobile && isLandscape}
          >
            <LogOut className={`w-6 h-6 ${isLandscape ? 'opacity-100' : ''}`} />
            <span className="sr-only">{getTranslation(language, 'nav.logout')}</span>
          </GlassmorphicContainer>
        </div>
      </GlassmorphicContainer>

      {/* Main content area */}
      <main className={`
        w-full mx-auto px-4
        ${isMobile ? 'pt-20' : 'pt-24 pb-8'}
      `}>
        <GlassmorphicContainer 
          className={`
            rounded-2xl p-6 mx-auto
            ${getContentMaxWidth()}
            ${isLandscape ? 'bg-white/10' : 'glassmorphic'}
          `}
          simplified={isMobile && isLandscape}
        >
          {renderContent()}
        </GlassmorphicContainer>
      </main>
    </div>
  );
};

export default App;
