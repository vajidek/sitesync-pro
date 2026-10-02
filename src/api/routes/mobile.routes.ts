import { Router } from 'express';
import { mobileController } from '../controllers/mobile.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';

const router = Router();

// JWT & RBAC Middleware
router.use(authenticateJWT);
router.use(
  requireRoles(
    'ADMIN',
    'MANAGER',
    'INCHARGE',
    'SUPERVISOR',
    'STORE_KEEPER',
    'DRIVER',
    'OPERATOR',
    'WORKER'
  )
);

// Overview Stats & Health
router.get('/stats', mobileController.getStats.bind(mobileController));

// Mobile Devices
router.get('/devices', mobileController.getDevices.bind(mobileController));
router.post('/devices', mobileController.registerDevice.bind(mobileController));
router.put('/devices/:id', mobileController.updateDevice.bind(mobileController));

// Offline Sync & Queue
router.post('/sync', mobileController.syncBatch.bind(mobileController));
router.get('/sync/history', mobileController.getSyncHistory.bind(mobileController));

// GPS Tracking & Live Locations
router.post('/location', mobileController.recordLocation.bind(mobileController));
router.post('/gps', mobileController.recordLocation.bind(mobileController));
router.get('/locations', mobileController.getLiveLocations.bind(mobileController));

// Geofencing
router.get('/geofences', mobileController.getGeofences.bind(mobileController));
router.post('/geofences', mobileController.createGeofence.bind(mobileController));
router.post('/geofences/events', mobileController.triggerGeofenceEvent.bind(mobileController));

// Site Checkin / Checkout
router.post('/checkin', mobileController.checkin.bind(mobileController));
router.post('/checkout', mobileController.checkout.bind(mobileController));
router.get('/checkin', mobileController.getCheckins.bind(mobileController));
router.get('/checkins', mobileController.getCheckins.bind(mobileController));

// Field Visits
router.get('/visits', mobileController.getFieldVisits.bind(mobileController));
router.post('/visits', mobileController.createFieldVisit.bind(mobileController));

// Mobile Photos & Camera Evidence
router.get('/photos', mobileController.getPhotos.bind(mobileController));
router.post('/photos', mobileController.uploadPhoto.bind(mobileController));

// Offline Documents & IFC Drawings
router.get('/documents', mobileController.getDocuments.bind(mobileController));

// Mobile Dynamic Forms (DFR, Pour Card, Safety)
router.get('/forms', mobileController.getForms.bind(mobileController));
router.post('/forms', mobileController.submitForm.bind(mobileController));

// Digital Signatures
router.get('/signatures', mobileController.getSignatures.bind(mobileController));
router.post('/signatures', mobileController.captureSignature.bind(mobileController));

// GIS Map Layers & Water Infrastructure Markers
router.get('/maps', mobileController.getMapMarkers.bind(mobileController));
router.get('/markers', mobileController.getMapMarkers.bind(mobileController));
router.post('/markers', mobileController.createMapMarker.bind(mobileController));
router.get('/layers', mobileController.getMapLayers.bind(mobileController));
router.post('/layers', mobileController.createMapLayer.bind(mobileController));

// Notifications & Push Tokens
router.get('/notifications', mobileController.getNotifications.bind(mobileController));
router.post('/push-token', mobileController.registerPushToken.bind(mobileController));

export default router;
