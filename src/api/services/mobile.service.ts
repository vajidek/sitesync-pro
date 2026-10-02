import { mobileRepository } from '../repositories/mobile.repository';

export class MobileService {
  public async getDashboardStats() {
    return mobileRepository.getMobileStats();
  }

  public async getAllDevices() {
    return mobileRepository.getDevices();
  }

  public async registerDevice(data: any, createdBy?: string) {
    return mobileRepository.registerDevice(data, createdBy);
  }

  public async updateDevice(id: string, updates: any) {
    return mobileRepository.updateDevice(id, updates);
  }

  public async processSyncBatch(data: any) {
    // Conflict resolution logic:
    // When incoming payload timestamp is older or newer, apply deterministic server timestamp
    return mobileRepository.processSyncBatch(data);
  }

  public async getSyncHistory(deviceId?: string) {
    return mobileRepository.getSyncHistory(deviceId);
  }

  public async recordGpsLocation(data: any) {
    // Geofence detection check
    return mobileRepository.recordLocation(data);
  }

  public async getLiveLocations() {
    return mobileRepository.getLiveLocations();
  }

  public async getGeofences() {
    return mobileRepository.getGeofences();
  }

  public async createGeofence(data: any) {
    return mobileRepository.createGeofence(data);
  }

  public async recordGeofenceEvent(data: any) {
    return mobileRepository.recordGeofenceEvent(data);
  }

  public async siteCheckin(data: any, user: any) {
    return mobileRepository.checkin(data, user);
  }

  public async siteCheckout(data: any, user: any) {
    return mobileRepository.checkout(data, user);
  }

  public async getCheckins() {
    return mobileRepository.getCheckins();
  }

  public async getFieldVisits() {
    return mobileRepository.getFieldVisits();
  }

  public async createFieldVisit(data: any, user: any) {
    return mobileRepository.createFieldVisit(data, user);
  }

  public async getPhotos() {
    return mobileRepository.getPhotos();
  }

  public async uploadPhoto(data: any, user: any) {
    // Automatically inject GPS watermarking and project tags
    return mobileRepository.uploadPhoto(data, user);
  }

  public async getDocuments() {
    return mobileRepository.getDocuments();
  }

  public async getForms() {
    return mobileRepository.getForms();
  }

  public async submitForm(data: any, user: any) {
    return mobileRepository.submitForm(data, user);
  }

  public async getSignatures() {
    return mobileRepository.getSignatures();
  }

  public async captureSignature(data: any, user: any) {
    return mobileRepository.captureSignature(data, user);
  }

  public async getMapLayers() {
    return mobileRepository.getLayers();
  }

  public async createMapLayer(data: any) {
    return mobileRepository.createLayer(data);
  }

  public async getMapMarkers() {
    return mobileRepository.getMarkers();
  }

  public async createMapMarker(data: any) {
    return mobileRepository.createMarker(data);
  }

  public async registerPushToken(data: any, user: any) {
    return mobileRepository.registerPushToken(data, user);
  }

  public async getNotifications(userId?: string) {
    return mobileRepository.getNotifications(userId);
  }
}

export const mobileService = new MobileService();
