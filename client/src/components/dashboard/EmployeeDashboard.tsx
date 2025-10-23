import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  EventNote,
  History,
  CalendarMonth,
  EmojiEvents,
  LocalHospital,
  BeachAccess,
  TrendingUp,
  Assessment,
} from '@mui/icons-material';
import { RootState } from '../../store';
import { getEmployeeStats } from '../../services/statisticsService';
import { LineChart, DoughnutChart, formatMonthlyTrendsData, formatStatusDistributionData, formatLeaveTypeData } from '../charts/DashboardCharts';

const LeaveBalanceCard: React.FC<{ type: string; days: number; icon: React.ReactNode; color: string }> = ({ type, days, icon, color }) => {
  const maxDays = type === 'annual' ? 20 : type === 'sick' ? 10 : 5;
  const percentage = (days / maxDays) * 100;

  return (
    <div className="card hover:transform hover:-translate-y-1 transition-transform duration-200">
      <div className="flex items-center mb-4">
        <div className={`p-3 rounded-full mr-3 bg-opacity-10`} style={{ backgroundColor: `${color}20` }}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold">
          {type.charAt(0).toUpperCase() + type.slice(1)} Leave
        </h3>
      </div>
      <div className="mb-2">
        <span className="text-3xl font-bold">{days}</span>
        <span className="text-sm text-gray-500 ml-2">days</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className="h-2 rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <p className="text-sm text-gray-500">
        {maxDays - days} days remaining
      </p>
    </div>
  );
};

const QuickActionButton: React.FC<{ 
  title: string; 
  icon: React.ReactNode; 
  onClick: () => void;
  variant?: 'contained' | 'outlined';
}> = ({ title, icon, onClick, variant = 'contained' }) => (
  <button
    onClick={onClick}
    className={`w-full py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 ${
      variant === 'contained'
        ? 'bg-primary-main text-white hover:bg-primary-dark'
        : 'border-2 border-primary-main text-primary-main hover:bg-primary-main hover:text-white'
    }`}
  >
    {icon}
    <span>{title}</span>
  </button>
);

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-full ${color}`}>
        {icon}
      </div>
      <span className="text-3xl font-bold text-gray-900">{value}</span>
    </div>
    <p className="text-sm text-gray-600">{title}</p>
  </div>
);

const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getEmployeeStats();
        setStats(data);
      } catch (error: any) {
        console.error('Error fetching employee stats:', error);
        setError(error.response?.data?.message || 'Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (!user) {
    return null;
  }

  const leaveBalance = user.leaveBalance || {
    annual: 0,
    sick: 0,
    casual: 0
  };

  // Calculate summary statistics
  const totalRequests = stats?.leaveHistory?.length || 0;
  const approvedRequests = stats?.leaveStatusStats?.find((s: any) => s._id === 'approved')?.count || 0;
  const pendingRequests = stats?.leaveStatusStats?.find((s: any) => s._id === 'pending')?.count || 0;
  const rejectedRequests = stats?.leaveStatusStats?.find((s: any) => s._id === 'rejected')?.count || 0;

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center">Loading dashboard statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 gap-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-main to-primary-dark text-white p-8 rounded-xl mb-6">
          <h2 className="text-3xl font-semibold mb-2">
            Welcome back, {user.name}! 👋
          </h2>
          <p className="text-white/90">
            {user.department} Department
          </p>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Requests"
            value={totalRequests}
            icon={<Assessment className="text-blue-500" />}
            color="bg-blue-100"
          />
          <StatCard
            title="Approved"
            value={approvedRequests}
            icon={<TrendingUp className="text-green-500" />}
            color="bg-green-100"
          />
          <StatCard
            title="Pending"
            value={pendingRequests}
            icon={<EventNote className="text-orange-500" />}
            color="bg-orange-100"
          />
          <StatCard
            title="Rejected"
            value={rejectedRequests}
            icon={<History className="text-red-500" />}
            color="bg-red-100"
          />
        </div>

        {/* Leave Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LeaveBalanceCard 
            type="annual" 
            days={leaveBalance.annual} 
            icon={<BeachAccess className="text-primary-main" />}
            color="#1976d2"
          />
          <LeaveBalanceCard 
            type="sick" 
            days={leaveBalance.sick} 
            icon={<LocalHospital className="text-red-500" />}
            color="#ef4444"
          />
          <LeaveBalanceCard 
            type="casual" 
            days={leaveBalance.casual} 
            icon={<EmojiEvents className="text-secondary-main" />}
            color="#9c27b0"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trends */}
          {stats?.monthlyTrends && stats.monthlyTrends.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Request Trends</h3>
              <LineChart 
                data={formatMonthlyTrendsData(stats.monthlyTrends, 'Monthly Leave Requests')}
                height={300}
              />
            </div>
          )}

          {/* Leave Status Distribution */}
          {stats?.leaveStatusStats && stats.leaveStatusStats.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Status Distribution</h3>
              <DoughnutChart 
                data={formatStatusDistributionData(stats.leaveStatusStats)}
                height={300}
              />
            </div>
          )}

          {/* Leave Type Distribution */}
          {stats?.leaveTypeStats && stats.leaveTypeStats.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Type Distribution</h3>
              <DoughnutChart 
                data={formatLeaveTypeData(stats.leaveTypeStats)}
                height={300}
              />
            </div>
          )}

          {/* Recent Leave History */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Leave History</h3>
            {stats?.leaveHistory && stats.leaveHistory.length > 0 ? (
              <div className="space-y-3">
                {stats.leaveHistory.slice(0, 5).map((leave: any) => (
                  <div key={leave._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{leave.leaveType} Leave</p>
                      <p className="text-sm text-gray-500">
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                      leave.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                    </span>
                  </div>
                ))}
                {stats.leaveHistory.length > 5 && (
                  <button
                    onClick={() => navigate('/leave/history')}
                    className="w-full py-2 text-sm font-medium text-primary-main hover:text-primary-dark transition-colors duration-200"
                  >
                    View All History →
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No leave history available
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickActionButton
              title="Request Leave"
              icon={<EventNote />}
              onClick={() => navigate('/leave/apply')}
            />
            <QuickActionButton
              title="View Leave History"
              icon={<History />}
              onClick={() => navigate('/leave/history')}
              variant="outlined"
            />
            <QuickActionButton
              title="View Holidays"
              icon={<CalendarMonth />}
              onClick={() => navigate('/holidays')}
              variant="outlined"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard; 