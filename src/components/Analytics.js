import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  ChartBarIcon,
  UsersIcon,
  DocumentIcon,
  FolderIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function Analytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDocuments: 0,
    totalFiles: 0,
    activeUsers: 0,
    storageUsed: 0,
    apiCalls: 0
  });
  const [userActivity, setUserActivity] = useState([]);
  const [resourceUsage, setResourceUsage] = useState([]);
  const [apiUsage, setApiUsage] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const startDate = new Date();
      startDate.setDate(now.getDate() - parseInt(timeRange));

      // Fetch user activity
      const userActivityQuery = query(
        collection(db, 'activity_logs'),
        where('timestamp', '>=', startDate)
      );
      const userActivitySnapshot = await getDocs(userActivityQuery);
      const userActivityData = processUserActivity(userActivitySnapshot.docs);
      setUserActivity(userActivityData);

      // Fetch resource usage
      const resourceUsageQuery = query(
        collection(db, 'resource_usage'),
        where('timestamp', '>=', startDate)
      );
      const resourceUsageSnapshot = await getDocs(resourceUsageQuery);
      const resourceUsageData = processResourceUsage(resourceUsageSnapshot.docs);
      setResourceUsage(resourceUsageData);

      // Fetch API usage
      const apiUsageQuery = query(
        collection(db, 'api_logs'),
        where('timestamp', '>=', startDate)
      );
      const apiUsageSnapshot = await getDocs(apiUsageQuery);
      const apiUsageData = processApiUsage(apiUsageSnapshot.docs);
      setApiUsage(apiUsageData);

      // Update overall stats
      setStats({
        totalUsers: userActivityData.reduce((acc, curr) => acc + curr.users, 0),
        totalDocuments: resourceUsageData.reduce((acc, curr) => acc + curr.documents, 0),
        totalFiles: resourceUsageData.reduce((acc, curr) => acc + curr.files, 0),
        activeUsers: userActivityData[userActivityData.length - 1]?.users || 0,
        storageUsed: resourceUsageData[resourceUsageData.length - 1]?.storage || 0,
        apiCalls: apiUsageData.reduce((acc, curr) => acc + curr.calls, 0)
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processUserActivity = (docs) => {
    const activity = {};
    docs.forEach(doc => {
      const data = doc.data();
      const date = data.timestamp.toDate().toISOString().split('T')[0];
      if (!activity[date]) {
        activity[date] = { date, users: 0 };
      }
      activity[date].users++;
    });
    return Object.values(activity).sort((a, b) => a.date.localeCompare(b.date));
  };

  const processResourceUsage = (docs) => {
    const usage = {};
    docs.forEach(doc => {
      const data = doc.data();
      const date = data.timestamp.toDate().toISOString().split('T')[0];
      if (!usage[date]) {
        usage[date] = { date, documents: 0, files: 0, storage: 0 };
      }
      usage[date].documents += data.documents || 0;
      usage[date].files += data.files || 0;
      usage[date].storage += data.storage || 0;
    });
    return Object.values(usage).sort((a, b) => a.date.localeCompare(b.date));
  };

  const processApiUsage = (docs) => {
    const usage = {};
    docs.forEach(doc => {
      const data = doc.data();
      const date = data.timestamp.toDate().toISOString().split('T')[0];
      if (!usage[date]) {
        usage[date] = { date, calls: 0 };
      }
      usage[date].calls++;
    });
    return Object.values(usage).sort((a, b) => a.date.localeCompare(b.date));
  };

  const StatCard = ({ title, value, icon: Icon, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${trend > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
          <Icon className={`h-6 w-6 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`} />
        </div>
      </div>
      <div className="mt-4 flex items-center">
        {trend > 0 ? (
          <ArrowUpIcon className="h-4 w-4 text-green-500" />
        ) : (
          <ArrowDownIcon className="h-4 w-4 text-red-500" />
        )}
        <span className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {Math.abs(trend)}% from last period
        </span>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={UsersIcon}
          trend={5.2}
        />
        <StatCard
          title="Total Documents"
          value={stats.totalDocuments}
          icon={DocumentIcon}
          trend={3.8}
        />
        <StatCard
          title="Total Files"
          value={stats.totalFiles}
          icon={FolderIcon}
          trend={-2.1}
        />
        <StatCard
          title="API Calls"
          value={stats.apiCalls}
          icon={ChartBarIcon}
          trend={12.5}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow"
        >
          <h2 className="text-lg font-medium text-gray-900 mb-4">User Activity</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow"
        >
          <h2 className="text-lg font-medium text-gray-900 mb-4">Resource Usage</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resourceUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="documents" fill="#8884d8" />
                <Bar dataKey="files" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-lg shadow"
        >
          <h2 className="text-lg font-medium text-gray-900 mb-4">API Usage</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={apiUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="calls"
                  stroke="#82ca9d"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-6 rounded-lg shadow"
        >
          <h2 className="text-lg font-medium text-gray-900 mb-4">Storage Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Documents', value: stats.totalDocuments },
                    { name: 'Files', value: stats.totalFiles },
                    { name: 'Other', value: stats.storageUsed - stats.totalDocuments - stats.totalFiles }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 