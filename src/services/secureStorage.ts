// Secure storage service with encryption and audit logging
import { EncryptionService, AnonymizationService } from './encryption';
import { AuthService } from './auth';
import type { IncidentReport, IncidentReportDraft } from '../types';

export interface AuditLog {
  id: string;
  userId: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'export';
  resourceType: 'report' | 'user' | 'analytics';
  resourceId: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface SecureReport extends IncidentReport {
  encrypted: boolean;
  auditTrail: string[]; // Array of audit log IDs
}

export class SecureStorageService {
  private static readonly REPORT_PREFIX = 'seen_secure_report_';
  private static readonly DRAFT_PREFIX = 'seen_secure_draft_';
  private static readonly AUDIT_PREFIX = 'seen_audit_';
  private static readonly ANALYTICS_KEY = 'seen_analytics_cache';

  static async saveReport(draft: IncidentReportDraft): Promise<string> {
    const user = AuthService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const reportId = this.generateReportId();
    const report: IncidentReport = {
      ...draft,
      id: reportId,
      createdAt: new Date().toISOString(),
      userId: user.id
    };

    // Encrypt the report
    const encryptedReport = EncryptionService.encrypt(report, user.encryptionKey);
    
    // Create audit log entry
    const auditId = await this.createAuditLog({
      userId: user.id,
      action: 'create',
      resourceType: 'report',
      resourceId: reportId,
      metadata: {
        incidentTypes: report.incidentTypes,
        location: report.location?.state,
        encrypted: true
      }
    });

    // Store encrypted report
    const storageKey = this.REPORT_PREFIX + reportId;
    localStorage.setItem(storageKey, JSON.stringify({
      ...encryptedReport,
      metadata: {
        id: reportId,
        userId: user.id,
        createdAt: report.createdAt,
        encrypted: true,
        auditTrail: [auditId]
      }
    }));

    // Update analytics cache
    await this.updateAnalyticsCache(report);

    // Clear any existing draft
    this.clearDraft();

    return reportId;
  }

  static async getReport(reportId: string): Promise<IncidentReport | null> {
    const user = AuthService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const storageKey = this.REPORT_PREFIX + reportId;
    const encryptedData = localStorage.getItem(storageKey);
    
    if (!encryptedData) return null;

    try {
      const stored = JSON.parse(encryptedData);
      
      // Verify user owns this report
      if (stored.metadata.userId !== user.id) {
        throw new Error('Unauthorized access to report');
      }

      // Decrypt the report
      const decryptedReport = EncryptionService.decrypt({
        data: stored.data,
        iv: stored.iv,
        salt: stored.salt
      }, user.encryptionKey);

      // Create audit log entry
      await this.createAuditLog({
        userId: user.id,
        action: 'read',
        resourceType: 'report',
        resourceId: reportId
      });

      return decryptedReport;
    } catch (error) {
      console.error('Failed to decrypt report:', error);
      return null;
    }
  }

  static async getUserReports(): Promise<IncidentReport[]> {
    const user = AuthService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const reports: IncidentReport[] = [];
    const keys = Object.keys(localStorage);

    for (const key of keys) {
      if (key.startsWith(this.REPORT_PREFIX)) {
        try {
          const stored = JSON.parse(localStorage.getItem(key) || '{}');
          
          if (stored.metadata?.userId === user.id) {
            const decryptedReport = EncryptionService.decrypt({
              data: stored.data,
              iv: stored.iv,
              salt: stored.salt
            }, user.encryptionKey);
            
            reports.push(decryptedReport);
          }
        } catch (error) {
          console.error('Failed to decrypt report:', error);
        }
      }
    }

    // Sort by creation date (newest first)
    return reports.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  static async deleteReport(reportId: string): Promise<void> {
    const user = AuthService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const storageKey = this.REPORT_PREFIX + reportId;
    const encryptedData = localStorage.getItem(storageKey);
    
    if (!encryptedData) throw new Error('Report not found');

    const stored = JSON.parse(encryptedData);
    if (stored.metadata.userId !== user.id) {
      throw new Error('Unauthorized access to report');
    }

    // Create audit log entry before deletion
    await this.createAuditLog({
      userId: user.id,
      action: 'delete',
      resourceType: 'report',
      resourceId: reportId
    });

    // Remove the report
    localStorage.removeItem(storageKey);

    // Update analytics cache
    await this.rebuildAnalyticsCache();
  }

  static saveDraft(draft: Partial<IncidentReportDraft>): void {
    const user = AuthService.getCurrentUser();
    if (!user) return;

    const encryptedDraft = EncryptionService.encrypt(draft, user.encryptionKey);
    localStorage.setItem(this.DRAFT_PREFIX + user.id, JSON.stringify(encryptedDraft));
  }

  static loadDraft(): Partial<IncidentReportDraft> | null {
    const user = AuthService.getCurrentUser();
    if (!user) return null;

    const encryptedData = localStorage.getItem(this.DRAFT_PREFIX + user.id);
    if (!encryptedData) return null;

    try {
      const stored = JSON.parse(encryptedData);
      return EncryptionService.decrypt(stored, user.encryptionKey);
    } catch (error) {
      console.error('Failed to decrypt draft:', error);
      return null;
    }
  }

  static clearDraft(): void {
    const user = AuthService.getCurrentUser();
    if (!user) return;

    localStorage.removeItem(this.DRAFT_PREFIX + user.id);
  }

  static async getAnonymizedAnalytics(): Promise<any> {
    const user = AuthService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Create audit log for analytics access
    await this.createAuditLog({
      userId: user.id,
      action: 'read',
      resourceType: 'analytics',
      resourceId: 'aggregated'
    });

    const cached = localStorage.getItem(this.ANALYTICS_KEY);
    if (cached) {
      const data = JSON.parse(cached);
      
      // Apply differential privacy to protect individual reports
      if (data.byType) {
        data.byType = data.byType.map((item: any) => ({
          ...item,
          count: AnonymizationService.applyDifferentialPrivacy([item.count], 0.5)[0]
        }));
      }
      
      return data;
    }

    return this.rebuildAnalyticsCache();
  }

  private static async createAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp'>): Promise<string> {
    const auditId = this.generateAuditId();
    const auditEntry: AuditLog = {
      ...entry,
      id: auditId,
      timestamp: new Date().toISOString(),
      ipAddress: 'localhost', // In real app, get actual IP
      userAgent: navigator.userAgent
    };

    const storageKey = this.AUDIT_PREFIX + auditId;
    localStorage.setItem(storageKey, JSON.stringify(auditEntry));

    return auditId;
  }

  private static async updateAnalyticsCache(report: IncidentReport): Promise<void> {
    // Get current cache
    const cached = localStorage.getItem(this.ANALYTICS_KEY);
    let analytics = cached ? JSON.parse(cached) : {
      totalReports: 0,
      byType: [],
      overTime: [],
      byLocation: []
    };

    // Anonymize report for analytics
    const anonymizedReport = AnonymizationService.anonymizeReport(report);

    // Update totals
    analytics.totalReports += 1;

    // Update by type
    for (const type of report.incidentTypes) {
      const existing = analytics.byType.find((item: any) => item.type === type);
      if (existing) {
        existing.count += 1;
      } else {
        analytics.byType.push({
          type,
          label: type.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          count: 1
        });
      }
    }

    // Update over time
    const month = report.createdAt.substring(0, 7); // YYYY-MM
    const timeEntry = analytics.overTime.find((item: any) => item.month === month);
    if (timeEntry) {
      timeEntry.count += 1;
    } else {
      analytics.overTime.push({ month, count: 1 });
    }

    // Update by location (state level only for privacy)
    if (anonymizedReport.location?.state) {
      const location = `${anonymizedReport.location.state}, ${anonymizedReport.location.country}`;
      const locationEntry = analytics.byLocation.find((item: any) => item.location === location);
      if (locationEntry) {
        locationEntry.count += 1;
      } else {
        analytics.byLocation.push({ location, count: 1 });
      }
    }

    // Sort and limit results
    analytics.byType.sort((a: any, b: any) => b.count - a.count);
    analytics.overTime.sort((a: any, b: any) => a.month.localeCompare(b.month));
    analytics.byLocation.sort((a: any, b: any) => b.count - a.count).slice(0, 10);

    localStorage.setItem(this.ANALYTICS_KEY, JSON.stringify(analytics));
  }

  private static async rebuildAnalyticsCache(): Promise<any> {
    // Clear existing cache
    localStorage.removeItem(this.ANALYTICS_KEY);

    // Rebuild from all reports
    const reports = await this.getUserReports();
    for (const report of reports) {
      await this.updateAnalyticsCache(report);
    }

    return this.getAnonymizedAnalytics();
  }

  private static generateReportId(): string {
    return 'rpt_' + Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private static generateAuditId(): string {
    return 'aud_' + Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}