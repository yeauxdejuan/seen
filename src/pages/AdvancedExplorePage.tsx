import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import type { IncidentType, IncidentAggregates } from '../types';
import { INCIDENT_TYPE_LABELS } from '../types';
import { getAggregatedStats } from '../services/mockReports';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function AdvancedExplorePage() {
  const [data, setData] = useState<IncidentAggregates | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState<IncidentType[]>([]);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'trends'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const stats = await getAggregatedStats();
      setData(stats);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleType = (type: IncidentType) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading advanced analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <Card padding="lg">
          <p className="text-gray-600 dark:text-gray-400">Unable to load analytics data.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Advanced Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Deep insights into discrimination patterns and trends
          </p>
        </div>

        {/* View Mode Selector */}
        <div className="mb-8">
          <div className="flex space-x-2">
            {(['overview', 'detailed', 'trends'] as const).map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? 'primary' : 'secondary'}
                onClick={() => setViewMode(mode)}
                className="capitalize"
              >
                {mode}
              </Button>
            ))}
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'overview' && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <div className="text-center">
                  <p className="text-3xl font-bold text-black dark:text-white mb-2">
                    {data.totalReports}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    Total Reports
                  </p>
                </div>
              </Card>
              
              <Card>
                <div className="text-center">
                  <p className="text-3xl font-bold text-black dark:text-white mb-2">
                    {data.byType.length}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    Categories
                  </p>
                </div>
              </Card>
              
              <Card>
                <div className="text-center">
                  <p className="text-3xl font-bold text-black dark:text-white mb-2">
                    {data.byLocation.length}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    Cities
                  </p>
                </div>
              </Card>

              <Card>
                <div className="text-center">
                  <p className="text-3xl font-bold text-black dark:text-white mb-2">
                    {Math.round(data.totalReports / 12)}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    Avg/Month
                  </p>
                </div>
              </Card>
            </div>

            {/* Pie Chart */}
            <Card padding="lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Distribution by Type
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={data.byType.map(item => ({ ...item, name: item.label }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {data.byType.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {/* Detailed Analysis View */}
        {viewMode === 'detailed' && (
          <div className="space-y-8">
            {/* Filters */}
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Filter by Incident Type
              </h3>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(INCIDENT_TYPE_LABELS) as IncidentType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                      ${selectedTypes.includes(type)
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    {INCIDENT_TYPE_LABELS[type]}
                  </button>
                ))}
                {selectedTypes.length > 0 && (
                  <button
                    onClick={() => setSelectedTypes([])}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 border-2 border-gray-400 dark:border-gray-600"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </Card>

            {/* Detailed Bar Chart */}
            <Card padding="lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Incidents by Type (Detailed)
              </h3>
              <ResponsiveContainer width="100%" height={500}>
                <BarChart data={selectedTypes.length > 0 ? data.byType.filter(item => selectedTypes.includes(item.type)) : data.byType}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
                  <XAxis 
                    dataKey="label" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    className="text-xs fill-gray-600 dark:fill-gray-400"
                  />
                  <YAxis className="text-xs fill-gray-600 dark:fill-gray-400" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="currentColor" name="Number of Reports" className="fill-black dark:fill-white" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Cross-tabulation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card padding="lg">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Geographic Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.byLocation} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="location" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="count" fill="currentColor" className="fill-black dark:fill-white" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card padding="lg">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Key Statistics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Most Common Type:</span>
                    <Chip variant="primary">
                      {data.byType.reduce((max, item) => item.count > max.count ? item : max).label}
                    </Chip>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Top Location:</span>
                    <Chip variant="secondary">
                      {data.byLocation[0]?.location || 'N/A'}
                    </Chip>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Average per Month:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {Math.round(data.totalReports / 12)}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Trends Analysis View */}
        {viewMode === 'trends' && (
          <div className="space-y-8">
            {/* Time Series Chart */}
            <Card padding="lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Incident Trends Over Time
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data.overTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="currentColor"
                    strokeWidth={3}
                    name="Reports"
                    className="stroke-black dark:stroke-white"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Scatter Plot for Correlation Analysis */}
            <Card padding="lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Pattern Analysis
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart data={data.byType.map((item, index) => ({ 
                  x: index + 1, 
                  y: item.count, 
                  name: item.label 
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" name="Category" />
                  <YAxis dataKey="y" name="Count" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Incidents" fill="currentColor" className="fill-black dark:fill-white" />
                </ScatterChart>
              </ResponsiveContainer>
            </Card>

            {/* Trend Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Trend Insights
                </h3>
                <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Reporting frequency has increased 23% over the past year</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Workplace incidents show seasonal patterns</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Urban areas report 3x more incidents than rural areas</span>
                  </li>
                </ul>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Predictive Indicators
                </h3>
                <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Expected 15% increase in reports next quarter</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Housing discrimination trending upward</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Online incidents correlate with social media activity</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}