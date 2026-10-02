import { Request, Response } from 'express';
import { mobileService } from '../services/mobile.service';
import {
  RegisterDeviceSchema,
  UpdateDeviceSchema,
  SyncQueueBatchSchema,
  RecordGpsLocationSchema,
  CreateGeofenceSchema,
  TriggerGeofenceEventSchema,
  SiteCheckinSchema,
  SiteCheckoutSchema,
  CreateFieldVisitSchema,
  UploadMobilePhotoSchema,
  SubmitMobileFormSchema,
  CaptureSignatureSchema,
  CreateMapMarkerSchema,
  CreateMapLayerSchema,
  RegisterPushTokenSchema,
} from '../validators/mobile.validator';

export class MobileController {
  public async getStats(req: Request, res: Response) {
    try {
      const stats = await mobileService.getDashboardStats();
      return res.status(200).json({ success: true, data: stats });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async getDevices(req: Request, res: Response) {
    try {
      const devices = await mobileService.getAllDevices();
      return res.status(200).json({ success: true, data: devices });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async registerDevice(req: Request, res: Response) {
    try {
      const validated = RegisterDeviceSchema.parse(req.body);
      const user = (req as any).user;
      const device = await mobileService.registerDevice(validated, user?.fullName || 'Admin');
      return res.status(201).json({ success: true, data: device });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || err });
    }
  }

  public async updateDevice(req: Request, res: Response) {
    try {
      const validated = UpdateDeviceSchema.parse(req.body);
      const updated = await mobileService.updateDevice(req.params.id, validated);
      return res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || err });
    }
  }

  public async syncBatch(req: Request, res: Response) {
    try {
      const validated = SyncQueueBatchSchema.parse(req.body);
      const result = await mobileService.processSyncBatch(validated);
      return res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || err });
    }
  }

  public async getSyncHistory(req: Request, res: Response) {
    try {
      const deviceId = req.query.deviceId as string | undefined;
      const history = await mobileService.getSyncHistory(deviceId);
      return res.status(200).json({ success: true, data: history });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async recordLocation(req: Request, res: Response) {
    try {
      const validated = RecordGpsLocationSchema.parse(req.body);
      const result = await mobileService.recordGpsLocation(validated);
      return res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || err });
    }
  }

  public async getLiveLocations(req: Request, res: Response) {
    try {
      const locations = await mobileService.getLiveLocations();
      return res.status(200).json({ success: true, data: locations });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async getGeofences(req: Request, res: Response) {
    try {
      const fences = await mobileService.getGeofences();
      return res.status(200).json({ success: true, data: fences });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async createGeofence(req: Request, res: Response) {
    try {
      const validated = CreateGeofenceSchema.parse(req.body);
      const fence = await mobileService.createGeofence(validated);
      return res.status(201).json({ success: true, data: fence });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || err });
    }
  }

  public async triggerGeofenceEvent(req: Request, res: Response) {
    try {
      const validated = TriggerGeofenceEventSchema.parse(req.body);
      const event = await mobileService.recordGeofenceEvent(validated);
      return res.status(201).json({ success: true, data: event });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || err });
    }
  }

  public async checkin(req: Request, res: Response) {
    try {
      const validated = SiteCheckinSchema.parse(req.body);
      const user = (req as any).user;
      const checkin = await mobileService.siteCheckin(validated, user);
      return res.status(201).json({ success: true, data: checkin });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || err });
    }
  }

  public async checkout(req: Request, res: Response) {
    try {
      const validated = SiteCheckoutSchema.parse(req.body);
      const user = (req as any).user;
      const checkout = await mobileService.siteCheckout(validated, user);
      return res.status(200).json({ success: true, data: checkout });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || err });
    }
  }

  public async getCheckins(req: Request, res: Response) {
    try {
      const checkins = await mobileService.getCheckins();
      return res.status(200).json({ success: true, data: checkins });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async getFieldVisits(req: Request, res: Response) {
    try {
      const visits = await mobileService.getFieldVisits();
      return res.status(200).json({ success: true, data: visits });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async createFieldVisit(req: Request, res: Response) {
    try {
      const validated = CreateFieldVisitSchema.parse(req.body);
      const user = (req as any).user;
      const visit = await mobileService.createFieldVisit(validated, user);
      return res.status(201).json({ success: true, data: visit });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || err });
    }
  }

  public async getPhotos(req: Request, res: Response) {
    try {
      const photos = await mobileService.getPhotos();
      return res.status(200).json({ success: true, data: photos });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async uploadPhoto(req: Request, res: Response) {
    try {
      const validated = UploadMobilePhotoSchema.parse(req.body);
      const user = (req as any).user;
      const photo = await mobileService.uploadPhoto(validated, user);
      return res.status(201).json({ success: true, data: photo });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || err });
    }
  }

  public async getDocuments(req: Request, res: Response) {
    try {
      const docs = await mobileService.getDocuments();
      return res.status(200).json({ success: true, data: docs });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async getForms(req: Request, res: Response) {
    try {
      const forms = await mobileService.getForms();
      return res.status(200).json({ success: true, data: forms });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async submitForm(req: Request, res: Response) {
    try {
      const validated = SubmitMobileFormSchema.parse(req.body);
      const user = (req as any).user;
      const form = await mobileService.submitForm(validated, user);
      return res.status(201).json({ success: true, data: form });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || err });
    }
  }

  public async getSignatures(req: Request, res: Response) {
    try {
      const sigs = await mobileService.getSignatures();
      return res.status(200).json({ success: true, data: sigs });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async captureSignature(req: Request, res: Response) {
    try {
      const validated = CaptureSignatureSchema.parse(req.body);
      const user = (req as any).user;
      const sig = await mobileService.captureSignature(validated, user);
      return res.status(201).json({ success: true, data: sig });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || err });
    }
  }

  public async getMapLayers(req: Request, res: Response) {
    try {
      const layers = await mobileService.getMapLayers();
      return res.status(200).json({ success: true, data: layers });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async createMapLayer(req: Request, res: Response) {
    try {
      const validated = CreateMapLayerSchema.parse(req.body);
      const layer = await mobileService.createMapLayer(validated);
      return res.status(201).json({ success: true, data: layer });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || err });
    }
  }

  public async getMapMarkers(req: Request, res: Response) {
    try {
      const markers = await mobileService.getMapMarkers();
      return res.status(200).json({ success: true, data: markers });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async createMapMarker(req: Request, res: Response) {
    try {
      const validated = CreateMapMarkerSchema.parse(req.body);
      const marker = await mobileService.createMapMarker(validated);
      return res.status(201).json({ success: true, data: marker });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || err });
    }
  }

  public async registerPushToken(req: Request, res: Response) {
    try {
      const validated = RegisterPushTokenSchema.parse(req.body);
      const user = (req as any).user;
      const token = await mobileService.registerPushToken(validated, user);
      return res.status(201).json({ success: true, data: token });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || err });
    }
  }

  public async getNotifications(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const notifs = await mobileService.getNotifications(user?.id);
      return res.status(200).json({ success: true, data: notifs });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

export const mobileController = new MobileController();
