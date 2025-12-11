import { useState, useEffect } from 'react';

// Hook to detect mobile device
export function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setOrientation(height > width ? 'portrait' : 'landscape');
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  return { isMobile, isTablet, orientation };
}

// Mobile-optimized input component
interface MobileInputProps {
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  rows?: number;
}

export function MobileInput({ 
  type, 
  value, 
  onChange, 
  placeholder, 
  className = '', 
  maxLength,
  rows 
}: MobileInputProps) {
  const { isMobile } = useMobileDetection();
  
  const baseClasses = `
    w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
    rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white 
    focus:border-transparent bg-white dark:bg-gray-800 
    text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
    ${isMobile ? 'text-base' : 'text-sm'} // Prevent zoom on iOS
    ${className}
  `;

  if (type === 'textarea') {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${baseClasses} resize-none`}
        maxLength={maxLength}
        rows={rows || (isMobile ? 4 : 6)}
      />
    );
  }

  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={baseClasses}
      maxLength={maxLength}
    />
  );
}

// Touch-friendly button component
interface TouchButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  className?: string;
}

export function TouchButton({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false, 
  className = '' 
}: TouchButtonProps) {
  const { isMobile } = useMobileDetection();
  
  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-lg 
    transition-colors duration-200 focus:outline-none focus:ring-2 
    focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
    ${isMobile ? 'px-6 py-4 text-base min-h-[48px]' : 'px-4 py-2 text-sm'}
    ${className}
  `;

  const variantClasses = {
    primary: 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 focus:ring-black dark:focus:ring-white',
    secondary: 'bg-white dark:bg-gray-800 text-black dark:text-white border-2 border-black dark:border-white hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-black dark:focus:ring-white',
    ghost: 'text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-black dark:focus:ring-white'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {children}
    </button>
  );
}

// Mobile-optimized stepper
interface MobileStepperProps {
  steps: Array<{ id: string; title: string; description: string }>;
  currentStep: number;
}

export function MobileStepper({ steps, currentStep }: MobileStepperProps) {
  const { isMobile } = useMobileDetection();

  if (!isMobile) {
    // Use regular stepper on desktop
    return null;
  }

  const currentStepData = steps[currentStep - 1];
  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 sticky top-0 z-10">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {currentStepData.title}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Step {currentStep} of {steps.length}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {Math.round(progress)}%
          </div>
        </div>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-black dark:bg-white h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// Swipe gesture hook for mobile navigation
export function useSwipeGesture(onSwipeLeft?: () => void, onSwipeRight?: () => void) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
}

// Mobile-optimized card component
interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export function MobileCard({ children, className = '', padding = 'md' }: MobileCardProps) {
  const { isMobile } = useMobileDetection();
  
  const paddingClasses = {
    sm: isMobile ? 'p-3' : 'p-4',
    md: isMobile ? 'p-4' : 'p-6',
    lg: isMobile ? 'p-6' : 'p-8'
  };

  return (
    <div className={`
      bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 
      ${isMobile ? 'rounded-lg' : 'rounded-xl'} shadow-sm
      ${paddingClasses[padding]} ${className}
    `}>
      {children}
    </div>
  );
}

// Pull-to-refresh component
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const threshold = 80;
  let startY = 0;

  const handleTouchStart = (e: React.TouchEvent) => {
    startY = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;

    if (distance > 0 && window.scrollY === 0) {
      setIsPulling(true);
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setIsPulling(false);
    setPullDistance(0);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: isPulling ? `translateY(${pullDistance * 0.5}px)` : 'none',
        transition: isPulling ? 'none' : 'transform 0.3s ease'
      }}
    >
      {(isPulling || isRefreshing) && (
        <div className="flex justify-center py-4">
          <div className={`transition-transform duration-300 ${
            isRefreshing ? 'animate-spin' : ''
          }`}>
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}