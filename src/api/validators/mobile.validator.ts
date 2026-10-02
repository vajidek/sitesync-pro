import { z } from 'zod';

export const RegisterDeviceSchema = z.object({
  deviceId: z.string().min(2, 'Device unique hardware/client ID is required'),
  deviceModel: z.string().min(2, 'Device model is required'),
  osPlatform: z.enum(['ANDROID', 'IOS', 'PWA', 'IPAD_OS']).default('ANDROID'),
  osVersion: z.string().default('14.0'),
  appVersion: z.string().default('v3.8.4-prod'),
  assignedUserId: z.string().default('USR-FIELD-01'),
  assignedUserName: z.string().default('Chief Field Resident Engineer'),
  userRole: z.string().default('SUPERVISOR'),
  projectId: z.string().default('PRJ-WATER-001'),
  projectName: z.string().default('Metropolitan Water Pipeline Network Expansion Phase-4'),
  batteryLevel: z.number().min(0).max(100).default(100),
  storageAvailableMb: z.number().nonnegative().default(16384),
});

export const UpdateDeviceSchema = RegisterDeviceSchema.partial().extend({
  deviceStatus: z.enum(['ACTIVE', 'SUSPENDED', 'DECOMMISSIONED', 'LOST']).optional(),
  isOnline: z.boolean().optional(),
  batteryLevel: z.number().min(0).max(100).optional(),
});

export const SyncBatchItemSchema = z.object({
  entityType: z.string().min(1, 'Entity type required'),
  entityId: z.string().min(1, 'Entity ID required'),
  action: z.enum(['CREATE', 'UPDATE', 'DELETE', 'UPLOAD']).default('CREATE'),
  payload: z.union([z.string(), z.record(z.string(), z.any())]),
  clientTimestamp: z.string().default(() => new Date().toISOString()),
});

export const SyncQueueBatchSchema = z.object({
  deviceId: z.string().min(1, 'Device ID required'),
  userId: z.string().min(1, 'User ID required'),
  items: z.array(SyncBatchItemSchema).default([]),
  networkType: z.enum(['5G', '4G_LTE', '3G', 'WIFI', 'OFFLINE']).default('4G_LTE'),
  lastSyncTimestamp: z.string().optional(),
});

export const RecordGpsLocationSchema = z.object({
  deviceId: z.string().default('DEV-ANDROID-001'),
  userId: z.string().default('USR-FIELD-01'),
  userName: z.string().default('Chief Field Resident Engineer'),
  projectId: z.string().default('PRJ-WATER-001'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  altitudeMeters: z.number().default(0),
  accuracyMeters: z.number().default(4.5),
  speedKmph: z.number().nonnegative().default(0),
  headingDegrees: z.number().min(0).max(360).default(0),
  batteryPercent: z.number().min(0).max(100).default(95),
  entityType: z.enum(['PERSONNEL', 'VEHICLE', 'HEAVY_EQUIPMENT', 'DRONE']).default('PERSONNEL'),
  roleOrType: z.string().default('Resident Engineer'),
});

export const CreateGeofenceSchema = z.object({
  geofenceCode: z.string().min(2, 'Geofence code required'),
  name: z.string().min(2, 'Geofence name required'),
  projectId: z.string().default('PRJ-WATER-001'),
  projectName: z.string().default('Metropolitan Water Pipeline Network Expansion Phase-4'),
  fenceType: z.enum(['CIRCLE', 'POLYGON', 'CORRIDOR_BUFFER']).default('CIRCLE'),
  centerLat: z.number().min(-90).max(90),
  centerLng: z.number().min(-180).max(180),
  radiusMeters: z.number().positive().default(250),
  polygonCoordinates: z.union([z.string(), z.array(z.record(z.string(), z.any()))]).optional(),
  category: z.enum(['PROJECT_SITE', 'PIPELINE_ZONE', 'WTP_PREMISES', 'QUARRY', 'STORE_YARD']).default('PROJECT_SITE'),
  autoCheckinEnabled: z.boolean().default(true),
  alertOnExit: z.boolean().default(true),
});

export const TriggerGeofenceEventSchema = z.object({
  geofenceId: z.string().min(1),
  geofenceName: z.string().min(1),
  deviceId: z.string().min(1),
  userId: z.string().min(1),
  userName: z.string().min(1),
  eventType: z.enum(['ENTER', 'EXIT', 'DWELL']).default('ENTER'),
  latitude: z.number(),
  longitude: z.number(),
  dwellDurationMinutes: z.number().optional().default(0),
});

export const SiteCheckinSchema = z.object({
  projectId: z.string().default('PRJ-WATER-001'),
  projectName: z.string().default('Metropolitan Water Pipeline Network Expansion Phase-4'),
  geofenceId: z.string().optional(),
  siteName: z.string().min(2, 'Site name required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracyMeters: z.number().default(4.0),
  selfiePhotoUrl: z.string().optional(),
  isBiometricVerified: z.boolean().default(true),
  isOfflineCheckin: z.boolean().default(false),
});

export const SiteCheckoutSchema = z.object({
  checkinId: z.string().min(1, 'Checkin ID required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  dailySummaryText: z.string().optional().default('Daily field inspection and valve chamber testing completed without incident.'),
  totalDurationMinutes: z.number().default(480),
});

export const CreateFieldVisitSchema = z.object({
  visitCode: z.string().min(2, 'Visit code required'),
  projectId: z.string().default('PRJ-WATER-001'),
  projectName: z.string().default('Metropolitan Water Pipeline Network Expansion Phase-4'),
  siteLocation: z.string().min(2, 'Site location required'),
  purpose: z.enum(['QAQC_INSPECTION', 'SAFETY_AUDIT', 'PROGRESS_SURVEY', 'CLIENT_WALKTHROUGH', 'COMMISSIONING']).default('QAQC_INSPECTION'),
  scheduledStartTime: z.string(),
  scheduledEndTime: z.string(),
  summaryNotes: z.string().optional(),
  findingsCount: z.number().nonnegative().default(0),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const UploadMobilePhotoSchema = z.object({
  photoCode: z.string().min(2),
  projectId: z.string().default('PRJ-WATER-001'),
  category: z.enum(['PROGRESS', 'QAQC_DEFECT', 'HSE_HAZARD', 'ASSET_TAG', 'BILLING_PROOF']).default('PROGRESS'),
  title: z.string().min(2, 'Photo title is required'),
  photoUrl: z.string().min(5, 'Valid photo URL required'),
  thumbnailUrl: z.string().optional(),
  fileSizeKb: z.number().default(1450),
  latitude: z.number(),
  longitude: z.number(),
  altitude: z.number().default(0),
  azimuthHeading: z.number().default(0),
  watermarkMetadata: z.union([z.string(), z.record(z.string(), z.any())]).optional(),
  relatedEntityId: z.string().optional(),
});

export const SubmitMobileFormSchema = z.object({
  formCode: z.string().min(2),
  formTitle: z.string().min(2),
  templateCode: z.string().min(2),
  projectId: z.string().default('PRJ-WATER-001'),
  formDataJson: z.union([z.string(), z.record(z.string(), z.any())]),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isOfflineSubmitted: z.boolean().default(false),
});

export const CaptureSignatureSchema = z.object({
  signatureCode: z.string().min(2),
  entityType: z.enum(['FORM_SUBMISSION', 'DFR', 'SITE_HANDOVER', 'MATERIAL_RECEIPT', 'CLIENT_MOM']).default('SITE_HANDOVER'),
  entityId: z.string().min(1),
  signerName: z.string().min(2, 'Signer name required'),
  signerRole: z.string().min(2, 'Signer role required'),
  signatureDataUrl: z.string().min(10, 'Signature vector or data url required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const RegisterPushTokenSchema = z.object({
  deviceId: z.string().min(1),
  fcmToken: z.string().min(1),
  apnsToken: z.string().optional(),
  platform: z.enum(['ANDROID', 'IOS', 'WEB_PUSH']).default('ANDROID'),
});

export const CreateMapMarkerSchema = z.object({
  markerCode: z.string().min(2),
  name: z.string().min(2),
  layerId: z.string().optional(),
  projectId: z.string().default('PRJ-WATER-001'),
  markerType: z.enum(['PIPELINE_VALVE', 'PUMP_HOUSE', 'WATER_RESERVOIR', 'WTP_PLANT', 'FLOW_METER', 'DEFECT_PIN', 'HEAVY_EQUIPMENT']).default('PIPELINE_VALVE'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  elevationMeters: z.number().default(45.0),
  attributesJson: z.union([z.string(), z.record(z.string(), z.any())]).optional(),
  status: z.enum(['OPERATIONAL', 'MAINTENANCE_DUE', 'ALERT_DEFECT', 'UNDER_CONSTRUCTION']).default('OPERATIONAL'),
  iconType: z.string().default('droplet'),
  colorHex: z.string().default('#06b6d4'),
});

export const CreateMapLayerSchema = z.object({
  layerCode: z.string().min(2),
  layerName: z.string().min(2),
  category: z.enum(['GIS_ASSETS', 'PIPELINE_ALIGNMENT', 'WATER_UTILITIES', 'SATELLITE_HYBRID', 'GEOFENCE_OVERLAY']).default('PIPELINE_ALIGNMENT'),
  layerType: z.enum(['VECTOR_GEOJSON', 'RASTER_TILE', 'WMS_SERVER', 'KML']).default('VECTOR_GEOJSON'),
  geoJsonData: z.union([z.string(), z.record(z.string(), z.any())]).optional(),
  layerColor: z.string().default('#06b6d4'),
  opacity: z.number().min(0).max(1).default(0.85),
  isVisibleDefault: z.boolean().default(true),
  zIndex: z.number().default(10),
  projectId: z.string().default('PRJ-WATER-001'),
});
