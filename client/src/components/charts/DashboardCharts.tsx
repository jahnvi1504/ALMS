import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartProps {
  data: any;
  options?: any;
  height?: number;
}

// Line Chart Component
export const LineChart: React.FC<ChartProps> = ({ data, options, height = 300 }) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  return (
    <div style={{ height }}>
      <Line data={data} options={{ ...defaultOptions, ...options }} />
    </div>
  );
};

// Bar Chart Component
export const BarChart: React.FC<ChartProps> = ({ data, options, height = 300 }) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  return (
    <div style={{ height }}>
      <Bar data={data} options={{ ...defaultOptions, ...options }} />
    </div>
  );
};

// Doughnut Chart Component
export const DoughnutChart: React.FC<ChartProps> = ({ data, options, height = 300 }) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: false,
      },
    },
  };

  return (
    <div style={{ height }}>
      <Doughnut data={data} options={{ ...defaultOptions, ...options }} />
    </div>
  );
};

// Utility functions for chart data formatting
export const formatMonthlyTrendsData = (monthlyData: any[], title: string = 'Monthly Trends') => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const labels = monthlyData.map(item => {
    const monthIndex = item._id.month - 1;
    return `${months[monthIndex]} ${item._id.year}`;
  });

  const datasets = [
    {
      label: 'Total Requests',
      data: monthlyData.map(item => item.count),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
    },
  ];

  if (monthlyData.length > 0 && monthlyData[0].approved !== undefined) {
    datasets.push({
      label: 'Approved',
      data: monthlyData.map(item => item.approved),
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      fill: false,
    });
  }

  if (monthlyData.length > 0 && monthlyData[0].rejected !== undefined) {
    datasets.push({
      label: 'Rejected',
      data: monthlyData.map(item => item.rejected),
      borderColor: 'rgb(239, 68, 68)',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      fill: false,
    });
  }

  return {
    labels,
    datasets,
  };
};

export const formatStatusDistributionData = (statusData: any[]) => {
  const colors = {
    pending: 'rgb(245, 158, 11)',
    approved: 'rgb(34, 197, 94)',
    rejected: 'rgb(239, 68, 68)',
  };

  const labels = statusData.map(item => item._id.charAt(0).toUpperCase() + item._id.slice(1));
  const data = statusData.map(item => item.count);
  const backgroundColor = statusData.map(item => colors[item._id as keyof typeof colors] || 'rgb(156, 163, 175)');

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor,
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };
};

export const formatLeaveTypeData = (typeData: any[]) => {
  const colors = {
    annual: 'rgb(59, 130, 246)',
    sick: 'rgb(239, 68, 68)',
    casual: 'rgb(168, 85, 247)',
  };

  const labels = typeData.map(item => item._id.charAt(0).toUpperCase() + item._id.slice(1));
  const data = typeData.map(item => item.count);
  const backgroundColor = typeData.map(item => colors[item._id as keyof typeof colors] || 'rgb(156, 163, 175)');

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor,
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };
};

export const formatDepartmentStatsData = (deptData: any[]) => {
  const labels = deptData.map(item => item._id);
  
  return {
    labels,
    datasets: [
      {
        label: 'Total Requests',
        data: deptData.map(item => item.totalRequests),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Approved',
        data: deptData.map(item => item.approvedRequests),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
      {
        label: 'Pending',
        data: deptData.map(item => item.pendingRequests),
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
      },
      {
        label: 'Rejected',
        data: deptData.map(item => item.rejectedRequests),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      },
    ],
  };
};
