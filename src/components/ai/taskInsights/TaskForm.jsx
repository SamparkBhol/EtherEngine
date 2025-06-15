import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const TaskForm = ({ onAddTask, taskTypes }) => {
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskType, setNewTaskType] = useState(Object.keys(taskTypes)[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddTask(newTaskDescription, newTaskType);
    setNewTaskDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800/50 border border-gray-600 pixel-corners p-4">
      <h3 className="text-sm font-medium text-cyan-400 mb-3">Add Development Task</h3>
      <div className="space-y-3">
        <select
          value={newTaskType}
          onChange={(e) => setNewTaskType(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
        >
          {Object.entries(taskTypes).map(([key, type]) => (
            <option key={key} value={key}>
              {type.icon} {type.label}
            </option>
          ))}
        </select>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            placeholder="Describe your task..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
          />
          <Button
            type="submit"
            size="sm"
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 pixel-corners"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </form>
  );
};