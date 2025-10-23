import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { getCurrentUser } from "../../services/api";
import { motion } from "framer-motion";
import { 
  Edit, 
  Mail, 
  Calendar, 
  MapPin, 
  Briefcase, 
  Clock, 
  Shield, 
  RefreshCcw,
  User,
  Phone,
  Award,
  LogIn
} from "lucide-react";

interface InfoRowProps {
  label: string;
  value?: React.ReactNode;
  icon?: React.ReactNode;
  loading?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, icon, loading = false }) => (
  <div className="flex items-center justify-between py-4 px-1 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors duration-200 rounded-lg group">
    <div className="flex items-center gap-3">
      {icon && <div className="text-gray-500 group-hover:text-indigo-600 transition-colors">{icon}</div>}
      <span className="text-gray-500 font-medium">{label}</span>
    </div>
    <div className="text-right ml-4">
      {loading ? (
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
      ) : value ?? (
        <span className="text-gray-400">—</span>
      )}
    </div>
  </div>
);

const ProfileSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header Skeleton */}
      <div className="relative">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-300 to-gray-400 h-32 absolute inset-x-0 top-0 animate-pulse" />
          <div className="relative pt-20 pb-8 px-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              <div className="w-24 h-24 rounded-full bg-gray-300 border-4 border-white shadow-lg animate-pulse"></div>
              <div className="text-center md:text-left flex-1 space-y-3">
                <div className="h-8 w-64 bg-gray-300 rounded animate-pulse mx-auto md:mx-0"></div>
                <div className="h-6 w-48 bg-gray-300 rounded animate-pulse mx-auto md:mx-0"></div>
                <div className="flex gap-2 justify-center md:justify-start">
                  <div className="h-6 w-24 bg-gray-300 rounded-full animate-pulse"></div>
                  <div className="h-6 w-20 bg-gray-300 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="h-10 w-32 bg-gray-300 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Personal Information Skeleton */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl shadow-md">
            <div className="px-6 py-4 border-b">
              <div className="h-6 w-48 bg-gray-300 rounded animate-pulse"></div>
            </div>
            <div className="px-6 py-4 space-y-4">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex justify-between py-2">
                  <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                  <div className="h-4 w-32 bg-gray-300 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side Column Skeleton */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md">
            <div className="px-6 py-4 border-b">
              <div className="h-6 w-36 bg-gray-300 rounded animate-pulse"></div>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="h-6 w-full bg-gray-300 rounded animate-pulse"></div>
              <div className="h-6 w-full bg-gray-300 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md">
            <div className="px-6 py-4 border-b">
              <div className="h-6 w-40 bg-gray-300 rounded animate-pulse"></div>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="h-6 w-full bg-gray-300 rounded animate-pulse"></div>
              <div className="h-6 w-full bg-gray-300 rounded animate-pulse"></div>
              <div className="h-6 w-full bg-gray-300 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ProfilePage: React.FC = () => {
  const { user: cachedUser } = useSelector((s: RootState) => s.auth);
  const [user, setUser] = useState<any>(cachedUser);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const freshUser = await getCurrentUser();
      setUser(freshUser);
    } catch (e: any) {
      setError(e?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const formatDate = (dateString: string) =>
    dateString ? new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }) : "-";

  const formatDateTime = (dateString: string) =>
    dateString ? new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }) : "-";

  if (loading && !user) {
    return <ProfileSkeleton />;
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Profile</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadUserData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <motion.div 
      className="min-h-screen bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="relative">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 h-32 absolute inset-x-0 top-0" />
            <div className="relative pt-20 pb-8 px-6">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-indigo-100 flex items-center justify-center">
                  {user.avatar ? (
                    <img src="https://avatars.githubusercontent.com/u/128251996?s=400&u=e15ca80671a00f7803a7bece99659321efcca7cf&v=4" alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-indigo-500" />
                  )}
                </div>
                <div className="text-center md:text-left flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
                  <p className="text-xl text-gray-600 mb-3">{user.role}</p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-700">
                      {user.department || "No department"}
                    </span>
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full ${
                        user.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <button 
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition"
                  onClick={loadUserData}
                  disabled={loading}
                >
                  {loading ? (
                    <RefreshCcw className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCcw className="w-4 h-4" />
                  )}
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
              <div className="px-6 py-4 border-b">
                <h2 className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                  <div className="w-2 h-6 bg-indigo-500 rounded-full" />
                  Personal Information
                </h2>
              </div>
              <div className="px-6 py-4">
                <InfoRow 
                  label="Full Name" 
                  value={<span className="font-semibold text-gray-900">{user.name}</span>} 
                  icon={<Shield className="w-4 h-4" />}
                  loading={loading}
                />
                <InfoRow 
                  label="Email Address" 
                  value={<span className="font-medium text-indigo-600">{user.email}</span>} 
                  icon={<Mail className="w-4 h-4" />}
                  loading={loading}
                />
                <InfoRow 
                  label="Employee ID" 
                  value={<code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">{user.employeeId || "—"}</code>} 
                  icon={<Award className="w-4 h-4" />}
                  loading={loading}
                />
                <InfoRow 
                  label="Phone" 
                  value={<span className="font-medium">{user.phone || "—"}</span>} 
                  icon={<Phone className="w-4 h-4" />}
                  loading={loading}
                />
                <InfoRow 
                  label="Location" 
                  value={<span className="font-medium">{user.location || "—"}</span>} 
                  icon={<MapPin className="w-4 h-4" />}
                  loading={loading}
                />
                <InfoRow 
                  label="Department" 
                  value={<span className="px-2 py-1 rounded bg-gray-100 text-gray-700">{user.department || "—"}</span>} 
                  icon={<Briefcase className="w-4 h-4" />}
                  loading={loading}
                />
                <InfoRow 
                  label="Position" 
                  value={<span className="font-medium">{user.position || "—"}</span>} 
                  icon={<Briefcase className="w-4 h-4" />}
                  loading={loading}
                />
              </div>
            </div>
          </div>

          {/* Side Column */}
          <div className="space-y-6">
            {/* Account Status */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
              <div className="px-6 py-4 border-b">
                <h2 className="flex items-center gap-3 text-lg font-semibold">
                  <div className="w-2 h-6 bg-indigo-500 rounded-full" />
                  Account Status
                </h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-sm text-gray-500 mb-1">Last Login</div>
                  <div className="font-medium flex items-center gap-2">
                    <LogIn className="w-4 h-4 text-gray-500" />
                    {formatDateTime(user.lastLogin)}
                  </div>
                </div>
              </div>
            </div>

            {/* Important Dates */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
              <div className="px-6 py-4 border-b">
                <h2 className="flex items-center gap-3 text-lg font-semibold">
                  <div className="w-2 h-6 bg-indigo-500 rounded-full" />
                  Important Dates
                </h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Joining Date</div>
                  <div className="font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    {formatDate(user.joiningDate)}
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-sm text-gray-500 mb-1">Profile Created</div>
                  <div className="font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    {formatDateTime(user.createdAt)}
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-sm text-gray-500 mb-1">Last Updated</div>
                  <div className="font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    {formatDateTime(user.updatedAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;