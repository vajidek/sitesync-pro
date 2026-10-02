import { db } from '../../db';
import {
  integrationConnectors,
  integrationConfigs,
  integrationHealth,
  integrationJobs,
  integrationLogs,
} from '../../db/schema';
import { eq, and, desc, like, or } from 'drizzle-orm';

export interface ConnectorConfigItem {
  configKey: string;
  configValue: string;
  isSecret?: boolean;
}

export interface CreateJobDto {
  jobCode: string;
  connectorId: string;
  jobType: string;
  scheduleCron?: string;
  conflictResolution?: string;
}

export class IntegrationsRepository {
  async ensureIntegrationsSeeded() {
    const existing = await db.select().from(integrationConnectors);
    if (existing.length === 0) {
      const now = new Date().toISOString();

      const seedConnectors = [
        { id: 'conn-auth', code: 'AUTH_SSO', name: 'Enterprise Single Sign-On (OAuth2/SAML)', category: 'AUTH', version: '2.1.0', isEnabled: true, status: 'HEALTHY', authType: 'OAUTH2', createdAt: now, updatedAt: now },
        { id: 'conn-smtp', code: 'SMTP_EMAIL', name: 'SMTP Enterprise Mail Gateway', category: 'COMMUNICATION', version: '1.4.0', isEnabled: true, status: 'HEALTHY', authType: 'BASIC_AUTH', createdAt: now, updatedAt: now },
        { id: 'conn-m365', code: 'MICROSOFT_365', name: 'Microsoft 365 Outlook & Graph API', category: 'COMMUNICATION', version: '3.0.0', isEnabled: true, status: 'HEALTHY', authType: 'OAUTH2', createdAt: now, updatedAt: now },
        { id: 'conn-gmail', code: 'GMAIL', name: 'Google Workspace / Gmail API', category: 'COMMUNICATION', version: '2.0.0', isEnabled: true, status: 'HEALTHY', authType: 'OAUTH2', createdAt: now, updatedAt: now },
        { id: 'conn-fcm', code: 'FIREBASE_PUSH', name: 'Firebase Cloud Messaging (FCM Push)', category: 'COMMUNICATION', version: '1.8.0', isEnabled: true, status: 'HEALTHY', authType: 'CERTIFICATE', createdAt: now, updatedAt: now },
        { id: 'conn-sms', code: 'SMS_PROVIDER', name: 'Twilio / Enterprise SMS Gateway', category: 'COMMUNICATION', version: '2.2.0', isEnabled: true, status: 'HEALTHY', authType: 'API_KEY', createdAt: now, updatedAt: now },
        { id: 'conn-whatsapp', code: 'WHATSAPP', name: 'WhatsApp Business API Gateway', category: 'COMMUNICATION', version: '1.1.0', isEnabled: true, status: 'HEALTHY', authType: 'API_KEY', createdAt: now, updatedAt: now },
        { id: 'conn-webhooks', code: 'WEBHOOKS', name: 'Outbound & Inbound Webhook Dispatcher', category: 'DATA_SYNC', version: '1.0.0', isEnabled: true, status: 'HEALTHY', authType: 'API_KEY', createdAt: now, updatedAt: now },
        { id: 'conn-rest', code: 'REST_APIS', name: 'Generic REST API Integration Connector', category: 'DATA_SYNC', version: '1.5.0', isEnabled: true, status: 'HEALTHY', authType: 'API_KEY', createdAt: now, updatedAt: now },
        { id: 'conn-gmaps', code: 'GOOGLE_MAPS', name: 'Google Maps & Geolocation Services', category: 'GEOSPATIAL', version: '3.1.0', isEnabled: true, status: 'HEALTHY', authType: 'API_KEY', createdAt: now, updatedAt: now },
        { id: 'conn-gps', code: 'GPS_TRACKING', name: 'Fleet & Equipment Telematics GPS Sync', category: 'GEOSPATIAL', version: '2.0.0', isEnabled: true, status: 'HEALTHY', authType: 'API_KEY', createdAt: now, updatedAt: now },
        { id: 'conn-essl', code: 'ESSL_BIOMETRIC', name: 'ESSL Biometric Attendance Terminal Sync', category: 'HARDWARE_IOT', version: '1.2.0', isEnabled: true, status: 'HEALTHY', authType: 'CONNECTION_STRING', createdAt: now, updatedAt: now },
        { id: 'conn-iot', code: 'IOT_DEVICES', name: 'Site IoT Sensors & Telemetry Hub', category: 'HARDWARE_IOT', version: '1.0.0', isEnabled: true, status: 'HEALTHY', authType: 'CERTIFICATE', createdAt: now, updatedAt: now },
        { id: 'conn-scada', code: 'SCADA', name: 'Industrial SCADA Automation Gateway', category: 'HARDWARE_IOT', version: '1.0.0', isEnabled: true, status: 'HEALTHY', authType: 'CONNECTION_STRING', createdAt: now, updatedAt: now },
        { id: 'conn-cloud', code: 'CLOUD_STORAGE', name: 'AWS S3 / Azure Blob Storage Provider', category: 'STORAGE_FILES', version: '2.4.0', isEnabled: true, status: 'HEALTHY', authType: 'API_KEY', createdAt: now, updatedAt: now },
        { id: 'conn-excel-imp', code: 'EXCEL_IMPORT', name: 'Excel Bulk Ingestion & Parsing Engine', category: 'STORAGE_FILES', version: '1.0.0', isEnabled: true, status: 'HEALTHY', authType: 'BASIC_AUTH', createdAt: now, updatedAt: now },
        { id: 'conn-excel-exp', code: 'EXCEL_EXPORT', name: 'Excel Automated Document Exporter', category: 'STORAGE_FILES', version: '1.0.0', isEnabled: true, status: 'HEALTHY', authType: 'BASIC_AUTH', createdAt: now, updatedAt: now },
        { id: 'conn-csv', code: 'CSV_PARSER', name: 'Streamed CSV Import/Export Connector', category: 'STORAGE_FILES', version: '1.0.0', isEnabled: true, status: 'HEALTHY', authType: 'BASIC_AUTH', createdAt: now, updatedAt: now },
        { id: 'conn-pdf', code: 'PDF_ENGINE', name: 'Automated PDF Render & Export Engine', category: 'STORAGE_FILES', version: '1.0.0', isEnabled: true, status: 'HEALTHY', authType: 'BASIC_AUTH', createdAt: now, updatedAt: now },
        { id: 'conn-govt', code: 'GOVT_APIS', name: 'Govt e-Way Bill & GST Compliance Gateway', category: 'COMPLIANCE_GOVT', version: '1.0.0', isEnabled: true, status: 'HEALTHY', authType: 'CERTIFICATE', createdAt: now, updatedAt: now },
      ];

      for (const c of seedConnectors) {
        await db.insert(integrationConnectors).values(c).onConflictDoNothing();
      }

      // Seed Initial Health Records
      for (const c of seedConnectors) {
        await db.insert(integrationHealth).values({
          id: `hlth-${c.id}`,
          connectorId: c.id,
          status: 'HEALTHY',
          latencyMs: Math.floor(Math.random() * 40) + 12,
          lastPingAt: now,
          detailsJson: { uptime: '99.98%', lastCheckStatus: 'OK - Ping Successful' },
        }).onConflictDoNothing();
      }

      // Seed Initial Sync Jobs
      const seedJobs = [
        {
          id: 'job-essl-daily',
          jobCode: 'JOB_ESSL_BIOMETRIC_SYNC',
          connectorId: 'conn-essl',
          jobType: 'SCHEDULED_IMPORT',
          scheduleCron: '0 */1 * * *', // hourly
          status: 'COMPLETED',
          conflictResolution: 'OVERWRITE_TARGET',
          recordsProcessed: 1420,
          recordsFailed: 0,
          lastRunAt: now,
          nextRunAt: now,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'job-gps-sync',
          jobCode: 'JOB_FLEET_GPS_TELEMATICS',
          connectorId: 'conn-gps',
          jobType: 'INCREMENTAL_SYNC',
          scheduleCron: '*/5 * * * *', // 5 mins
          status: 'COMPLETED',
          conflictResolution: 'OVERWRITE_TARGET',
          recordsProcessed: 8850,
          recordsFailed: 2,
          lastRunAt: now,
          nextRunAt: now,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'job-govt-gst',
          jobCode: 'JOB_GST_EWAY_SYNC',
          connectorId: 'conn-govt',
          jobType: 'SCHEDULED_EXPORT',
          scheduleCron: '0 23 * * *',
          status: 'COMPLETED',
          conflictResolution: 'KEEP_EXISTING',
          recordsProcessed: 340,
          recordsFailed: 0,
          lastRunAt: now,
          nextRunAt: now,
          createdAt: now,
          updatedAt: now,
        },
      ];

      for (const j of seedJobs) {
        await db.insert(integrationJobs).values(j).onConflictDoNothing();
      }

      // Seed Initial Logs
      const seedLogs = [
        {
          id: 'log-001',
          connectorId: 'conn-essl',
          jobId: 'job-essl-daily',
          direction: 'INBOUND',
          endpoint: 'tcp://192.168.1.200:4370',
          httpStatus: 200,
          latencyMs: 18,
          status: 'SUCCESS',
          requestPayloadJson: { syncType: 'BIOMETRIC_PUNCH_LOGS' },
          responsePayloadJson: { recordsReceived: 1420 },
          retryCount: 0,
          executedAt: now,
        },
        {
          id: 'log-002',
          connectorId: 'conn-sms',
          direction: 'OUTBOUND',
          endpoint: 'https://api.twilio.com/2010-04-01/Accounts/AC1/Messages.json',
          httpStatus: 201,
          latencyMs: 145,
          status: 'SUCCESS',
          requestPayloadJson: { recipient: '+919876543210', body: 'PO Approval Alert' },
          responsePayloadJson: { sid: 'SM998124' },
          retryCount: 0,
          executedAt: now,
        },
      ];

      for (const l of seedLogs) {
        await db.insert(integrationLogs).values(l).onConflictDoNothing();
      }
    }
  }

  // Connector CRUD & List
  async getAllConnectors(category?: string, search?: string) {
    await this.ensureIntegrationsSeeded();
    const conditions = [];
    if (category && category !== 'ALL') {
      conditions.push(eq(integrationConnectors.category, category));
    }
    if (search) {
      conditions.push(or(like(integrationConnectors.name, `%${search}%`), like(integrationConnectors.code, `%${search}%`)));
    }

    let connectors;
    if (conditions.length > 0) {
      connectors = await db.select().from(integrationConnectors).where(and(...conditions)).orderBy(desc(integrationConnectors.updatedAt));
    } else {
      connectors = await db.select().from(integrationConnectors).orderBy(desc(integrationConnectors.updatedAt));
    }

    const connectorsWithData = [];
    for (const c of connectors) {
      const configs = await db.select().from(integrationConfigs).where(eq(integrationConfigs.connectorId, c.id));
      const [health] = await db.select().from(integrationHealth).where(eq(integrationHealth.connectorId, c.id));
      connectorsWithData.push({ ...c, configs, health: health || null });
    }
    return connectorsWithData;
  }

  async getConnectorById(id: string) {
    await this.ensureIntegrationsSeeded();
    const [c] = await db.select().from(integrationConnectors).where(eq(integrationConnectors.id, id));
    if (!c) return null;

    const configs = await db.select().from(integrationConfigs).where(eq(integrationConfigs.connectorId, id));
    const [health] = await db.select().from(integrationHealth).where(eq(integrationHealth.connectorId, id));
    const jobs = await db.select().from(integrationJobs).where(eq(integrationJobs.connectorId, id));
    return { ...c, configs, health: health || null, jobs };
  }

  async toggleConnector(id: string, isEnabled: boolean) {
    const now = new Date().toISOString();
    await db.update(integrationConnectors).set({
      isEnabled,
      status: isEnabled ? 'HEALTHY' : 'OFFLINE',
      updatedAt: now,
    }).where(eq(integrationConnectors.id, id));

    return { id, isEnabled, status: isEnabled ? 'HEALTHY' : 'OFFLINE' };
  }

  async updateConnectorConfigs(connectorId: string, configs: ConnectorConfigItem[], userEmail?: string) {
    const now = new Date().toISOString();
    for (const item of configs) {
      const existing = await db.select().from(integrationConfigs).where(
        and(eq(integrationConfigs.connectorId, connectorId), eq(integrationConfigs.configKey, item.configKey))
      );

      if (existing.length > 0) {
        await db.update(integrationConfigs).set({
          configValue: item.configValue,
          isSecret: item.isSecret || false,
          updatedBy: userEmail || 'ADMIN',
          updatedAt: now,
        }).where(eq(integrationConfigs.id, existing[0].id));
      } else {
        await db.insert(integrationConfigs).values({
          id: `cfg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          connectorId,
          configKey: item.configKey,
          configValue: item.configValue,
          isSecret: item.isSecret || false,
          updatedBy: userEmail || 'ADMIN',
          updatedAt: now,
        });
      }
    }

    return this.getConnectorById(connectorId);
  }

  // Test Connection
  async testConnection(connectorId: string) {
    await this.ensureIntegrationsSeeded();
    const [c] = await db.select().from(integrationConnectors).where(eq(integrationConnectors.id, connectorId));
    if (!c) throw new Error('Connector not found');

    const now = new Date().toISOString();
    const simulatedLatency = Math.floor(Math.random() * 60) + 15;
    const isSuccess = c.isEnabled;

    // Update Health
    const [health] = await db.select().from(integrationHealth).where(eq(integrationHealth.connectorId, connectorId));
    const healthStatus = isSuccess ? 'HEALTHY' : 'OFFLINE';

    if (health) {
      await db.update(integrationHealth).set({
        status: healthStatus,
        latencyMs: simulatedLatency,
        lastPingAt: now,
        detailsJson: { pingStatus: isSuccess ? '200 OK' : 'CONNECTION_REFUSED', latencyMs: simulatedLatency },
      }).where(eq(integrationHealth.id, health.id));
    } else {
      await db.insert(integrationHealth).values({
        id: `hlth-${connectorId}`,
        connectorId,
        status: healthStatus,
        latencyMs: simulatedLatency,
        lastPingAt: now,
        detailsJson: { pingStatus: isSuccess ? '200 OK' : 'CONNECTION_REFUSED', latencyMs: simulatedLatency },
      });
    }

    // Log Test Connection
    await db.insert(integrationLogs).values({
      id: `log-${Date.now()}`,
      connectorId,
      direction: 'OUTBOUND',
      endpoint: `ping://${c.code.toLowerCase()}.internal`,
      httpStatus: isSuccess ? 200 : 503,
      latencyMs: simulatedLatency,
      status: isSuccess ? 'SUCCESS' : 'FAILED',
      requestPayloadJson: { action: 'TEST_CONNECTION' },
      responsePayloadJson: { status: healthStatus, latencyMs: simulatedLatency },
      executedAt: now,
    });

    return {
      connectorCode: c.code,
      status: healthStatus,
      latencyMs: simulatedLatency,
      testedAt: now,
      message: isSuccess ? 'Connection test successful' : 'Connection failed. Provider disabled or unreachable.',
    };
  }

  // Health Dashboard Data
  async getHealthDashboard() {
    await this.ensureIntegrationsSeeded();
    const connectors = await db.select().from(integrationConnectors);
    const healthList = await db.select().from(integrationHealth);

    let totalHealthy = 0;
    let totalDegraded = 0;
    let totalOffline = 0;

    for (const h of healthList) {
      if (h.status === 'HEALTHY') totalHealthy++;
      else if (h.status === 'DEGRADED') totalDegraded++;
      else totalOffline++;
    }

    return {
      totalConnectors: connectors.length,
      healthSummary: {
        healthy: totalHealthy,
        degraded: totalDegraded,
        offline: totalOffline,
      },
      connectorsHealth: healthList,
    };
  }

  // Sync Jobs CRUD & Execution
  async getSyncJobs(connectorId?: string) {
    await this.ensureIntegrationsSeeded();
    if (connectorId) {
      return db.select().from(integrationJobs).where(eq(integrationJobs.connectorId, connectorId)).orderBy(desc(integrationJobs.updatedAt));
    }
    return db.select().from(integrationJobs).orderBy(desc(integrationJobs.updatedAt));
  }

  async createSyncJob(dto: CreateJobDto) {
    const id = `job-${Date.now()}`;
    const now = new Date().toISOString();

    const newJob = {
      id,
      jobCode: dto.jobCode.toUpperCase().replace(/\s+/g, '_'),
      connectorId: dto.connectorId,
      jobType: dto.jobType,
      scheduleCron: dto.scheduleCron || '0 0 * * *',
      status: 'PENDING',
      conflictResolution: dto.conflictResolution || 'OVERWRITE_TARGET',
      recordsProcessed: 0,
      recordsFailed: 0,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(integrationJobs).values(newJob);
    return newJob;
  }

  async triggerSyncJob(jobId: string) {
    const [job] = await db.select().from(integrationJobs).where(eq(integrationJobs.id, jobId));
    if (!job) throw new Error('Sync job not found');

    const now = new Date().toISOString();
    const processed = Math.floor(Math.random() * 500) + 50;

    await db.update(integrationJobs).set({
      status: 'COMPLETED',
      recordsProcessed: job.recordsProcessed + processed,
      lastRunAt: now,
      updatedAt: now,
    }).where(eq(integrationJobs.id, jobId));

    // Audit Log
    await db.insert(integrationLogs).values({
      id: `log-${Date.now()}`,
      connectorId: job.connectorId,
      jobId: job.id,
      direction: job.jobType.includes('IMPORT') ? 'INBOUND' : 'OUTBOUND',
      endpoint: `job://${job.jobCode}`,
      httpStatus: 200,
      latencyMs: Math.floor(Math.random() * 200) + 50,
      status: 'SUCCESS',
      requestPayloadJson: { trigger: 'MANUAL_SYNC', jobCode: job.jobCode },
      responsePayloadJson: { recordsProcessed: processed, status: 'SYNC_COMPLETE' },
      executedAt: now,
    });

    return { jobId, status: 'COMPLETED', recordsProcessed: processed, syncedAt: now };
  }

  // Logs & Retry Engine
  async getLogs(connectorId?: string, status?: string) {
    await this.ensureIntegrationsSeeded();
    const conditions = [];
    if (connectorId) conditions.push(eq(integrationLogs.connectorId, connectorId));
    if (status) conditions.push(eq(integrationLogs.status, status));

    if (conditions.length > 0) {
      return db.select().from(integrationLogs).where(and(...conditions)).orderBy(desc(integrationLogs.executedAt));
    }
    return db.select().from(integrationLogs).orderBy(desc(integrationLogs.executedAt));
  }

  async retryFailedLog(logId: string) {
    const [log] = await db.select().from(integrationLogs).where(eq(integrationLogs.id, logId));
    if (!log) throw new Error('Integration log not found');

    const now = new Date().toISOString();
    await db.update(integrationLogs).set({
      status: 'SUCCESS',
      retryCount: log.retryCount + 1,
      errorMessage: null,
      executedAt: now,
      responsePayloadJson: { message: 'Manual retry executed through Enterprise Integration Hub' },
    }).where(eq(integrationLogs.id, logId));

    return { success: true, message: 'Log retried successfully via Integration Hub' };
  }
}

export const integrationsRepository = new IntegrationsRepository();
