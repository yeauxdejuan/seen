import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import type { IncidentAggregates, IncidentType } from '../types';
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
} from 'recharts';

export function ExplorePage() {
  const [data, setData] = useState<IncidentAggregates | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState<IncidentType[]>([]);

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

  const filteredByType = data?.byType.filter(
    item => selectedTypes.length === 0 || selectedTypes.includes(item.type)
  );

  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card padding="lg">
          <p className="text-gray-600 dark:text-gray-400">Unable to load analytics data.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Explore Incident Data
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Aggregated, anonymized data showing patterns of discrimination and bias
          </p>
        </div>

        {/* Notice */}
        <div className="mb-8 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                About This Data
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                This data is aggregated from anonymized reports. Individual identities are protected 
                while patterns become visible. In this prototype, most data is mock/simulated for 
                demonstration purposes.
              </p>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                {data.totalReports}
              </p>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                Total Reports
              </p>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <p className="text-4xl font-bold text-accent-600 dark:text-accent-400 mb-2">
                {data.byType.length}
              </p>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                Incident Categories
              </p>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                {data.byLocation.length}
              </p>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                Cities Represented
              </p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
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
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                `}
              >
                {INCIDENT_TYPE_LABELS[type]}
              </button>
            ))}
            {selectedTypes.length > 0 && (
              <button
                onClick={() => setSelectedTypes([])}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800"
              >
                Clear Filters
              </button>
            )}
          </div>
        </Card>

        {/* Charts */}
        <div className="space-y-8">
          {/* Incidents by Type */}
          <Card padding="lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Incidents by Type
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={filteredByType || data.byType}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
                <XAxis 
                  dataKey="label" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  className="text-xs fill-gray-600 dark:fill-gray-400"
                />
                <YAxis className="text-xs fill-gray-600 dark:fill-gray-400" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg, #fff)',
                    border: '1px solid var(--tooltip-border, #e5e7eb)',
                    borderRadius: '0.5rem',
                  }}
                  labelStyle={{ color: 'var(--tooltip-text, #111827)' }}
                />
                <Legend />
                <Bar dataKey="count" fill="#cd6c3f" name="Number of Reports" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Incidents Over Time */}
          <Card padding="lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Incidents Over Time
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data.overTime}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
                <XAxis 
                  dataKey="month"
                  tickFormatter={formatMonth}
                  className="text-xs fill-gray-600 dark:fill-gray-400"
                />
                <YAxis className="text-xs fill-gray-600 dark:fill-gray-400" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg, #fff)',
                    border: '1px solid var(--tooltip-border, #e5e7eb)',
                    borderRadius: '0.5rem',
                  }}
                  labelStyle={{ color: 'var(--tooltip-text, #111827)' }}
                  labelFormatter={formatMonth}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#cd6c3f" 
                  strokeWidth={2}
                  name="Number of Reports"
                  dot={{ fill: '#cd6c3f', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Incidents by Location */}
          <Card padding="lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Top Locations by Report Count
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.byLocation} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
                <XAxis type="number" className="text-xs fill-gray-600 dark:fill-gray-400" />
                <YAxis 
                  dataKey="location" 
                  type="category" 
                  width={150}
                  className="text-xs fill-gray-600 dark:fill-gray-400"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg, #fff)',
                    border: '1px solid var(--tooltip-border, #e5e7eb)',
                    borderRadius: '0.5rem',
                  }}
                  labelStyle={{ color: 'var(--tooltip-text, #111827)' }}
                />
                <Legend />
                <Bar dataKey="count" fill="#14b8a6" name="Number of Reports" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Insights Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Key Insights
            </h3>
            <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>
                  Workplace bias represents the largest category of reported incidents
                </span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>
                  Reports have shown an upward trend over the past year
                </span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>
                  Urban areas show higher report volumes, likely due to population density
                </span>
              </li>
            </ul>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              How This Data Helps
            </h3>
            <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-accent-600 dark:text-accent-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span>
                  Validates individual experiences through collective data
                </span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-accent-600 dark:text-accent-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span>
                  Informs community advocacy and support initiatives
                </span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-accent-600 dark:text-accent-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span>
                  Provides evidence for policy discussions and systemic change
                </span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
