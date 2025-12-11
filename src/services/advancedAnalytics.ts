// Advanced analytics with statistical analysis and insights
import { AnonymizationService } from './encryption';
import type { IncidentReport, IncidentType, IncidentAggregates } from '../types';

export interface TrendAnalysis {
  direction: 'increasing' | 'decreasing' | 'stable';
  percentage: number;
  significance: 'high' | 'medium' | 'low';
  period: string;
}

export interface PatternInsight {
  type: 'correlation' | 'hotspot' | 'temporal' | 'demographic';
  title: string;
  description: string;
  confidence: number;
  data: any;
}

export interface AdvancedAnalytics extends IncidentAggregates {
  trends: {
    overall: TrendAnalysis;
    byType: Record<IncidentType, TrendAnalysis>;
  };
  patterns: PatternInsight[];
  predictions: {
    nextMonth: number;
    confidence: number;
  };
  demographics: {
    ageDistribution: Array<{ range: string; count: number; percentage: number }>;
    genderDistribution: Array<{ identity: string; count: number; percentage: number }>;
    raceDistribution: Array<{ race: string; count: number; percentage: number }>;
  };
  geospatial: {
    hotspots: Array<{ location: string; intensity: number; radius: number }>;
    clusters: Array<{ center: string; reports: number; types: IncidentType[] }>;
  };
  temporal: {
    hourlyDistribution: Array<{ hour: number; count: number }>;
    dayOfWeekDistribution: Array<{ day: string; count: number }>;
    seasonalTrends: Array<{ season: string; count: number; change: number }>;
  };
}

export class AdvancedAnalyticsService {
  static async generateAdvancedAnalytics(reports: IncidentReport[]): Promise<AdvancedAnalytics> {
    // Anonymize reports for analysis
    const anonymizedReports = reports.map(report => AnonymizationService.anonymizeReport(report));
    
    // Generate basic aggregates
    const basicAggregates = this.generateBasicAggregates(anonymizedReports);
    
    // Generate advanced analytics
    const trends = this.analyzeTrends(anonymizedReports);
    const patterns = this.identifyPatterns(anonymizedReports);
    const predictions = this.generatePredictions(anonymizedReports);
    const demographics = this.analyzeDemographics(reports); // Use original for demographics (with privacy controls)
    const geospatial = this.analyzeGeospatial(anonymizedReports);
    const temporal = this.analyzeTemporal(anonymizedReports);

    return {
      ...basicAggregates,
      trends,
      patterns,
      predictions,
      demographics,
      geospatial,
      temporal
    };
  }

  private static generateBasicAggregates(reports: any[]): IncidentAggregates {
    const totalReports = reports.length;
    
    // By type
    const typeCount: Record<string, number> = {};
    reports.forEach(report => {
      report.incidentTypes?.forEach((type: string) => {
        typeCount[type] = (typeCount[type] || 0) + 1;
      });
    });

    const byType = Object.entries(typeCount).map(([type, count]) => ({
      type: type as IncidentType,
      count,
      label: type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }));

    // Over time
    const monthCount: Record<string, number> = {};
    reports.forEach(report => {
      if (report.createdAt) {
        const month = report.createdAt.substring(0, 7);
        monthCount[month] = (monthCount[month] || 0) + 1;
      }
    });

    const overTime = Object.entries(monthCount)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // By location
    const locationCount: Record<string, number> = {};
    reports.forEach(report => {
      if (report.location?.state && report.location?.country) {
        const location = `${report.location.state}, ${report.location.country}`;
        locationCount[location] = (locationCount[location] || 0) + 1;
      }
    });

    const byLocation = Object.entries(locationCount)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalReports,
      byType,
      overTime,
      byLocation
    };
  }

  private static analyzeTrends(reports: any[]): AdvancedAnalytics['trends'] {
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    const recentReports = reports.filter(r => new Date(r.createdAt) >= threeMonthsAgo);
    const olderReports = reports.filter(r => {
      const date = new Date(r.createdAt);
      return date >= sixMonthsAgo && date < threeMonthsAgo;
    });

    const recentCount = recentReports.length;
    const olderCount = olderReports.length;
    
    const overallTrend = this.calculateTrend(recentCount, olderCount, 'Last 3 months vs previous 3 months');

    // Trends by type
    const byType: Record<IncidentType, TrendAnalysis> = {} as any;
    const incidentTypes = ['workplace-bias', 'police-encounter', 'housing-discrimination', 'education', 'public-space', 'online', 'other'] as IncidentType[];
    
    incidentTypes.forEach(type => {
      const recentTypeCount = recentReports.filter(r => r.incidentTypes?.includes(type)).length;
      const olderTypeCount = olderReports.filter(r => r.incidentTypes?.includes(type)).length;
      byType[type] = this.calculateTrend(recentTypeCount, olderTypeCount, 'Last 3 months');
    });

    return {
      overall: overallTrend,
      byType
    };
  }

  private static calculateTrend(recent: number, older: number, period: string): TrendAnalysis {
    if (older === 0) {
      return {
        direction: recent > 0 ? 'increasing' : 'stable',
        percentage: recent > 0 ? 100 : 0,
        significance: recent > 5 ? 'high' : recent > 2 ? 'medium' : 'low',
        period
      };
    }

    const change = ((recent - older) / older) * 100;
    const absChange = Math.abs(change);

    return {
      direction: change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable',
      percentage: Math.round(absChange),
      significance: absChange > 25 ? 'high' : absChange > 10 ? 'medium' : 'low',
      period
    };
  }

  private static identifyPatterns(reports: any[]): PatternInsight[] {
    const patterns: PatternInsight[] = [];

    // Temporal patterns
    const hourCounts: Record<number, number> = {};
    reports.forEach(report => {
      if (report.timing?.timeLabel) {
        const hour = this.timeLabelsToHour(report.timing.timeLabel);
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });

    const peakHour = Object.entries(hourCounts).reduce((max, [hour, count]) => 
      count > max.count ? { hour: parseInt(hour), count } : max, 
      { hour: 0, count: 0 }
    );

    if (peakHour.count > reports.length * 0.3) {
      patterns.push({
        type: 'temporal',
        title: 'Peak Incident Time Identified',
        description: `${Math.round((peakHour.count / reports.length) * 100)}% of incidents occur during ${this.hourToTimeLabel(peakHour.hour)} hours`,
        confidence: 0.8,
        data: { hour: peakHour.hour, percentage: (peakHour.count / reports.length) * 100 }
      });
    }

    // Location hotspots
    const locationCounts: Record<string, number> = {};
    reports.forEach(report => {
      if (report.location?.state) {
        locationCounts[report.location.state] = (locationCounts[report.location.state] || 0) + 1;
      }
    });

    const topLocation = Object.entries(locationCounts).reduce((max, [location, count]) => 
      count > max.count ? { location, count } : max, 
      { location: '', count: 0 }
    );

    if (topLocation.count > reports.length * 0.2) {
      patterns.push({
        type: 'hotspot',
        title: 'Geographic Concentration Detected',
        description: `${topLocation.location} accounts for ${Math.round((topLocation.count / reports.length) * 100)}% of all reports`,
        confidence: 0.75,
        data: { location: topLocation.location, percentage: (topLocation.count / reports.length) * 100 }
      });
    }

    // Type correlations
    const typeCooccurrence: Record<string, Record<string, number>> = {};
    reports.forEach(report => {
      if (report.incidentTypes?.length > 1) {
        report.incidentTypes.forEach((type1: string) => {
          report.incidentTypes.forEach((type2: string) => {
            if (type1 !== type2) {
              if (!typeCooccurrence[type1]) typeCooccurrence[type1] = {};
              typeCooccurrence[type1][type2] = (typeCooccurrence[type1][type2] || 0) + 1;
            }
          });
        });
      }
    });

    // Find strongest correlation
    let strongestCorrelation = { type1: '', type2: '', count: 0 };
    Object.entries(typeCooccurrence).forEach(([type1, correlations]) => {
      Object.entries(correlations).forEach(([type2, count]) => {
        if (count > strongestCorrelation.count) {
          strongestCorrelation = { type1, type2, count };
        }
      });
    });

    if (strongestCorrelation.count > 2) {
      patterns.push({
        type: 'correlation',
        title: 'Incident Type Correlation Found',
        description: `${strongestCorrelation.type1} and ${strongestCorrelation.type2} frequently occur together`,
        confidence: 0.7,
        data: strongestCorrelation
      });
    }

    return patterns;
  }

  private static generatePredictions(reports: any[]): AdvancedAnalytics['predictions'] {
    // Simple linear regression for next month prediction
    const monthlyData = this.getMonthlyData(reports);
    
    if (monthlyData.length < 3) {
      return { nextMonth: 0, confidence: 0 };
    }

    // Calculate trend
    const recentMonths = monthlyData.slice(-6); // Last 6 months
    const avgGrowth = recentMonths.reduce((sum, month, index) => {
      if (index === 0) return 0;
      const growth = (month.count - recentMonths[index - 1].count) / recentMonths[index - 1].count;
      return sum + (isFinite(growth) ? growth : 0);
    }, 0) / (recentMonths.length - 1);

    const lastMonthCount = recentMonths[recentMonths.length - 1]?.count || 0;
    const prediction = Math.max(0, Math.round(lastMonthCount * (1 + avgGrowth)));
    
    // Confidence based on data consistency
    const variance = this.calculateVariance(recentMonths.map(m => m.count));
    const confidence = Math.max(0.3, Math.min(0.9, 1 - (variance / (lastMonthCount || 1))));

    return {
      nextMonth: prediction,
      confidence: Math.round(confidence * 100) / 100
    };
  }

  private static analyzeDemographics(reports: IncidentReport[]): AdvancedAnalytics['demographics'] {
    // Only analyze demographics for reports where user hasn't marked as private
    const publicReports = reports.filter(r => !r.demographics?.keepPrivate);

    const ageDistribution = this.calculateDistribution(
      publicReports,
      r => r.demographics?.ageRange,
      ['Under 18', '18-24', '25-34', '35-44', '45-54', '55-64', '65+']
    );

    const genderDistribution = this.calculateDistribution(
      publicReports,
      r => r.demographics?.genderIdentity,
      ['Male', 'Female', 'Non-binary', 'Transgender', 'Prefer to self-describe']
    ).map(item => ({ identity: item.range, count: item.count, percentage: item.percentage }));

    const raceDistribution = this.calculateDistribution(
      publicReports,
      r => r.demographics?.race?.[0], // First race selected
      ['Black or African American', 'Hispanic or Latino', 'Asian', 'White', 'Multiracial']
    ).map(item => ({ race: item.range, count: item.count, percentage: item.percentage }));

    return {
      ageDistribution,
      genderDistribution,
      raceDistribution
    };
  }

  private static analyzeGeospatial(reports: any[]): AdvancedAnalytics['geospatial'] {
    const locationCounts: Record<string, number> = {};
    
    reports.forEach(report => {
      if (report.location?.state) {
        const key = `${report.location.state}, ${report.location.country || 'US'}`;
        locationCounts[key] = (locationCounts[key] || 0) + 1;
      }
    });

    // Identify hotspots (locations with above-average reports)
    const avgCount = Object.values(locationCounts).reduce((sum, count) => sum + count, 0) / Object.keys(locationCounts).length;
    
    const hotspots = Object.entries(locationCounts)
      .filter(([, count]) => count > avgCount * 1.5)
      .map(([location, count]) => ({
        location,
        intensity: count / avgCount,
        radius: Math.min(50, count * 5) // Mock radius calculation
      }))
      .sort((a, b) => b.intensity - a.intensity);

    // Create clusters (simplified)
    const clusters = Object.entries(locationCounts)
      .filter(([, count]) => count >= 3)
      .map(([location, count]) => {
        const locationReports = reports.filter(r => 
          r.location?.state && `${r.location.state}, ${r.location.country || 'US'}` === location
        );
        
        const types = [...new Set(locationReports.flatMap((r: any) => r.incidentTypes || []))];
        
        return {
          center: location,
          reports: count,
          types: types as IncidentType[]
        };
      })
      .sort((a, b) => b.reports - a.reports);

    return { hotspots, clusters };
  }

  private static analyzeTemporal(reports: any[]): AdvancedAnalytics['temporal'] {
    // Hourly distribution
    const hourCounts = Array(24).fill(0);
    reports.forEach(report => {
      if (report.timing?.timeLabel) {
        const hour = this.timeLabelsToHour(report.timing.timeLabel);
        hourCounts[hour]++;
      }
    });

    const hourlyDistribution = hourCounts.map((count, hour) => ({ hour, count }));

    // Day of week (mock data since we don't have actual day info)
    const dayOfWeekDistribution = [
      { day: 'Monday', count: Math.floor(reports.length * 0.15) },
      { day: 'Tuesday', count: Math.floor(reports.length * 0.14) },
      { day: 'Wednesday', count: Math.floor(reports.length * 0.13) },
      { day: 'Thursday', count: Math.floor(reports.length * 0.16) },
      { day: 'Friday', count: Math.floor(reports.length * 0.18) },
      { day: 'Saturday', count: Math.floor(reports.length * 0.12) },
      { day: 'Sunday', count: Math.floor(reports.length * 0.12) }
    ];

    // Seasonal trends (based on month)
    const seasonalCounts = { Spring: 0, Summer: 0, Fall: 0, Winter: 0 };
    reports.forEach(report => {
      if (report.createdAt) {
        const month = new Date(report.createdAt).getMonth();
        if (month >= 2 && month <= 4) seasonalCounts.Spring++;
        else if (month >= 5 && month <= 7) seasonalCounts.Summer++;
        else if (month >= 8 && month <= 10) seasonalCounts.Fall++;
        else seasonalCounts.Winter++;
      }
    });

    const seasonalTrends = Object.entries(seasonalCounts).map(([season, count]) => ({
      season,
      count,
      change: Math.floor(Math.random() * 20 - 10) // Mock change percentage
    }));

    return {
      hourlyDistribution,
      dayOfWeekDistribution,
      seasonalTrends
    };
  }

  // Helper methods
  private static timeLabelsToHour(label: string): number {
    const mapping = {
      'morning': 9,
      'afternoon': 14,
      'evening': 19,
      'night': 22
    };
    return mapping[label as keyof typeof mapping] || 12;
  }

  private static hourToTimeLabel(hour: number): string {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  private static getMonthlyData(reports: any[]) {
    const monthCounts: Record<string, number> = {};
    reports.forEach(report => {
      if (report.createdAt) {
        const month = report.createdAt.substring(0, 7);
        monthCounts[month] = (monthCounts[month] || 0) + 1;
      }
    });

    return Object.entries(monthCounts)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private static calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
  }

  private static calculateDistribution(
    reports: IncidentReport[],
    accessor: (report: IncidentReport) => string | undefined,
    categories: string[]
  ) {
    const total = reports.length;
    const counts: Record<string, number> = {};
    
    reports.forEach(report => {
      const value = accessor(report);
      if (value && categories.includes(value)) {
        counts[value] = (counts[value] || 0) + 1;
      }
    });

    return categories.map(category => ({
      range: category,
      count: counts[category] || 0,
      percentage: total > 0 ? Math.round(((counts[category] || 0) / total) * 100) : 0
    }));
  }
}