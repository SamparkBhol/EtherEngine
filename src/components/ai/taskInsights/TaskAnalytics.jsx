import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { TrendingUp, Target } from 'lucide-react';
import { chartOptions } from '@/lib/ai/taskInsightsHelper';

export const TaskAnalytics = ({ insights, taskTypes }) => {
  if (!insights || insights.totalTasks === 0) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        Complete some tasks to see AI insights.
      </div>
    );
  }

  const getTaskTypeChartData = () => {
    if (!insights.typeAnalysis) return null;
    const labels = Object.keys(insights.typeAnalysis).map(type => taskTypes[type]?.label || type);
    const data = Object.values(insights.typeAnalysis).map(analysis => analysis.count);
    const colors = Object.keys(insights.typeAnalysis).map(type => (taskTypes[type]?.color || '#888888'));

    return {
      labels,
      datasets: [{ data, backgroundColor: colors.map(c => `${c}BF`), borderColor: colors, borderWidth: 1 }]
    };
  };

  const getDurationChartData = () => {
    if (!insights.typeAnalysis) return null;
    const labels = Object.keys(insights.typeAnalysis).map(type => taskTypes[type]?.label || type);
    const data = Object.values(insights.typeAnalysis).map(analysis => analysis.avgDuration);
    const colors = Object.keys(insights.typeAnalysis).map(type => (taskTypes[type]?.color || '#888888'));
    
    return {
      labels,
      datasets: [{ label: 'Avg Duration (min)', data, backgroundColor: colors.map(c => `${c}BF`), borderColor: colors, borderWidth: 1 }]
    };
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        <StatCard title="Total Tasks" value={insights.totalTasks} color="text-cyan-400" />
        <StatCard title="Completed" value={insights.completedTasks} color="text-green-400" />
        <StatCard title="Success Rate" value={`${insights.completionRate.toFixed(0)}%`} color="text-pink-400" />
      </div>

      {insights.completedTasks > 0 && (
        <div className="space-y-4 mt-4">
          <ChartCard title="Task Distribution">
            {getTaskTypeChartData() && <Doughnut data={getTaskTypeChartData()} options={{...chartOptions, plugins: {...chartOptions.plugins, legend: { display: true, position: 'right', labels: {color: '#9ca3af', boxWidth:10, padding:10, font:{size:10}} }}}} />}
          </ChartCard>
          <ChartCard title="Average Duration by Type">
            {getDurationChartData() && <Bar data={getDurationChartData()} options={chartOptions} />}
          </ChartCard>
        </div>
      )}

      {insights.recommendations && insights.recommendations.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-600 pixel-corners p-4 mt-4">
          <h4 className="text-sm font-medium text-cyan-400 mb-3">
            <Target className="w-4 h-4 inline mr-2" /> AI Recommendations
          </h4>
          <div className="space-y-2">
            {insights.recommendations.map((rec, index) => (
              <RecommendationCard key={index} recommendation={rec} />
            ))}
          </div>
        </div>
      )}

      {insights.productivityTrend && (
        <div className="bg-gray-800/50 border border-gray-600 pixel-corners p-4 mt-4">
          <h4 className="text-sm font-medium text-cyan-400 mb-3">
            <TrendingUp className="w-4 h-4 inline mr-2" /> Productivity Trend
          </h4>
          <ProductivityTrendCard trend={insights.productivityTrend} />
        </div>
      )}
    </>
  );
};

const StatCard = ({ title, value, color }) => (
  <div className="bg-gray-800/50 border border-gray-600 pixel-corners p-3 text-center">
    <div className={`text-lg font-bold ${color}`}>{value}</div>
    <div className="text-xs text-gray-400">{title}</div>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-gray-800/50 border border-gray-600 pixel-corners p-4">
    <h4 className="text-sm font-medium text-cyan-400 mb-3">{title}</h4>
    <div className="h-40">{children}</div>
  </div>
);

const RecommendationCard = ({ recommendation }) => {
  const priorityStyles = {
    high: 'bg-red-500/10 border-red-500/30 text-red-400',
    medium: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    low: 'bg-green-500/10 border-green-500/30 text-green-400',
  };
  return (
    <div className={`p-3 rounded border ${priorityStyles[recommendation.priority] || 'bg-gray-700/50 border-gray-600'}`}>
      <div className="flex items-center justify-between mb-1">
        <h5 className="text-sm font-medium text-white">{recommendation.title}</h5>
        <span className={`text-xs px-2 py-0.5 rounded ${priorityStyles[recommendation.priority]?.replace('border-', 'bg-').replace('/30', '/20') || 'bg-gray-600 text-gray-300'}`}>
          {recommendation.priority.toUpperCase()}
        </span>
      </div>
      <p className="text-xs text-gray-300">{recommendation.description}</p>
    </div>
  );
};

const ProductivityTrendCard = ({ trend }) => {
  const trendInfo = {
    improving: { icon: '📈', color: 'text-green-400' },
    declining: { icon: '📉', color: 'text-red-400' },
    stable: { icon: '📊', color: 'text-yellow-400' },
  };
  return (
    <div className="flex items-center space-x-4">
      <div className={`text-2xl ${trendInfo[trend.trend]?.color || 'text-gray-400'}`}>
        {trendInfo[trend.trend]?.icon || '?'}
      </div>
      <div>
        <div className="text-sm font-medium text-white capitalize">{trend.trend}</div>
        <div className="text-xs text-gray-400">
          {trend.change.toFixed(1)}% change in task completion time
        </div>
      </div>
    </div>
  );
};