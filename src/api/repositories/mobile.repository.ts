import { db } from '../../db/index';
import { sql, eq, desc, and } from 'drizzle-orm';
import {
  phase68MobileDevices,
  phase68DeviceRegistrations,
  phase68SyncQueue,
  phase68SyncHistory,
  phase68OfflineTransactions,
  phase68GpsTracks,
  phase68Geofences,
  phase68GeofenceEvents,
  phase68LiveLocations,
  phase68FieldVisits,
  phase68SiteCheckins,
  phase68SiteCheckouts,
  phase68MobilePhotos,
  phase68MobileDocuments,
  phase68MobileForms,
  phase68MobileSignatures,
  phase68MobileNotifications,
  phase68PushTokens,
  phase68MapLayers,
  phase68MapMarkers,
  phase68LocationHistory,
  phase68MobileActivityLogs,
} from '../../db/schema';
import { v4 as uuidv4 } from 'uuid';

export class MobileRepository {
  private static isTablesEnsured = false;

  public async ensureMobileTablesExist(): Promise<void> {
    if (MobileRepository.isTablesEnsured) return;

    try {
      await this.seedInitialMobileData();
      MobileRepository.isTablesEnsured = true;
    } catch (error) {
      console.warn('Phase 68 initialization error:', error);
      MobileRepository.isTablesEnsured = true;
    }
  }

  private async seedInitialMobileData(): Promise<void> {
    const now = new Date().toISOString();
    try {
      const existing = await db.select().from(phase68MobileDevices).limit(1);
      if (existing.length > 0) return;

      const dev1Id = 'dev-s24-field-01';
      const dev2Id = 'dev-ipad-field-02';
      const dev3Id = 'dev-pixel-field-03';

      await db.insert(phase68MobileDevices).values([
        {
          id: dev1Id,
          deviceId: 'IMEI-867204910291041',
          deviceModel: 'Samsung Galaxy S24 Ultra Enterprise Rugged',
          osPlatform: 'ANDROID',
          osVersion: 'Android 14 (OneUI 6.1)',
          appVersion: 'v3.8.4-build.104',
          assignedUserId: 'USR-ENG-001',
          assignedUserName: 'Eng. Farooq Al-Hashimi (Lead Resident Engineer)',
          userRole: 'INCHARGE',
          projectId: 'PRJ-WATER-001',
          projectName: 'Metropolitan Water Pipeline Network Expansion Phase-4',
          batteryLevel: 88,
          isOnline: true,
          lastSyncAt: now,
          deviceStatus: 'ACTIVE',
          storageAvailableMb: 24500,
          offlinePendingCount: 0,
          createdAt: now,
          updatedAt: now,
          createdBy: 'System Seed',
          updatedBy: 'System Seed',
        },
        {
          id: dev2Id,
          deviceId: 'SER-DMQXG8294N1',
          deviceModel: 'Apple iPad Pro 12.9 M2 Field Surveyor Edition',
          osPlatform: 'IPAD_OS',
          osVersion: 'iPadOS 17.5',
          appVersion: 'v3.8.4-build.104',
          assignedUserId: 'USR-QAQC-004',
          assignedUserName: 'Sarah Jenkins (Senior QA/QC Auditor)',
          userRole: 'SUPERVISOR',
          projectId: 'PRJ-WATER-001',
          projectName: 'Metropolitan Water Pipeline Network Expansion Phase-4',
          batteryLevel: 94,
          isOnline: true,
          lastSyncAt: now,
          deviceStatus: 'ACTIVE',
          storageAvailableMb: 112000,
          offlinePendingCount: 2,
          createdAt: now,
          updatedAt: now,
          createdBy: 'System Seed',
          updatedBy: 'System Seed',
        },
        {
          id: dev3Id,
          deviceId: 'IMEI-358920194820194',
          deviceModel: 'Google Pixel 8 Pro Field Inspector',
          osPlatform: 'ANDROID',
          osVersion: 'Android 14',
          appVersion: 'v3.8.4-build.104',
          assignedUserId: 'USR-HSE-008',
          assignedUserName: 'Tariq Mansoor (HSE Officer)',
          userRole: 'SUPERVISOR',
          projectId: 'PRJ-WATER-001',
          projectName: 'Metropolitan Water Pipeline Network Expansion Phase-4',
          batteryLevel: 67,
          isOnline: true,
          lastSyncAt: now,
          deviceStatus: 'ACTIVE',
          storageAvailableMb: 48000,
          offlinePendingCount: 0,
          createdAt: now,
          updatedAt: now,
          createdBy: 'System Seed',
          updatedBy: 'System Seed',
        },
      ]);

      // Seed Geofences
      const geoSiteId = 'geo-wtp-main-01';
      const geoPipeZone = 'geo-pipe-corridor-02';
      const geoReservoir = 'geo-reservoir-jebel-03';

      await db.insert(phase68Geofences).values([
        {
          id: geoSiteId,
          geofenceCode: 'GEO-WTP-01',
          name: 'Main Water Treatment Plant (WTP-100 MLD) Perimeter',
          projectId: 'PRJ-WATER-001',
          projectName: 'Metropolitan Water Pipeline Network Expansion Phase-4',
          fenceType: 'POLYGON',
          centerLat: 25.1972,
          centerLng: 55.2744,
          radiusMeters: 450,
          polygonCoordinates: JSON.stringify([
            { lat: 25.199, lng: 55.272 },
            { lat: 25.199, lng: 55.277 },
            { lat: 25.195, lng: 55.277 },
            { lat: 25.195, lng: 55.272 },
          ]),
          category: 'WTP_PREMISES',
          autoCheckinEnabled: true,
          alertOnExit: true,
          status: 'ACTIVE',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: geoPipeZone,
          geofenceCode: 'GEO-PIPE-ZONE-A',
          name: '1200mm Carbon Steel Transmission Pipeline Trench Ch: 0+000 to 12+500',
          projectId: 'PRJ-WATER-001',
          projectName: 'Metropolitan Water Pipeline Network Expansion Phase-4',
          fenceType: 'CORRIDOR_BUFFER',
          centerLat: 25.2048,
          centerLng: 55.2891,
          radiusMeters: 300,
          category: 'PIPELINE_ZONE',
          autoCheckinEnabled: true,
          alertOnExit: false,
          status: 'ACTIVE',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: geoReservoir,
          geofenceCode: 'GEO-RES-JEBEL-01',
          name: 'Terminal Elevated Reservoir & Booster Pump Station (35ML)',
          projectId: 'PRJ-WATER-001',
          projectName: 'Metropolitan Water Pipeline Network Expansion Phase-4',
          fenceType: 'CIRCLE',
          centerLat: 25.1834,
          centerLng: 55.2612,
          radiusMeters: 350,
          category: 'PROJECT_SITE',
          autoCheckinEnabled: true,
          alertOnExit: true,
          status: 'ACTIVE',
          createdAt: now,
          updatedAt: now,
        },
      ]);

      // Seed Map Layers
      const layerPipelineId = 'layer-pipe-align';
      const layerAssetsId = 'layer-water-assets';
      const layerGeofenceId = 'layer-geofence-ovl';

      await db.insert(phase68MapLayers).values([
        {
          id: layerPipelineId,
          layerCode: 'LYR-PIPE-ALIGN-1200',
          layerName: '1200mm DI & CS Pipeline Main Alignment & Corridors',
          category: 'PIPELINE_ALIGNMENT',
          layerType: 'VECTOR_GEOJSON',
          layerColor: '#06b6d4',
          opacity: 0.9,
          isVisibleDefault: true,
          zIndex: 20,
          projectId: 'PRJ-WATER-001',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: layerAssetsId,
          layerCode: 'LYR-WATER-INFRA',
          layerName: 'Valves, Flow Meters, Air Valves & Scour Chambers',
          category: 'WATER_UTILITIES',
          layerType: 'VECTOR_GEOJSON',
          layerColor: '#3b82f6',
          opacity: 0.95,
          isVisibleDefault: true,
          zIndex: 30,
          projectId: 'PRJ-WATER-001',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: layerGeofenceId,
          layerCode: 'LYR-GEOFENCE-ZONES',
          layerName: 'Security Geofence & Check-In Boundaries',
          category: 'GEOFENCE_OVERLAY',
          layerType: 'VECTOR_GEOJSON',
          layerColor: '#10b981',
          opacity: 0.6,
          isVisibleDefault: true,
          zIndex: 10,
          projectId: 'PRJ-WATER-001',
          createdAt: now,
          updatedAt: now,
        },
      ]);

      // Seed Map Markers (GIS Water Infrastructure)
      await db.insert(phase68MapMarkers).values([
        {
          id: uuidv4(),
          markerCode: 'GIS-VALVE-014',
          name: 'Sectional Butterfly Valve Chamber SV-14 (DN1200 PN25)',
          layerId: layerAssetsId,
          projectId: 'PRJ-WATER-001',
          markerType: 'PIPELINE_VALVE',
          latitude: 25.2012,
          longitude: 55.2815,
          elevationMeters: 38.4,
          attributesJson: JSON.stringify({ diameterMm: 1200, pressureRating: 'PN25', flowM3h: 3850, actuator: 'Rotork Electric' }),
          status: 'OPERATIONAL',
          iconType: 'valve',
          colorHex: '#06b6d4',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: uuidv4(),
          markerCode: 'GIS-PUMP-MAIN',
          name: 'Primary Booster Pumping Station PS-01 (4x 850kW Multistage Pumps)',
          layerId: layerAssetsId,
          projectId: 'PRJ-WATER-001',
          markerType: 'PUMP_HOUSE',
          latitude: 25.1978,
          longitude: 55.2755,
          elevationMeters: 42.1,
          attributesJson: JSON.stringify({ pumpCount: 4, headMeters: 140, powerKw: 3400, dischargeBar: 16.5 }),
          status: 'OPERATIONAL',
          iconType: 'pump',
          colorHex: '#3b82f6',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: uuidv4(),
          markerCode: 'GIS-RES-TERM',
          name: 'Jebel Ali Master Reservoir (35 Million Gallons Capacity)',
          layerId: layerAssetsId,
          projectId: 'PRJ-WATER-001',
          markerType: 'WATER_RESERVOIR',
          latitude: 25.184,
          longitude: 55.2618,
          elevationMeters: 85.0,
          attributesJson: JSON.stringify({ capacityMl: 132.5, currentLevelPercent: 86.4, waterQualityTdsPpm: 120 }),
          status: 'OPERATIONAL',
          iconType: 'reservoir',
          colorHex: '#6366f1',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: uuidv4(),
          markerCode: 'GIS-WTP-100',
          name: 'Central Water Treatment Plant (UF + Reverse Osmosis)',
          layerId: layerAssetsId,
          projectId: 'PRJ-WATER-001',
          markerType: 'WTP_PLANT',
          latitude: 25.1965,
          longitude: 55.273,
          elevationMeters: 32.0,
          attributesJson: JSON.stringify({ capacityMld: 100, recoveryRatePercent: 82.5, turbidityNtu: 0.12 }),
          status: 'OPERATIONAL',
          iconType: 'wtp',
          colorHex: '#10b981',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: uuidv4(),
          markerCode: 'GIS-FLOW-EM-02',
          name: 'Electromagnetic Flow Meter Pit FM-02 (Telemetry Connected)',
          layerId: layerAssetsId,
          projectId: 'PRJ-WATER-001',
          markerType: 'FLOW_METER',
          latitude: 25.2075,
          longitude: 55.293,
          elevationMeters: 40.2,
          attributesJson: JSON.stringify({ flowRateLps: 980, totalizedM3: 4920400, batteryHealth: 99 }),
          status: 'OPERATIONAL',
          iconType: 'gauge',
          colorHex: '#f59e0b',
          createdAt: now,
          updatedAt: now,
        },
      ]);

      // Seed Live Locations (Engineers, Heavy Equipment, Tankers)
      await db.insert(phase68LiveLocations).values([
        {
          id: uuidv4(),
          entityType: 'PERSONNEL',
          entityId: 'USR-ENG-001',
          entityName: 'Eng. Farooq Al-Hashimi',
          roleOrType: 'Lead Resident Engineer',
          projectId: 'PRJ-WATER-001',
          projectName: 'Metropolitan Water Pipeline Network Expansion Phase-4',
          latitude: 25.2015,
          longitude: 55.2818,
          altitude: 39,
          speed: 3.2,
          heading: 85,
          battery: 88,
          isOnline: true,
          currentGeofence: 'GEO-PIPE-ZONE-A',
          lastActiveAt: now,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: uuidv4(),
          entityType: 'HEAVY_EQUIPMENT',
          entityId: 'EQ-CAT-349D',
          entityName: 'CAT 349D Heavy Hydraulic Excavator #04',
          roleOrType: 'Heavy Pipeline Trenching Rig',
          projectId: 'PRJ-WATER-001',
          projectName: 'Metropolitan Water Pipeline Network Expansion Phase-4',
          latitude: 25.2038,
          longitude: 55.2862,
          altitude: 41,
          speed: 0.0,
          heading: 270,
          battery: 100,
          isOnline: true,
          currentGeofence: 'GEO-PIPE-ZONE-A',
          lastActiveAt: now,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: uuidv4(),
          entityType: 'VEHICLE',
          entityId: 'VEH-WT-18000',
          entityName: 'Hydrostatic Pressure Test Tanker TT-12',
          roleOrType: 'Hydrotest Water Supply Unit (18,000L)',
          projectId: 'PRJ-WATER-001',
          projectName: 'Metropolitan Water Pipeline Network Expansion Phase-4',
          latitude: 25.1982,
          longitude: 55.276,
          altitude: 35,
          speed: 34.5,
          heading: 140,
          battery: 96,
          isOnline: true,
          currentGeofence: 'GEO-WTP-01',
          lastActiveAt: now,
          createdAt: now,
          updatedAt: now,
        },
      ]);

      // Seed Field Visits
      await db.insert(phase68FieldVisits).values([
        {
          id: uuidv4(),
          visitCode: 'VST-2026-0814',
          userId: 'USR-ENG-001',
          userName: 'Eng. Farooq Al-Hashimi',
          projectId: 'PRJ-WATER-001',
          projectName: 'Metropolitan Water Pipeline Network Expansion Phase-4',
          siteLocation: 'Ch: 04+200 Valve Pit SV-14',
          purpose: 'QAQC_INSPECTION',
          scheduledStartTime: '08:00 AM',
          scheduledEndTime: '11:30 AM',
          actualStartTime: '08:15 AM',
          actualEndTime: '11:20 AM',
          status: 'COMPLETED',
          summaryNotes: 'Hydrostatic pressure hold test witnessed at 25 bar for 4 hours. No pressure drop detected.',
          findingsCount: 0,
          latitude: 25.2012,
          longitude: 55.2815,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: uuidv4(),
          visitCode: 'VST-2026-0815',
          userId: 'USR-HSE-008',
          userName: 'Tariq Mansoor (HSE Officer)',
          projectId: 'PRJ-WATER-001',
          projectName: 'Metropolitan Water Pipeline Network Expansion Phase-4',
          siteLocation: 'Trench Section Zone B Ch: 08+000',
          purpose: 'SAFETY_AUDIT',
          scheduledStartTime: '01:00 PM',
          scheduledEndTime: '04:00 PM',
          actualStartTime: '01:10 PM',
          status: 'IN_PROGRESS',
          summaryNotes: 'Deep trench shoring and edge protection audit along active urban highway crossing.',
          findingsCount: 1,
          latitude: 25.2048,
          longitude: 55.2891,
          createdAt: now,
          updatedAt: now,
        },
      ]);

      // Seed Site Checkin
      const chk1Id = uuidv4();
      await db.insert(phase68SiteCheckins).values([
        {
          id: chk1Id,
          userId: 'USR-ENG-001',
          userName: 'Eng. Farooq Al-Hashimi',
          projectId: 'PRJ-WATER-001',
          projectName: 'Metropolitan Water Pipeline Network Expansion Phase-4',
          geofenceId: geoSiteId,
          siteName: 'WTP Main Plant Site & Booster PS-01',
          checkinTime: '2026-08-14T07:45:00.000Z',
          latitude: 25.1972,
          longitude: 55.2744,
          accuracyMeters: 3.5,
          selfiePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          isBiometricVerified: true,
          isOfflineCheckin: false,
          status: 'ACTIVE',
          createdAt: now,
          updatedAt: now,
        },
      ]);

      // Seed Mobile Photos
      await db.insert(phase68MobilePhotos).values([
        {
          id: uuidv4(),
          photoCode: 'PHT-2026-001',
          userId: 'USR-ENG-001',
          userName: 'Eng. Farooq Al-Hashimi',
          projectId: 'PRJ-WATER-001',
          category: 'PROGRESS',
          title: 'DN1200 Butt-Fusion Welded CS Pipe Lowering into Trench',
          photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800',
          thumbnailUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=200',
          fileSizeKb: 2450,
          latitude: 25.2024,
          longitude: 55.2831,
          altitude: 38.5,
          azimuthHeading: 112,
          capturedAt: now,
          isWatermarked: true,
          watermarkMetadata: JSON.stringify({ time: now, lat: 25.2024, lng: 55.2831, inspector: 'Eng. Farooq Al-Hashimi', chainage: 'Ch: 03+850' }),
          createdAt: now,
          updatedAt: now,
        },
        {
          id: uuidv4(),
          photoCode: 'PHT-2026-002',
          userId: 'USR-QAQC-004',
          userName: 'Sarah Jenkins',
          projectId: 'PRJ-WATER-001',
          category: 'QAQC_DEFECT',
          title: 'External 3-Layer Polyethylene (3LPE) Coating Holiday Test Spark Point',
          photoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800',
          thumbnailUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200',
          fileSizeKb: 1820,
          latitude: 25.205,
          longitude: 55.2885,
          altitude: 40.1,
          azimuthHeading: 245,
          capturedAt: now,
          isWatermarked: true,
          watermarkMetadata: JSON.stringify({ time: now, lat: 25.205, lng: 55.2885, defectCode: 'DEF-COAT-09', voltageKv: 25 }),
          createdAt: now,
          updatedAt: now,
        },
      ]);

      // Seed Mobile Documents
      await db.insert(phase68MobileDocuments).values([
        {
          id: uuidv4(),
          documentCode: 'DOC-DWG-1200-ALIGN',
          title: 'IFC Approved Alignment Drawing - Sector 4 Transmission Main (Rev D)',
          projectId: 'PRJ-WATER-001',
          category: 'TECHNICAL_DRAWING',
          fileUrl: 'https://assets.example.com/drawings/IFC-DN1200-SECT4-REVD.pdf',
          fileSizeKb: 8400,
          cachedForOffline: true,
          versionNumber: 'v4.2',
          downloadCount: 42,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: uuidv4(),
          documentCode: 'DOC-ITP-HYDRO-P25',
          title: 'Inspection & Test Plan (ITP) - Hydrostatic Pressure Testing SOP',
          projectId: 'PRJ-WATER-001',
          category: 'ITP_CHECKLIST',
          fileUrl: 'https://assets.example.com/itp/ITP-HYDROSTATIC-PN25.pdf',
          fileSizeKb: 2150,
          cachedForOffline: true,
          versionNumber: 'v2.0',
          downloadCount: 88,
          createdAt: now,
          updatedAt: now,
        },
      ]);

      // Seed Mobile Forms
      await db.insert(phase68MobileForms).values([
        {
          id: uuidv4(),
          formCode: 'FRM-DFR-20260814',
          formTitle: 'Daily Field Progress & Trench Backfilling Report (DFR)',
          templateCode: 'DFR_TEMPLATE',
          projectId: 'PRJ-WATER-001',
          submittedBy: 'USR-ENG-001',
          submittedByName: 'Eng. Farooq Al-Hashimi',
          formDataJson: JSON.stringify({
            trenchExcavatedMeters: 140,
            pipeLaidMeters: 120,
            beddingCompactedMeters: 120,
            laborCount: 48,
            equipmentActive: ['2x Excavator', '1x Crane 50T', '3x Tipper'],
            weatherCondition: 'Clear 38°C',
            safetyIncidents: 0,
          }),
          status: 'APPROVED',
          latitude: 25.2015,
          longitude: 55.2818,
          isOfflineSubmitted: false,
          submittedAt: now,
          createdAt: now,
          updatedAt: now,
        },
      ]);

      // Seed Mobile Signatures
      await db.insert(phase68MobileSignatures).values([
        {
          id: uuidv4(),
          signatureCode: 'SIG-HYDRO-PASS-01',
          entityType: 'FORM_SUBMISSION',
          entityId: 'FRM-DFR-20260814',
          signerName: 'Eng. Sultan Al-Nuaimi (Client Lead DEWA)',
          signerRole: 'Client Representative / Lead Inspector',
          signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M 10 40 Q 60 10 110 35 T 190 20" stroke="%2306b6d4" stroke-width="3" fill="none"/></svg>',
          signedAt: now,
          ipAddress: '192.168.1.104',
          latitude: 25.2012,
          longitude: 55.2815,
          isVerified: true,
          createdAt: now,
          updatedAt: now,
        },
      ]);

      // Seed Mobile Notifications
      await db.insert(phase68MobileNotifications).values([
        {
          id: uuidv4(),
          recipientUserId: 'USR-ENG-001',
          title: 'Geofence Auto-Detected: WTP-100 Perimeter',
          body: 'You have entered Main Water Treatment Plant zone. Shift check-in has been logged automatically.',
          category: 'GEOFENCE',
          priority: 'NORMAL',
          actionUrl: '/mobile/checkin',
          isDelivered: true,
          isRead: false,
          sentAt: now,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: uuidv4(),
          recipientUserId: 'USR-ENG-001',
          title: 'Hydrostatic Hold Pressure Clearance Required',
          body: 'Valve Chamber SV-14 test duration is 95% complete. Please capture final digital signature with Client PM.',
          category: 'APPROVAL',
          priority: 'HIGH',
          actionUrl: '/mobile/forms',
          isDelivered: true,
          isRead: false,
          sentAt: now,
          createdAt: now,
          updatedAt: now,
        },
      ]);
    } catch (err) {
      console.warn('Phase 68 seeding note:', err);
    }
  }

  // --- Mobile Devices ---
  public async getDevices(): Promise<any[]> {
    await this.ensureMobileTablesExist();
    return db.select().from(phase68MobileDevices).where(eq(phase68MobileDevices.isDeleted, false)).orderBy(desc(phase68MobileDevices.createdAt));
  }

  public async registerDevice(data: any, createdBy: string = 'System Admin'): Promise<any> {
    await this.ensureMobileTablesExist();
    const now = new Date().toISOString();
    const id = uuidv4();
    const newDevice = {
      id,
      deviceId: data.deviceId,
      deviceModel: data.deviceModel,
      osPlatform: data.osPlatform || 'ANDROID',
      osVersion: data.osVersion || '14.0',
      appVersion: data.appVersion || 'v3.8.4-prod',
      assignedUserId: data.assignedUserId || 'USR-FIELD-01',
      assignedUserName: data.assignedUserName || 'Field Resident Engineer',
      userRole: data.userRole || 'SUPERVISOR',
      projectId: data.projectId || 'PRJ-WATER-001',
      projectName: data.projectName || 'Metropolitan Water Pipeline Network Expansion Phase-4',
      batteryLevel: data.batteryLevel ?? 100,
      isOnline: true,
      lastSyncAt: now,
      deviceStatus: 'ACTIVE',
      storageAvailableMb: data.storageAvailableMb ?? 16384,
      offlinePendingCount: 0,
      createdAt: now,
      updatedAt: now,
      createdBy,
      updatedBy: createdBy,
      isDeleted: false,
    };
    await db.insert(phase68MobileDevices).values(newDevice);
    return newDevice;
  }

  public async updateDevice(id: string, updates: any): Promise<any> {
    await this.ensureMobileTablesExist();
    const now = new Date().toISOString();
    await db.update(phase68MobileDevices)
      .set({ ...updates, updatedAt: now })
      .where(eq(phase68MobileDevices.id, id));
    const res = await db.select().from(phase68MobileDevices).where(eq(phase68MobileDevices.id, id)).limit(1);
    return res[0];
  }

  // --- Sync Engine & Queue ---
  public async processSyncBatch(data: any): Promise<any> {
    await this.ensureMobileTablesExist();
    const now = new Date().toISOString();
    const items = data.items || [];
    let pushedCount = 0;
    let conflicts = 0;

    for (const item of items) {
      const qId = uuidv4();
      await db.insert(phase68SyncQueue).values({
        id: qId,
        deviceId: data.deviceId,
        entityType: item.entityType,
        entityId: item.entityId || uuidv4(),
        action: item.action || 'CREATE',
        payload: typeof item.payload === 'string' ? item.payload : JSON.stringify(item.payload),
        status: 'COMPLETED',
        retryCount: 0,
        clientTimestamp: item.clientTimestamp || now,
        syncedAt: now,
        conflictResolution: 'SERVER_WINS',
        createdAt: now,
        updatedAt: now,
        createdBy: data.userId || 'Mobile User',
        updatedBy: data.userId || 'Mobile User',
      });
      pushedCount++;
    }

    const historyId = uuidv4();
    const historyEntry = {
      id: historyId,
      deviceId: data.deviceId,
      userId: data.userId,
      syncType: 'BIDIRECTIONAL',
      recordsPushed: pushedCount,
      recordsPulled: 15,
      conflictsDetected: conflicts,
      durationMs: 240,
      status: 'SUCCESS',
      networkType: data.networkType || '4G_LTE',
      startedAt: now,
      completedAt: new Date().toISOString(),
      createdAt: now,
      updatedAt: now,
      createdBy: data.userId || 'Mobile User',
      updatedBy: data.userId || 'Mobile User',
    };
    await db.insert(phase68SyncHistory).values(historyEntry);

    return {
      success: true,
      syncId: historyId,
      recordsPushed: pushedCount,
      recordsPulled: 15,
      serverTimestamp: now,
      status: 'SYNCED_OK',
    };
  }

  public async getSyncHistory(deviceId?: string): Promise<any[]> {
    await this.ensureMobileTablesExist();
    if (deviceId) {
      return db.select().from(phase68SyncHistory).where(eq(phase68SyncHistory.deviceId, deviceId)).orderBy(desc(phase68SyncHistory.createdAt)).limit(50);
    }
    return db.select().from(phase68SyncHistory).orderBy(desc(phase68SyncHistory.createdAt)).limit(50);
  }

  // --- GPS Tracking & Live Locations ---
  public async recordLocation(data: any): Promise<any> {
    await this.ensureMobileTablesExist();
    const now = new Date().toISOString();
    const trackId = uuidv4();
    await db.insert(phase68GpsTracks).values({
      id: trackId,
      deviceId: data.deviceId || 'DEV-MOBILE',
      userId: data.userId || 'USR-01',
      userName: data.userName || 'Field Staff',
      projectId: data.projectId || 'PRJ-WATER-001',
      latitude: data.latitude,
      longitude: data.longitude,
      altitudeMeters: data.altitudeMeters || 0,
      accuracyMeters: data.accuracyMeters || 5,
      speedKmph: data.speedKmph || 0,
      headingDegrees: data.headingDegrees || 0,
      batteryPercent: data.batteryPercent ?? 100,
      recordedAt: now,
      isGeofenceInside: true,
      createdAt: now,
      updatedAt: now,
    });

    // Also update or insert in phase68LiveLocations
    const existing = await db.select().from(phase68LiveLocations).where(eq(phase68LiveLocations.entityId, data.userId || data.deviceId)).limit(1);
    if (existing.length > 0) {
      await db.update(phase68LiveLocations).set({
        latitude: data.latitude,
        longitude: data.longitude,
        speed: data.speedKmph || 0,
        heading: data.headingDegrees || 0,
        battery: data.batteryPercent ?? 100,
        lastActiveAt: now,
        updatedAt: now,
      }).where(eq(phase68LiveLocations.id, existing[0].id));
    } else {
      await db.insert(phase68LiveLocations).values({
        id: uuidv4(),
        entityType: data.entityType || 'PERSONNEL',
        entityId: data.userId || data.deviceId || uuidv4(),
        entityName: data.userName || 'Field Engineer',
        roleOrType: data.roleOrType || 'Engineer',
        projectId: data.projectId || 'PRJ-WATER-001',
        projectName: 'Metropolitan Water Pipeline Network Expansion Phase-4',
        latitude: data.latitude,
        longitude: data.longitude,
        altitude: data.altitudeMeters || 0,
        speed: data.speedKmph || 0,
        heading: data.headingDegrees || 0,
        battery: data.batteryPercent ?? 100,
        isOnline: true,
        lastActiveAt: now,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { success: true, trackId, timestamp: now };
  }

  public async getLiveLocations(): Promise<any[]> {
    await this.ensureMobileTablesExist();
    return db.select().from(phase68LiveLocations).where(eq(phase68LiveLocations.isDeleted, false));
  }

  // --- Geofences & Events ---
  public async getGeofences(): Promise<any[]> {
    await this.ensureMobileTablesExist();
    return db.select().from(phase68Geofences).where(eq(phase68Geofences.isDeleted, false)).orderBy(desc(phase68Geofences.createdAt));
  }

  public async createGeofence(data: any): Promise<any> {
    await this.ensureMobileTablesExist();
    const now = new Date().toISOString();
    const id = uuidv4();
    const newFence = {
      id,
      geofenceCode: data.geofenceCode,
      name: data.name,
      projectId: data.projectId || 'PRJ-WATER-001',
      projectName: data.projectName || 'Metropolitan Water Pipeline Network Expansion Phase-4',
      fenceType: data.fenceType || 'CIRCLE',
      centerLat: data.centerLat,
      centerLng: data.centerLng,
      radiusMeters: data.radiusMeters || 250,
      polygonCoordinates: typeof data.polygonCoordinates === 'string' ? data.polygonCoordinates : JSON.stringify(data.polygonCoordinates || []),
      category: data.category || 'PROJECT_SITE',
      autoCheckinEnabled: data.autoCheckinEnabled ?? true,
      alertOnExit: data.alertOnExit ?? true,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      createdBy: 'Admin',
      updatedBy: 'Admin',
      isDeleted: false,
    };
    await db.insert(phase68Geofences).values(newFence);
    return newFence;
  }

  public async recordGeofenceEvent(data: any): Promise<any> {
    await this.ensureMobileTablesExist();
    const now = new Date().toISOString();
    const id = uuidv4();
    const event = {
      id,
      geofenceId: data.geofenceId,
      geofenceName: data.geofenceName,
      deviceId: data.deviceId,
      userId: data.userId,
      userName: data.userName,
      eventType: data.eventType || 'ENTER',
      latitude: data.latitude,
      longitude: data.longitude,
      dwellDurationMinutes: data.dwellDurationMinutes || 0,
      eventTimestamp: now,
      createdAt: now,
      updatedAt: now,
      createdBy: data.userName,
      updatedBy: data.userName,
      isDeleted: false,
    };
    await db.insert(phase68GeofenceEvents).values(event);
    return event;
  }

  // --- Site Check-ins / Check-outs ---
  public async checkin(data: any, user: any): Promise<any> {
    await this.ensureMobileTablesExist();
    const now = new Date().toISOString();
    const id = uuidv4();
    const checkin = {
      id,
      userId: user?.id || data.userId || 'USR-001',
      userName: user?.fullName || data.userName || 'Lead Engineer',
      projectId: data.projectId || 'PRJ-WATER-001',
      projectName: data.projectName || 'Metropolitan Water Pipeline Network Expansion Phase-4',
      geofenceId: data.geofenceId || null,
      siteName: data.siteName,
      checkinTime: now,
      latitude: data.latitude,
      longitude: data.longitude,
      accuracyMeters: data.accuracyMeters || 4.5,
      selfiePhotoUrl: data.selfiePhotoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      isBiometricVerified: data.isBiometricVerified ?? true,
      isOfflineCheckin: data.isOfflineCheckin ?? false,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      createdBy: user?.fullName || 'Field User',
      updatedBy: user?.fullName || 'Field User',
      isDeleted: false,
    };
    await db.insert(phase68SiteCheckins).values(checkin);
    return checkin;
  }

  public async checkout(data: any, user: any): Promise<any> {
    await this.ensureMobileTablesExist();
    const now = new Date().toISOString();
    const id = uuidv4();
    const checkout = {
      id,
      checkinId: data.checkinId,
      userId: user?.id || data.userId || 'USR-001',
      userName: user?.fullName || data.userName || 'Lead Engineer',
      checkoutTime: now,
      latitude: data.latitude,
      longitude: data.longitude,
      totalDurationMinutes: data.totalDurationMinutes || 480,
      dailySummaryText: data.dailySummaryText || 'Daily field shift completed.',
      isAutoCheckout: data.isAutoCheckout ?? false,
      createdAt: now,
      updatedAt: now,
      createdBy: user?.fullName || 'Field User',
      updatedBy: user?.fullName || 'Field User',
      isDeleted: false,
    };
    await db.insert(phase68SiteCheckouts).values(checkout);
    await db.update(phase68SiteCheckins).set({ status: 'CHECKED_OUT', updatedAt: now }).where(eq(phase68SiteCheckins.id, data.checkinId));
    return checkout;
  }

  public async getCheckins(): Promise<any[]> {
    await this.ensureMobileTablesExist();
    return db.select().from(phase68SiteCheckins).where(eq(phase68SiteCheckins.isDeleted, false)).orderBy(desc(phase68SiteCheckins.createdAt));
  }

  // --- Field Visits ---
  public async getFieldVisits(): Promise<any[]> {
    await this.ensureMobileTablesExist();
    return db.select().from(phase68FieldVisits).where(eq(phase68FieldVisits.isDeleted, false)).orderBy(desc(phase68FieldVisits.createdAt));
  }

  public async createFieldVisit(data: any, user: any): Promise<any> {
    await this.ensureMobileTablesExist();
    const now = new Date().toISOString();
    const id = uuidv4();
    const visit = {
      id,
      visitCode: data.visitCode || `VST-${Date.now().toString().slice(-6)}`,
      userId: user?.id || data.userId || 'USR-001',
      userName: user?.fullName || data.userName || 'Lead Inspector',
      projectId: data.projectId || 'PRJ-WATER-001',
      projectName: data.projectName || 'Metropolitan Water Pipeline Network Expansion Phase-4',
      siteLocation: data.siteLocation,
      purpose: data.purpose || 'QAQC_INSPECTION',
      scheduledStartTime: data.scheduledStartTime,
      scheduledEndTime: data.scheduledEndTime,
      actualStartTime: now,
      actualEndTime: null,
      status: 'IN_PROGRESS',
      summaryNotes: data.summaryNotes || '',
      findingsCount: data.findingsCount || 0,
      latitude: data.latitude || 25.201,
      longitude: data.longitude || 55.281,
      createdAt: now,
      updatedAt: now,
      createdBy: user?.fullName || 'Field Staff',
      updatedBy: user?.fullName || 'Field Staff',
      isDeleted: false,
    };
    await db.insert(phase68FieldVisits).values(visit);
    return visit;
  }

  // --- Photos ---
  public async getPhotos(): Promise<any[]> {
    await this.ensureMobileTablesExist();
    return db.select().from(phase68MobilePhotos).where(eq(phase68MobilePhotos.isDeleted, false)).orderBy(desc(phase68MobilePhotos.createdAt));
  }

  public async uploadPhoto(data: any, user: any): Promise<any> {
    await this.ensureMobileTablesExist();
    const now = new Date().toISOString();
    const id = uuidv4();
    const photo = {
      id,
      photoCode: data.photoCode || `PHT-${Date.now().toString().slice(-6)}`,
      userId: user?.id || data.userId || 'USR-001',
      userName: user?.fullName || data.userName || 'Field Engineer',
      projectId: data.projectId || 'PRJ-WATER-001',
      category: data.category || 'PROGRESS',
      title: data.title,
      photoUrl: data.photoUrl,
      thumbnailUrl: data.thumbnailUrl || data.photoUrl,
      fileSizeKb: data.fileSizeKb || 1500,
      latitude: data.latitude,
      longitude: data.longitude,
      altitude: data.altitude || 0,
      azimuthHeading: data.azimuthHeading || 0,
      capturedAt: now,
      isWatermarked: true,
      watermarkMetadata: typeof data.watermarkMetadata === 'string' ? data.watermarkMetadata : JSON.stringify(data.watermarkMetadata || { timestamp: now, surveyor: user?.fullName || 'Staff' }),
      relatedEntityId: data.relatedEntityId || null,
      createdAt: now,
      updatedAt: now,
      createdBy: user?.fullName || 'Field Staff',
      updatedBy: user?.fullName || 'Field Staff',
      isDeleted: false,
    };
    await db.insert(phase68MobilePhotos).values(photo);
    return photo;
  }

  // --- Mobile Documents ---
  public async getDocuments(): Promise<any[]> {
    await this.ensureMobileTablesExist();
    return db.select().from(phase68MobileDocuments).where(eq(phase68MobileDocuments.isDeleted, false)).orderBy(desc(phase68MobileDocuments.createdAt));
  }

  // --- Forms ---
  public async getForms(): Promise<any[]> {
    await this.ensureMobileTablesExist();
    return db.select().from(phase68MobileForms).where(eq(phase68MobileForms.isDeleted, false)).orderBy(desc(phase68MobileForms.createdAt));
  }

  public async submitForm(data: any, user: any): Promise<any> {
    await this.ensureMobileTablesExist();
    const now = new Date().toISOString();
    const id = uuidv4();
    const form = {
      id,
      formCode: data.formCode || `FRM-${Date.now().toString().slice(-6)}`,
      formTitle: data.formTitle,
      templateCode: data.templateCode,
      projectId: data.projectId || 'PRJ-WATER-001',
      submittedBy: user?.id || data.submittedBy || 'USR-001',
      submittedByName: user?.fullName || data.submittedByName || 'Field Engineer',
      formDataJson: typeof data.formDataJson === 'string' ? data.formDataJson : JSON.stringify(data.formDataJson),
      status: 'APPROVED',
      latitude: data.latitude || 25.201,
      longitude: data.longitude || 55.281,
      isOfflineSubmitted: data.isOfflineSubmitted ?? false,
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
      createdBy: user?.fullName || 'Field Staff',
      updatedBy: user?.fullName || 'Field Staff',
      isDeleted: false,
    };
    await db.insert(phase68MobileForms).values(form);
    return form;
  }

  // --- Signatures ---
  public async getSignatures(): Promise<any[]> {
    await this.ensureMobileTablesExist();
    return db.select().from(phase68MobileSignatures).where(eq(phase68MobileSignatures.isDeleted, false)).orderBy(desc(phase68MobileSignatures.createdAt));
  }

  public async captureSignature(data: any, user: any): Promise<any> {
    await this.ensureMobileTablesExist();
    const now = new Date().toISOString();
    const id = uuidv4();
    const sig = {
      id,
      signatureCode: data.signatureCode || `SIG-${Date.now().toString().slice(-6)}`,
      entityType: data.entityType || 'FORM_SUBMISSION',
      entityId: data.entityId,
      signerName: data.signerName,
      signerRole: data.signerRole,
      signatureDataUrl: data.signatureDataUrl,
      signedAt: now,
      ipAddress: '192.168.1.1',
      latitude: data.latitude || 25.201,
      longitude: data.longitude || 55.281,
      isVerified: true,
      createdAt: now,
      updatedAt: now,
      createdBy: user?.fullName || 'Field Staff',
      updatedBy: user?.fullName || 'Field Staff',
      isDeleted: false,
    };
    await db.insert(phase68MobileSignatures).values(sig);
    return sig;
  }

  // --- Map Layers & Markers ---
  public async getLayers(): Promise<any[]> {
    await this.ensureMobileTablesExist();
    return db.select().from(phase68MapLayers).where(eq(phase68MapLayers.isDeleted, false)).orderBy(phase68MapLayers.zIndex);
  }

  public async createLayer(data: any): Promise<any> {
    await this.ensureMobileTablesExist();
    const now = new Date().toISOString();
    const id = uuidv4();
    const layer = {
      id,
      layerCode: data.layerCode || `LYR-${Date.now().toString().slice(-6)}`,
      layerName: data.layerName,
      category: data.category || 'PIPELINE_ALIGNMENT',
      layerType: data.layerType || 'VECTOR_GEOJSON',
      geoJsonData: typeof data.geoJsonData === 'string' ? data.geoJsonData : JSON.stringify(data.geoJsonData || {}),
      layerColor: data.layerColor || '#06b6d4',
      opacity: data.opacity ?? 0.85,
      isVisibleDefault: data.isVisibleDefault ?? true,
      zIndex: data.zIndex || 10,
      projectId: data.projectId || 'PRJ-WATER-001',
      createdAt: now,
      updatedAt: now,
      createdBy: 'Admin',
      updatedBy: 'Admin',
      isDeleted: false,
    };
    await db.insert(phase68MapLayers).values(layer);
    return layer;
  }

  public async getMarkers(): Promise<any[]> {
    await this.ensureMobileTablesExist();
    return db.select().from(phase68MapMarkers).where(eq(phase68MapMarkers.isDeleted, false)).orderBy(desc(phase68MapMarkers.createdAt));
  }

  public async createMarker(data: any): Promise<any> {
    await this.ensureMobileTablesExist();
    const now = new Date().toISOString();
    const id = uuidv4();
    const marker = {
      id,
      markerCode: data.markerCode || `GIS-${Date.now().toString().slice(-6)}`,
      name: data.name,
      layerId: data.layerId || null,
      projectId: data.projectId || 'PRJ-WATER-001',
      markerType: data.markerType || 'PIPELINE_VALVE',
      latitude: data.latitude,
      longitude: data.longitude,
      elevationMeters: data.elevationMeters || 0,
      attributesJson: typeof data.attributesJson === 'string' ? data.attributesJson : JSON.stringify(data.attributesJson || {}),
      status: data.status || 'OPERATIONAL',
      iconType: data.iconType || 'droplet',
      colorHex: data.colorHex || '#06b6d4',
      createdAt: now,
      updatedAt: now,
      createdBy: 'Admin',
      updatedBy: 'Admin',
      isDeleted: false,
    };
    await db.insert(phase68MapMarkers).values(marker);
    return marker;
  }

  // --- Push Tokens & Notifications ---
  public async registerPushToken(data: any, user: any): Promise<any> {
    await this.ensureMobileTablesExist();
    const now = new Date().toISOString();
    const id = uuidv4();
    const token = {
      id,
      userId: user?.id || data.userId || 'USR-001',
      deviceId: data.deviceId,
      fcmToken: data.fcmToken,
      apnsToken: data.apnsToken || null,
      platform: data.platform || 'ANDROID',
      isActive: true,
      lastRegisteredAt: now,
      createdAt: now,
      updatedAt: now,
      createdBy: user?.fullName || 'User',
      updatedBy: user?.fullName || 'User',
      isDeleted: false,
    };
    await db.insert(phase68PushTokens).values(token);
    return token;
  }

  public async getNotifications(userId?: string): Promise<any[]> {
    await this.ensureMobileTablesExist();
    return db.select().from(phase68MobileNotifications).where(eq(phase68MobileNotifications.isDeleted, false)).orderBy(desc(phase68MobileNotifications.createdAt)).limit(50);
  }

  // --- Stats for Executive Dashboard ---
  public async getMobileStats(): Promise<any> {
    await this.ensureMobileTablesExist();
    const devices = await this.getDevices();
    const checkins = await this.getCheckins();
    const geofences = await this.getGeofences();
    const photos = await this.getPhotos();
    const live = await this.getLiveLocations();
    const markers = await this.getMarkers();
    const forms = await this.getForms();

    const activeDevices = devices.filter((d) => d.deviceStatus === 'ACTIVE');
    const onlineDevices = devices.filter((d) => d.isOnline);
    const activeCheckins = checkins.filter((c) => c.status === 'ACTIVE');

    return {
      totalRegisteredDevices: devices.length,
      activeDevicesCount: activeDevices.length,
      onlineNowCount: onlineDevices.length,
      activeFieldStaffOnSite: activeCheckins.length,
      geofenceZonesCount: geofences.length,
      totalGisAssetsMapped: markers.length,
      photosCapturedToday: photos.length,
      fieldFormsSubmitted: forms.length,
      syncHealthScorePercent: 99.8,
      averageSyncDurationMs: 235,
      activeHeavyEquipmentTracked: live.filter((l) => l.entityType === 'HEAVY_EQUIPMENT').length,
      activeVehiclesTracked: live.filter((l) => l.entityType === 'VEHICLE').length,
    };
  }
}

export const mobileRepository = new MobileRepository();
