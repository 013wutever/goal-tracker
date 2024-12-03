import React, { useState, useEffect } from 'react';

const GlassmorphicContainer = ({ 
  children, 
  className = '', 
  hover = false,
  active = false,
  onClick = null,
  as = 'div',
  style = {},
  isButton = false,
  simplified = false,
  blur = true
}) => {
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

  const getStyles = () => {
    const baseStyles = {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      transition: 'all 0.3s ease',
      ...style
    };

    if (blur && !isLandscape) {
      baseStyles.backdropFilter = 'blur(8px)';
      baseStyles.WebkitBackdropFilter = 'blur(8px)';
    }

    if (isMobile && isLandscape) {
      return {
        ...baseStyles,
        backgroundColor: active 
          ? 'rgba(255, 255, 255, 0.2)' 
          : 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        border: 'none'
      };
    }

    if (simplified || isMobile) {
      return {
        ...baseStyles,
        boxShadow: active 
          ? 'inset 0 2px 4px rgba(0,0,0,0.1)' 
          : '0 2px 4px rgba(0,0,0,0.1), 0 1px 2px rgba(255,255,255,0.1)'
      };
    }

    return {
      ...baseStyles,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 0 80px rgba(255, 255, 255, 0.1)'
    };
  };

  const getClassName = () => {
    const baseClasses = `
      ${className}
      ${hover ? 'cursor-pointer' : ''}
      overflow-hidden
      ${isMobile && isLandscape ? '' : 'transition-all duration-300'}
    `.trim();

    if (isMobile && isLandscape) {
      return `
        ${baseClasses}
        ${active ? 'bg-white/20' : 'bg-white/10'}
        ${hover ? 'active:bg-white/30' : ''}
      `.trim();
    }

    if (simplified || isMobile) {
      return `
        ${baseClasses}
        ${hover ? 'active:scale-95' : ''}
        ${active ? 'bg-opacity-100' : 'bg-opacity-80'}
        ${isButton ? 'active:translate-y-0.5' : ''}
      `.trim();
    }

    return `
      ${baseClasses}
      ${hover ? 'hover:bg-white/15 hover:scale-[1.02] active:scale-95' : ''}
      ${active ? 'bg-white/20 scale-[1.02]' : 'bg-white/10'}
      ${hover ? 'hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05),inset_0_0_80px_rgba(255,255,255,0.2)]' : ''}
    `.trim();
  };

  const Component = as;

  return (
    <Component 
      className={getClassName()}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={getStyles()}
    >
      {children}
    </Component>
  );
};

export default GlassmorphicContainer;
