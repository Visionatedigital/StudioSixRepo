'use client';

import React, { useState, useEffect } from 'react';
import { useRenderTasks, RenderTask } from '@/contexts/RenderTaskContext';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

interface ProgressCircleProps {
  task: RenderTask;
  onRemove: (id: string) => void;
}

function ProgressCircle({ task, onRemove }: ProgressCircleProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  // Calculate circle progress
  const circumference = 2 * Math.PI * 16; // radius = 16
  const strokeDashoffset = circumference - (task.progress / 100) * circumference;
  
  // Auto-remove completed tasks after 5 seconds
  useEffect(() => {
    if (task.status === 'completed' || task.status === 'error') {
      const timer = setTimeout(() => onRemove(task.id), 5000);
      return () => clearTimeout(timer);
    }
  }, [task.status, task.id, onRemove]);

  const getStatusColor = () => {
    switch (task.status) {
      case 'starting': return '#8B5CF6'; // purple
      case 'processing': return '#10B981'; // green
      case 'completed': return '#10B981'; // green
      case 'error': return '#EF4444'; // red
      default: return '#8B5CF6';
    }
  };

  const getStatusIcon = () => {
    switch (task.status) {
      case 'completed':
        return (
          <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" className="text-green-600">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" className="text-red-600">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <div className="text-xs font-medium text-gray-600">
            {Math.round(task.progress)}%
          </div>
        );
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="relative"
    >
      <div 
        className="relative cursor-pointer"
        onMouseEnter={() => setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
      >
        {/* Progress Circle */}
        <div className="relative w-10 h-10">
          <svg 
            className="w-10 h-10 transform -rotate-90" 
            width="40" 
            height="40"
          >
            {/* Background circle */}
            <circle
              cx="20"
              cy="20"
              r="16"
              stroke="#E5E7EB"
              strokeWidth="3"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="20"
              cy="20"
              r="16"
              stroke={getStatusColor()}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500 ease-out"
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex items-center justify-center">
            {getStatusIcon()}
          </div>
          
          {/* Pulsing animation for processing */}
          {task.status === 'processing' && (
            <div className="absolute inset-0 rounded-full bg-green-400 opacity-20 animate-pulse" />
          )}
        </div>

        {/* Tooltip */}
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-12 left-1/2 transform -translate-x-1/2 z-10 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg"
          >
            <div className="font-medium mb-1">
              {task.status === 'starting' && 'Starting render...'}
              {task.status === 'processing' && 'Generating image...'}
              {task.status === 'completed' && 'Render complete!'}
              {task.status === 'error' && 'Render failed'}
            </div>
            <div className="text-gray-300 max-w-[200px] truncate">
              {task.prompt}
            </div>
            {task.status === 'processing' && (
              <div className="text-gray-400 mt-1">
                Est. {Math.max(1, Math.ceil((210 - task.progress * 2.1) / 60))}min remaining
              </div>
            )}
            
            {/* Tooltip arrow */}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default function RenderProgressTracker() {
  const { tasks, removeTask, clearCompletedTasks } = useRenderTasks();
  const [showHistory, setShowHistory] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const activeTasks = tasks.filter(task => task.status === 'starting' || task.status === 'processing');
  const completedTasks = tasks.filter(task => task.status === 'completed');
  
  // Get all tasks that should be displayed (active + completed within 5 minutes)
  const displayedTasks = tasks.filter(task => {
    if (task.status === 'starting' || task.status === 'processing') {
      return true; // Always show active tasks
    }
    if (task.status === 'completed') {
      const timeElapsed = currentTime - (task.completedAt?.getTime() || task.startTime.getTime());
      return timeElapsed < 300000; // Show completed tasks for 5 minutes (300,000ms)
    }
    return false;
  });

  const hasAnyTasks = displayedTasks.length > 0;

  // Update current time every second to animate progress and check completion times
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (hasAnyTasks) {
      intervalId = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000); // Update every second
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [hasAnyTasks]);

  // Auto-remove completed tasks after 5 minutes, but prioritize removing oldest if we have more than 3 total
  useEffect(() => {
    const now = currentTime;
    
    // First, remove tasks that have exceeded 5 minutes
    completedTasks.forEach(task => {
      if (task.status === 'completed') {
        const timeElapsed = now - (task.completedAt?.getTime() || task.startTime.getTime());
        if (timeElapsed > 300000) { // 5 minutes
          removeTask(task.id);
        }
      }
    });

    // If we still have more than 3 displayed tasks, remove the oldest completed ones
    if (displayedTasks.length > 3) {
      const sortedCompleted = completedTasks
        .filter(task => {
          const timeElapsed = now - (task.completedAt?.getTime() || task.startTime.getTime());
          return timeElapsed < 300000; // Still within 5 minutes
        })
        .sort((a, b) => {
          const aTime = a.completedAt?.getTime() || a.startTime.getTime();
          const bTime = b.completedAt?.getTime() || b.startTime.getTime();
          return aTime - bTime; // Oldest first
        });

      // Remove oldest completed tasks to keep total at 3
      const tasksToRemove = displayedTasks.length - 3;
      for (let i = 0; i < Math.min(tasksToRemove, sortedCompleted.length); i++) {
        removeTask(sortedCompleted[i].id);
      }
    }
  }, [currentTime, completedTasks, displayedTasks.length, removeTask]);

  const getProgressPercentage = (task: any) => {
    const elapsed = currentTime - task.startTime.getTime();
    const targetDuration = 198000; // 3 minutes 18 seconds in milliseconds
    const progress = Math.min(100, (elapsed / targetDuration) * 100);
    return progress;
  };

  const getEstimatedTimeRemaining = (task: any) => {
    const elapsed = currentTime - task.startTime.getTime();
    const targetDuration = 198000; // 3 minutes 18 seconds
    const remaining = Math.max(0, targetDuration - elapsed);
    return Math.ceil(remaining / 1000); // seconds
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show placeholder when no tasks
  if (!hasAnyTasks) {
    return (
      <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1 text-xs text-gray-500">
        🎯 Ready for renders
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Displayed Tasks (Active + Recent Completed) */}
      <AnimatePresence>
        {displayedTasks.slice(0, 3).map((task, index) => {
          const progressPercentage = task.status === 'completed' ? 100 : getProgressPercentage(task);
          
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative group"
            >
              <div className="w-12 h-12 relative">
                {/* Background circle */}
                <div className="absolute inset-0 rounded-full bg-gray-100 overflow-hidden">
                  {/* Show uploaded image thumbnail */}
                  {task.uploadedImageUrl && (
                    <img 
                      src={task.uploadedImageUrl} 
                      alt="Uploaded" 
                      className="w-full h-full object-cover rounded-full"
                    />
                  )}
                  {/* Fallback if no image */}
                  {!task.uploadedImageUrl && (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-xs">🖼️</span>
                    </div>
                  )}
                  
                  {/* Progress overlay with percentage - only show for active tasks */}
                  {(task.status === 'starting' || task.status === 'processing') && (
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Progress ring */}
                <svg className="absolute inset-0 w-12 h-12 transform -rotate-90" viewBox="0 0 48 48">
                  {/* Background ring */}
                  <circle
                    cx="24"
                    cy="24"
                    r="22"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="none"
                    className="text-gray-200/50"
                  />
                  {/* Progress ring */}
                  <motion.circle
                    cx="24"
                    cy="24"
                    r="22"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    className={task.status === 'completed' ? 'text-green-500' : 'text-orange-500'}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: progressPercentage / 100 }}
                    transition={{ 
                      duration: 0.5, 
                      ease: "easeOut" 
                    }}
                  />
                </svg>

                {/* Completion success indicator */}
                {task.status === 'completed' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <CheckIcon className="w-3 h-3 text-white" />
                    </motion.div>
                  </div>
                )}

                {/* Error indicator */}
                {task.status === 'error' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <XMarkIcon className="w-3 h-3 text-white" />
                    </motion.div>
                  </div>
                )}

                {/* Completion signal animation - expanding rings */}
                {task.status === 'completed' && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-green-400"
                      initial={{ scale: 1, opacity: 0.8 }}
                      animate={{ 
                        scale: [1, 1.5, 2], 
                        opacity: [0.8, 0.4, 0] 
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: 2,
                        ease: "easeOut"
                      }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-green-400"
                      initial={{ scale: 1, opacity: 0.6 }}
                      animate={{ 
                        scale: [1, 1.8, 2.5], 
                        opacity: [0.6, 0.3, 0] 
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: 2,
                        delay: 0.3,
                        ease: "easeOut"
                      }}
                    />
                  </>
                )}
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                {task.status === 'starting' && 'Starting render...'}
                {task.status === 'processing' && `${formatTime(getEstimatedTimeRemaining(task))} remaining`}
                {task.status === 'completed' && 'Render complete!'}
                {task.status === 'error' && 'Render failed'}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Overflow indicator */}
      {displayedTasks.length > 3 && (
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <span className="text-xs font-medium text-gray-600">
            +{displayedTasks.length - 3}
          </span>
        </div>
      )}

      {/* History dropdown */}
      {completedTasks.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1 px-2 py-1 bg-gray-50 hover:bg-gray-100 rounded text-xs text-gray-600 transition-colors"
          >
            History ({completedTasks.length})
            <ChevronDownIcon className={`w-3 h-3 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
          </button>

          {showHistory && (
            <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900">Recent Renders</h3>
                  <button
                    onClick={clearCompletedTasks}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear All
                  </button>
                </div>
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {completedTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <div className="w-8 h-8 rounded bg-gray-200 flex-shrink-0 overflow-hidden">
                        {task.imageUrl ? (
                          <img 
                            src={task.imageUrl} 
                            alt="Generated" 
                            className="w-full h-full object-cover"
                          />
                        ) : task.uploadedImageUrl ? (
                          <img 
                            src={task.uploadedImageUrl} 
                            alt="Original" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            🖼️
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600 truncate">
                          {task.prompt.substring(0, 40)}...
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(task.startTime).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 