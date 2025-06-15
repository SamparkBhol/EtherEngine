import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, Plus, Clock, TrendingUp, Target } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { TaskForm } from '@/components/ai/taskInsights/TaskForm';
import { TaskList } from '@/components/ai/taskInsights/TaskList';
import { TaskAnalytics } from '@/components/ai/taskInsights/TaskAnalytics';
import { analyzeTaskData, taskTypes } from '@/lib/ai/taskInsightsHelper';

const AITaskInsights = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [insights, setInsights] = useState({});

  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem('etherengine_tasks') || '[]');
    setTasks(storedTasks);
  }, []);

  useEffect(() => {
    localStorage.setItem('etherengine_tasks', JSON.stringify(tasks));
    const newInsights = analyzeTaskData(tasks);
    setInsights(newInsights);
  }, [tasks]);

  const addTask = (newTaskDescription, newTaskType) => {
    if (!newTaskDescription.trim()) return;

    const task = {
      id: Date.now(),
      description: newTaskDescription,
      type: newTaskType,
      createdAt: new Date().toISOString(),
      completedAt: null,
      duration: null,
      status: 'pending'
    };

    setTasks(prev => [...prev, task]);
    
    toast({
      title: "Task Added! 📝",
      description: "Your development task has been tracked.",
    });
  };

  const completeTask = (taskId) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId && task.status === 'pending') {
        const completedAt = new Date().toISOString();
        const duration = (new Date(completedAt).getTime() - new Date(task.createdAt).getTime()) / (1000 * 60);
        
        return {
          ...task,
          status: 'completed',
          completedAt,
          duration: Math.round(duration) 
        };
      }
      return task;
    }));

    toast({
      title: "Task Completed! ✅",
      description: "Great progress on your game development!",
    });
  };

  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    
    toast({
      title: "Task Deleted! 🗑️",
      description: "Task removed from tracking.",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <BarChart3 className="w-5 h-5 text-cyan-500" />
        <h2 className="text-lg font-bold text-cyan-500 neon-text">AI Task Insights</h2>
      </div>

      <TaskForm onAddTask={addTask} taskTypes={taskTypes} />
      <TaskList tasks={tasks} taskTypes={taskTypes} onCompleteTask={completeTask} onDeleteTask={deleteTask} />
      <TaskAnalytics insights={insights} taskTypes={taskTypes} />
    </div>
  );
};

export default AITaskInsights;