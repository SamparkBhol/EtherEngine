import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export const taskTypes = {
  design: { label: 'Design', color: '#ff00ff', icon: '🎨' },
  scripting: { label: 'Scripting', color: '#00ffff', icon: '💻' },
  testing: { label: 'Testing', color: '#00ff00', icon: '🧪' },
  optimization: { label: 'Optimization', color: '#ffff00', icon: '⚡' },
  documentation: { label: 'Documentation', color: '#ff8800', icon: '📝' }
};

export const analyzeTaskData = (taskData) => {
  if (!taskData || taskData.length === 0) {
    return {
      typeAnalysis: {},
      timePatterns: { hourlyData: [], dailyData: {}, peakHour: undefined, mostProductiveDay: undefined },
      productivityTrend: { trend: 'stable', change: 0 },
      recommendations: [],
      totalTasks: 0,
      completedTasks: 0,
      completionRate: 0
    };
  }

  const completedTasks = taskData.filter(task => task.status === 'completed' && task.duration !== null && task.duration !== undefined);
  
  const typeAnalysis = Object.keys(taskTypes).reduce((acc, type) => {
    const typeTasks = completedTasks.filter(task => task.type === type);
    const totalDuration = typeTasks.reduce((sum, task) => sum + (task.duration || 0), 0);
    const avgDuration = typeTasks.length > 0 ? totalDuration / typeTasks.length : 0;
    
    acc[type] = {
      count: typeTasks.length,
      totalDuration,
      avgDuration,
      efficiency: avgDuration > 0 ? 100 / avgDuration : 0
    };
    return acc;
  }, {});

  const timePatterns = analyzeTimePatterns(completedTasks);
  const productivityTrend = calculateProductivityTrend(completedTasks);
  const recommendations = generateRecommendations(typeAnalysis, timePatterns, productivityTrend);

  return {
    typeAnalysis,
    timePatterns,
    productivityTrend,
    recommendations,
    totalTasks: taskData.length,
    completedTasks: completedTasks.length,
    completionRate: taskData.length > 0 ? (completedTasks.length / taskData.length) * 100 : 0
  };
};

const analyzeTimePatterns = (tasks) => {
  const hourlyData = new Array(24).fill(0);
  const dailyData = {};

  tasks.forEach(task => {
    const date = new Date(task.createdAt);
    const hour = date.getHours();
    const day = date.toDateString();

    hourlyData[hour]++;
    dailyData[day] = (dailyData[day] || 0) + 1;
  });

  const peakHour = hourlyData.indexOf(Math.max(...hourlyData));
  const mostProductiveDay = Object.keys(dailyData).length > 0 
    ? Object.keys(dailyData).reduce((a, b) => dailyData[a] > dailyData[b] ? a : b)
    : undefined;

  return { hourlyData, dailyData, peakHour, mostProductiveDay };
};

const calculateProductivityTrend = (tasks) => {
  if (tasks.length < 2) return { trend: 'stable', change: 0 };

  const sortedTasks = tasks
    .filter(task => task.duration !== null && task.duration !== undefined)
    .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
  
  if (sortedTasks.length < 2) return { trend: 'stable', change: 0 };

  const midPoint = Math.floor(sortedTasks.length / 2);
  
  const firstHalf = sortedTasks.slice(0, midPoint);
  const secondHalf = sortedTasks.slice(midPoint);

  if (firstHalf.length === 0 || secondHalf.length === 0) return { trend: 'stable', change: 0 };

  const firstHalfAvg = firstHalf.reduce((sum, task) => sum + task.duration, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, task) => sum + task.duration, 0) / secondHalf.length;

  if (firstHalfAvg === 0) return { trend: 'stable', change: 0 }; // Avoid division by zero

  const change = ((firstHalfAvg - secondHalfAvg) / firstHalfAvg) * 100;
  
  let trend = 'stable';
  if (change > 10) trend = 'improving';
  else if (change < -10) trend = 'declining';

  return { trend, change: Math.abs(change) };
};

const generateRecommendations = (typeAnalysis, timePatterns, productivityTrend) => {
  const recommendations = [];

  const sortedTypes = Object.entries(typeAnalysis)
    .sort((a, b) => b[1].avgDuration - a[1].avgDuration);

  if (sortedTypes.length > 0 && sortedTypes[0][1].avgDuration > 30) {
    recommendations.push({
      type: 'efficiency',
      title: 'Optimize Slow Tasks',
      description: `${taskTypes[sortedTypes[0][0]].label} tasks take ${sortedTypes[0][1].avgDuration.toFixed(1)} mins. Break them down.`,
      priority: 'high'
    });
  }

  if (timePatterns.peakHour !== undefined) {
    recommendations.push({
      type: 'scheduling',
      title: 'Optimize Work Schedule',
      description: `Most productive at ${timePatterns.peakHour}:00. Schedule key tasks then.`,
      priority: 'medium'
    });
  }

  if (productivityTrend.trend === 'declining') {
    recommendations.push({
      type: 'productivity',
      title: 'Address Productivity Decline',
      description: `Task time up ${productivityTrend.change.toFixed(1)}%. Review workflow.`,
      priority: 'high'
    });
  } else if (productivityTrend.trend === 'improving') {
    recommendations.push({
      type: 'productivity',
      title: 'Great Progress!',
      description: `Task time improved ${productivityTrend.change.toFixed(1)}%. Keep it up!`,
      priority: 'low'
    });
  }

  const designTasks = typeAnalysis.design?.count || 0;
  const scriptingTasks = typeAnalysis.scripting?.count || 0;
  
  if (designTasks > scriptingTasks * 2 && scriptingTasks > 0) {
    recommendations.push({
      type: 'balance',
      title: 'Balance Design & Code',
      description: 'Many design tasks vs scripting. Implement some designs.',
      priority: 'medium'
    });
  } else if (scriptingTasks > designTasks * 2 && designTasks > 0) {
    recommendations.push({
      type: 'balance',
      title: 'Plan Before Coding',
      description: 'Many scripting tasks vs design. Plan features first.',
      priority: 'medium'
    });
  }

  return recommendations.slice(0, 3); // Limit to 3 recommendations
};

export const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: false }
  },
  scales: {
    y: {
      ticks: { color: '#9ca3af', font: { size: 10 } }, // text-gray-400
      grid: { color: '#374151' } // border-gray-700
    },
    x: {
      ticks: { color: '#9ca3af', font: { size: 10 } },
      grid: { display: false }
    }
  }
};