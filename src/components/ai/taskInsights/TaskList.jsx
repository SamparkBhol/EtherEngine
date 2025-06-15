import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

export const TaskList = ({ tasks, taskTypes, onCompleteTask, onDeleteTask }) => {
  return (
    <div className="bg-gray-800/50 border border-gray-600 pixel-corners p-4 max-h-60 overflow-y-auto">
      <h3 className="text-sm font-medium text-cyan-400 mb-3">Current Tasks ({tasks.filter(t => t.status === 'pending').length})</h3>
      {tasks.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">
          No tasks yet. Add your first development task above!
        </p>
      ) : (
        <div className="space-y-2">
          {tasks.filter(t => t.status === 'pending').slice(0, 5).reverse().map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-2 rounded border bg-gray-700/50 border-gray-600"
            >
              <div className="flex items-center space-x-2 flex-1">
                <span className="text-sm">{taskTypes[task.type]?.icon || '❓'}</span>
                <span className="text-sm text-white truncate" title={task.description}>
                  {task.description.length > 25 ? `${task.description.substring(0,22)}...` : task.description}
                </span>
              </div>
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  onClick={() => onCompleteTask(task.id)}
                  className="w-6 h-6 p-0 bg-green-500/20 hover:bg-green-500/30 text-green-400"
                  title="Complete Task"
                >
                  ✓
                </Button>
                <Button
                  size="sm"
                  onClick={() => onDeleteTask(task.id)}
                  className="w-6 h-6 p-0 bg-red-500/20 hover:bg-red-500/30 text-red-400"
                  title="Delete Task"
                >
                  ×
                </Button>
              </div>
            </div>
          ))}
          {tasks.filter(t => t.status === 'completed').slice(0, 2).reverse().map((task) => (
             <div
              key={task.id}
              className="flex items-center justify-between p-2 rounded border bg-green-500/10 border-green-500/30 opacity-70"
            >
              <div className="flex items-center space-x-2 flex-1">
                <span className="text-sm">{taskTypes[task.type]?.icon || '❓'}</span>
                <span className="text-sm line-through text-gray-400 truncate" title={task.description}>
                  {task.description.length > 20 ? `${task.description.substring(0,17)}...` : task.description}
                </span>
                {task.duration !== null && (
                  <span className="text-xs text-gray-500">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {task.duration}m
                  </span>
                )}
              </div>
               <Button
                  size="sm"
                  onClick={() => onDeleteTask(task.id)}
                  className="w-6 h-6 p-0 bg-red-500/20 hover:bg-red-500/30 text-red-400"
                  title="Delete Task"
                >
                  ×
                </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};