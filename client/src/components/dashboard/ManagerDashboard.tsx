import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store';
import { LeaveRequest } from '../../types';
import { getLeaveRequests } from '../../services/api';
import { getManagerStats } from '../../services/statisticsService';
import { Grid } from '../common/Grid';
import { 
  EventNote, 
  History, 
  CalendarMonth, 
  People, 
  TrendingUp, 
  Assessment,
  Group,
  PendingActions
} from '@mui/icons-material';
import { LineChart, DoughnutChart, BarChart, formatMonthlyTrendsData, formatStatusDistributionData, formatDepartmentStatsData } from '../charts/DashboardCharts';

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

const ManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch pending requests
        const requests = await getLeaveRequests();
        setPendingRequests(requests.filter(req => req.status === 'pending'));
        
        // Fetch manager statistics
        const managerStats = await getManagerStats();
        setStats(managerStats);
        
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!user) {
    return null;
  }

  // Calculate summary statistics
  const totalRequests = stats?.departmentStats?.reduce((sum: number, stat: any) => sum + stat.count, 0) || 0;
  const approvedRequests = stats?.departmentStats?.find((s: any) => s._id === 'approved')?.count || 0;
  const pendingCount = stats?.departmentStats?.find((s: any) => s._id === 'pending')?.count || 0;
  const rejectedRequests = stats?.departmentStats?.find((s: any) => s._id === 'rejected')?.count || 0;

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
            {user.department} Department Manager
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
            value={pendingCount}
            icon={<PendingActions className="text-orange-500" />}
            color="bg-orange-100"
          />
          <StatCard
            title="Rejected"
            value={rejectedRequests}
            icon={<History className="text-red-500" />}
            color="bg-red-100"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Requests */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Pending Leave Requests
                </h3>
                {pendingRequests.length > 0 && (
                  <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                    {pendingRequests.length}
                  </span>
                )}
              </div>

              {pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No pending requests
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.slice(0, 5).map((request) => (
                    <div key={request._id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {request.leaveType} Leave Request
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            From: {new Date(request.startDate).toLocaleDateString()} To: {new Date(
                              request.endDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => navigate('/leave/requests')}
                          className="px-4 py-2 text-sm font-medium text-primary-main hover:text-primary-dark transition-colors duration-200"
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  ))}
                  {pendingRequests.length > 5 && (
                    <button
                      onClick={() => navigate('/leave/requests')}
                      className="w-full py-2 text-sm font-medium text-primary-main hover:text-primary-dark transition-colors duration-200"
                    >
                      View All Requests →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
            <div className="space-y-4">
              <QuickActionButton
                title="Manage Leave Requests"
                icon={<EventNote />}
                onClick={() => navigate('/leave/requests')}
              />
              <QuickActionButton
                title="View Team Calendar"
                icon={<People />}
                onClick={() => navigate('/team')}
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

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Monthly Trends */}
          {stats?.monthlyDeptTrends && stats.monthlyDeptTrends.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Leave Trends</h3>
              <LineChart 
                data={formatMonthlyTrendsData(stats.monthlyDeptTrends, `${user.department} Department Trends`)}
                height={300}
              />
            </div>
          )}

          {/* Department Status Distribution */}
          {stats?.departmentStats && stats.departmentStats.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Status Distribution</h3>
              <DoughnutChart 
                data={formatStatusDistributionData(stats.departmentStats)}
                height={300}
              />
            </div>
          )}

          {/* Recent Department Requests */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Department Requests</h3>
            {stats?.recentRequests && stats.recentRequests.length > 0 ? (
              <div className="space-y-3">
                {stats.recentRequests.slice(0, 5).map((request: any) => (
                  <div key={request._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{request.employee?.name || 'Unknown Employee'}</p>
                      <p className="text-sm text-gray-500 capitalize">
                        {request.leaveType} Leave - {new Date(request.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      request.status === 'approved' ? 'bg-green-100 text-green-800' :
                      request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                ))}
                {stats.recentRequests.length > 5 && (
                  <button
                    onClick={() => navigate('/leave/requests')}
                    className="w-full py-2 text-sm font-medium text-primary-main hover:text-primary-dark transition-colors duration-200"
                  >
                    View All Requests →
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent requests in department
              </div>
            )}
          </div>

          {/* Department Overview */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Group className="text-blue-500 mr-2" />
                  <span className="text-sm text-gray-600">Department</span>
                </div>
                <span className="font-semibold text-blue-600">{user.department}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">Approval Rate</span>
                </div>
                <span className="font-semibold text-green-600">
                  {totalRequests > 0 ? Math.round((approvedRequests / totalRequests) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center">
                  <PendingActions className="text-orange-500 mr-2" />
                  <span className="text-sm text-gray-600">Pending Rate</span>
                </div>
                <span className="font-semibold text-orange-600">
                  {totalRequests > 0 ? Math.round((pendingCount / totalRequests) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard; 