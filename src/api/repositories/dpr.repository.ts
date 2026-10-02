import { db } from '../../db';
import { 
  dailyProgressReports, 
  dailyProgressEntries, 
  dailyProgressPhotos, 
  dailyProgressDocuments, 
  dailyProgressWeather, 
  dailyProgressDelays, 
  dailyProgressApprovals, 
  dailyProgressComments,
  wbsActivities,
  boqItems
} from '../../db/schema';
import { eq, and, isNull, sql, desc, inArray } from 'drizzle-orm';

export interface CreateDprDto {
  projectId: string;
  dprNumber?: string;
  packageId?: string;
  zoneId?: string;
  areaId?: string;
  sectionId?: string;
  location?: string;
  date: string;
  shift?: string;
  departmentId?: string;
  departmentName?: string;
  preparedById?: string;
  preparedByName?: string;
  checkedById?: string;
  checkedByName?: string;
  approvedById?: string;
  approvedByName?: string;
  status?: string;
  remarks?: string;
  siteConditions?: Record<string, boolean | string>;
  createdBy?: string;
}

export interface CreateDprEntryDto {
  dprId: string;
  projectId: string;
  wbsId?: string;
  boqItemId?: string;
  activityId?: string;
  department?: string;
  responsibleEngineerId?: string;
  responsibleEngineerName?: string;
  supervisorName?: string;
  contractorName?: string;
  subcontractorName?: string;
  plannedQty?: number;
  todayQty: number;
  cumulativeQty?: number;
  remainingQty?: number;
  progressPercentage?: number;
  unit?: string;
  workingHours?: number;
  startTime?: string;
  endTime?: string;
  remarks?: string;
  createdBy?: string;
}

let isDprSeeded = false;

export async function ensureDprTablesExist() {
  if (isDprSeeded) return;
  try {
    isDprSeeded = true;
  } catch (err) {
    console.error('Error ensuring DPR tables exist:', err);
  }
}

export class DprRepository {
  // 1. Header CRUD
  async getAllByProject(projectId: string, filters?: { date?: string; status?: string; departmentId?: string }) {
    await ensureDprTablesExist();
    let conditions = [
      eq(dailyProgressReports.projectId, projectId),
      isNull(dailyProgressReports.deletedAt)
    ];

    if (filters?.date) {
      conditions.push(eq(dailyProgressReports.date, filters.date));
    }
    if (filters?.status) {
      conditions.push(eq(dailyProgressReports.status, filters.status));
    }
    if (filters?.departmentId) {
      conditions.push(eq(dailyProgressReports.departmentId, filters.departmentId));
    }

    const reports = await db
      .select()
      .from(dailyProgressReports)
      .where(and(...conditions))
      .orderBy(desc(dailyProgressReports.date), desc(dailyProgressReports.createdAt));

    return reports;
  }

  async getById(id: string) {
    const reports = await db
      .select()
      .from(dailyProgressReports)
      .where(and(eq(dailyProgressReports.id, id), isNull(dailyProgressReports.deletedAt)));
    
    if (!reports || reports.length === 0) return null;
    const report = reports[0];

    // Fetch related detail datasets
    const entries = await this.getEntriesByDpr(id);
    const photos = await this.getPhotosByDpr(id);
    const documents = await this.getDocumentsByDpr(id);
    const weather = await this.getWeatherByDpr(id);
    const delays = await this.getDelaysByDpr(id);
    const approvals = await this.getApprovalsByDpr(id);
    const comments = await this.getCommentsByDpr(id);

    return {
      ...report,
      entries,
      photos,
      documents,
      weather,
      delays,
      approvals,
      comments
    };
  }

  async generateDprNumber(projectId: string, dateStr: string): Promise<string> {
    const cleanDate = dateStr.replace(/-/g, '');
    const prefix = `DPR-${cleanDate}`;
    const existing = await db
      .select()
      .from(dailyProgressReports)
      .where(and(eq(dailyProgressReports.projectId, projectId), isNull(dailyProgressReports.deletedAt)));

    const count = existing.length + 1;
    const seq = count.toString().padStart(3, '0');
    return `${prefix}-${seq}`;
  }

  async create(data: CreateDprDto) {
    const id = `dpr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const dprNumber = data.dprNumber || await this.generateDprNumber(data.projectId, data.date);

    await db.insert(dailyProgressReports).values({
      id,
      dprNumber,
      projectId: data.projectId,
      packageId: data.packageId || null,
      zoneId: data.zoneId || null,
      areaId: data.areaId || null,
      sectionId: data.sectionId || null,
      location: data.location || null,
      date: data.date,
      shift: data.shift || 'DAY',
      departmentId: data.departmentId || null,
      departmentName: data.departmentName || null,
      preparedById: data.preparedById || null,
      preparedByName: data.preparedByName || null,
      checkedById: data.checkedById || null,
      checkedByName: data.checkedByName || null,
      approvedById: data.approvedById || null,
      approvedByName: data.approvedByName || null,
      status: data.status || 'DRAFT',
      remarks: data.remarks || null,
      siteConditions: data.siteConditions || {
        workingFrontAvailable: true,
        accessAvailable: true,
        drawingAvailable: true,
        materialAvailable: true,
        equipmentAvailable: true,
        powerAvailable: true,
        safetyIssues: false
      },
      createdBy: data.createdBy || null,
      createdAt: now,
      updatedAt: now
    });

    return this.getById(id);
  }

  async update(id: string, data: Partial<CreateDprDto>) {
    const now = new Date().toISOString();
    const updatePayload: Record<string, any> = { updatedAt: now };

    if (data.dprNumber !== undefined) updatePayload.dprNumber = data.dprNumber;
    if (data.packageId !== undefined) updatePayload.packageId = data.packageId;
    if (data.zoneId !== undefined) updatePayload.zoneId = data.zoneId;
    if (data.areaId !== undefined) updatePayload.areaId = data.areaId;
    if (data.sectionId !== undefined) updatePayload.sectionId = data.sectionId;
    if (data.location !== undefined) updatePayload.location = data.location;
    if (data.date !== undefined) updatePayload.date = data.date;
    if (data.shift !== undefined) updatePayload.shift = data.shift;
    if (data.departmentId !== undefined) updatePayload.departmentId = data.departmentId;
    if (data.departmentName !== undefined) updatePayload.departmentName = data.departmentName;
    if (data.preparedById !== undefined) updatePayload.preparedById = data.preparedById;
    if (data.preparedByName !== undefined) updatePayload.preparedByName = data.preparedByName;
    if (data.checkedById !== undefined) updatePayload.checkedById = data.checkedById;
    if (data.checkedByName !== undefined) updatePayload.checkedByName = data.checkedByName;
    if (data.approvedById !== undefined) updatePayload.approvedById = data.approvedById;
    if (data.approvedByName !== undefined) updatePayload.approvedByName = data.approvedByName;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.remarks !== undefined) updatePayload.remarks = data.remarks;
    if (data.siteConditions !== undefined) updatePayload.siteConditions = data.siteConditions;

    await db
      .update(dailyProgressReports)
      .set(updatePayload)
      .where(eq(dailyProgressReports.id, id));

    return this.getById(id);
  }

  async softDelete(id: string) {
    const now = new Date().toISOString();
    await db
      .update(dailyProgressReports)
      .set({ deletedAt: now, updatedAt: now })
      .where(eq(dailyProgressReports.id, id));
    return { success: true, id };
  }

  async restore(id: string) {
    const now = new Date().toISOString();
    await db
      .update(dailyProgressReports)
      .set({ deletedAt: null, updatedAt: now })
      .where(eq(dailyProgressReports.id, id));
    return this.getById(id);
  }

  // 2. Entries
  async getEntriesByDpr(dprId: string) {
    return db
      .select()
      .from(dailyProgressEntries)
      .where(and(eq(dailyProgressEntries.dprId, dprId), isNull(dailyProgressEntries.deletedAt)));
  }

  async createEntry(data: CreateDprEntryDto) {
    const id = `entry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const todayQty = data.todayQty || 0;
    const plannedQty = data.plannedQty || 0;
    let cumulativeQty = data.cumulativeQty || todayQty;
    let remainingQty = Math.max(0, plannedQty - cumulativeQty);
    let progressPct = plannedQty > 0 ? Math.min(100, Math.round((cumulativeQty / plannedQty) * 100)) : 0;

    await db.insert(dailyProgressEntries).values({
      id,
      dprId: data.dprId,
      projectId: data.projectId,
      wbsId: data.wbsId || null,
      boqItemId: data.boqItemId || null,
      activityId: data.activityId || null,
      department: data.department || null,
      responsibleEngineerId: data.responsibleEngineerId || null,
      responsibleEngineerName: data.responsibleEngineerName || null,
      supervisorName: data.supervisorName || null,
      contractorName: data.contractorName || null,
      subcontractorName: data.subcontractorName || null,
      plannedQty,
      todayQty,
      cumulativeQty,
      remainingQty,
      progressPercentage: progressPct,
      unit: data.unit || 'm',
      workingHours: data.workingHours || 8,
      startTime: data.startTime || '08:00',
      endTime: data.endTime || '17:00',
      remarks: data.remarks || null,
      createdBy: data.createdBy || null,
      createdAt: now,
      updatedAt: now
    });

    // Auto update linked WBS Activity and BOQ Item cumulative values
    if (data.activityId) {
      await this.syncActivityProgress(data.activityId, todayQty);
    }
    if (data.boqItemId) {
      await this.syncBoqProgress(data.boqItemId, todayQty);
    }

    return id;
  }

  async updateEntry(id: string, data: Partial<CreateDprEntryDto>) {
    const now = new Date().toISOString();
    
    // Fetch current entry
    const current = await db
      .select()
      .from(dailyProgressEntries)
      .where(eq(dailyProgressEntries.id, id));

    if (!current || current.length === 0) return null;
    const oldEntry = current[0];

    const todayQty = data.todayQty !== undefined ? data.todayQty : oldEntry.todayQty;
    const plannedQty = data.plannedQty !== undefined ? data.plannedQty : oldEntry.plannedQty;
    const qtyDelta = todayQty - oldEntry.todayQty;
    const cumulativeQty = (oldEntry.cumulativeQty || 0) + qtyDelta;
    const remainingQty = Math.max(0, plannedQty - cumulativeQty);
    const progressPct = plannedQty > 0 ? Math.min(100, Math.round((cumulativeQty / plannedQty) * 100)) : 0;

    await db
      .update(dailyProgressEntries)
      .set({
        plannedQty,
        todayQty,
        cumulativeQty,
        remainingQty,
        progressPercentage: progressPct,
        department: data.department !== undefined ? data.department : oldEntry.department,
        responsibleEngineerName: data.responsibleEngineerName !== undefined ? data.responsibleEngineerName : oldEntry.responsibleEngineerName,
        supervisorName: data.supervisorName !== undefined ? data.supervisorName : oldEntry.supervisorName,
        contractorName: data.contractorName !== undefined ? data.contractorName : oldEntry.contractorName,
        subcontractorName: data.subcontractorName !== undefined ? data.subcontractorName : oldEntry.subcontractorName,
        remarks: data.remarks !== undefined ? data.remarks : oldEntry.remarks,
        updatedAt: now
      })
      .where(eq(dailyProgressEntries.id, id));

    // Sync delta with linked activity/BOQ
    if (qtyDelta !== 0) {
      if (oldEntry.activityId) {
        await this.syncActivityProgress(oldEntry.activityId, qtyDelta);
      }
      if (oldEntry.boqItemId) {
        await this.syncBoqProgress(oldEntry.boqItemId, qtyDelta);
      }
    }

    return id;
  }

  async deleteEntry(id: string) {
    const now = new Date().toISOString();
    await db
      .update(dailyProgressEntries)
      .set({ deletedAt: now, updatedAt: now })
      .where(eq(dailyProgressEntries.id, id));
    return true;
  }

  private async syncActivityProgress(activityId: string, addTodayQty: number) {
    const current = await db
      .select()
      .from(wbsActivities)
      .where(eq(wbsActivities.id, activityId));

    if (!current || current.length === 0) return;
    const act = current[0];

    const newToday = addTodayQty;
    const newCumulative = (act.cumulativeQty || 0) + addTodayQty;
    const newRemaining = Math.max(0, act.plannedQty - newCumulative);
    const newProgressPct = act.plannedQty > 0 ? Math.min(100, Math.round((newCumulative / act.plannedQty) * 100)) : 0;
    const newStatus = newProgressPct >= 100 ? 'COMPLETED' : (newProgressPct > 0 ? 'IN_PROGRESS' : act.status);

    await db
      .update(wbsActivities)
      .set({
        todayQty: newToday,
        cumulativeQty: newCumulative,
        remainingQty: newRemaining,
        progressPercentage: newProgressPct,
        status: newStatus,
        updatedAt: new Date().toISOString()
      })
      .where(eq(wbsActivities.id, activityId));
  }

  private async syncBoqProgress(boqItemId: string, addQty: number) {
    const current = await db
      .select()
      .from(boqItems)
      .where(eq(boqItems.id, boqItemId));

    if (!current || current.length === 0) return;
    const boq = current[0];

    const newExecuted = (boq.executedQty || 0) + addQty;
    const newBalance = Math.max(0, boq.quantity - newExecuted);
    const newStatus = newExecuted >= boq.quantity ? 'COMPLETED' : (newExecuted > 0 ? 'IN_PROGRESS' : boq.status);

    await db
      .update(boqItems)
      .set({
        executedQty: newExecuted,
        balanceQty: newBalance,
        status: newStatus,
        updatedAt: new Date().toISOString()
      })
      .where(eq(boqItems.id, boqItemId));
  }

  // 3. Photos
  async getPhotosByDpr(dprId: string) {
    return db
      .select()
      .from(dailyProgressPhotos)
      .where(eq(dailyProgressPhotos.dprId, dprId));
  }

  async addPhoto(data: { dprId: string; entryId?: string; category?: string; fileUrl: string; gpsLat?: number; gpsLng?: number; caption?: string; photoCategory?: string }) {
    const id = `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    await db.insert(dailyProgressPhotos).values({
      id,
      dprId: data.dprId,
      entryId: data.entryId || null,
      category: data.category || 'DURING',
      fileUrl: data.fileUrl,
      gpsLat: data.gpsLat || null,
      gpsLng: data.gpsLng || null,
      caption: data.caption || null,
      photoCategory: data.photoCategory || null,
      createdAt: now
    });

    return id;
  }

  async deletePhoto(id: string) {
    await db.delete(dailyProgressPhotos).where(eq(dailyProgressPhotos.id, id));
    return true;
  }

  // 4. Documents
  async getDocumentsByDpr(dprId: string) {
    return db
      .select()
      .from(dailyProgressDocuments)
      .where(eq(dailyProgressDocuments.dprId, dprId));
  }

  async addDocument(data: { dprId: string; title: string; documentType?: string; fileUrl: string; fileSize?: string; uploadedBy?: string }) {
    const id = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    await db.insert(dailyProgressDocuments).values({
      id,
      dprId: data.dprId,
      title: data.title,
      documentType: data.documentType || 'REPORT',
      fileUrl: data.fileUrl,
      fileSize: data.fileSize || null,
      uploadedBy: data.uploadedBy || null,
      createdAt: now
    });

    return id;
  }

  async deleteDocument(id: string) {
    await db.delete(dailyProgressDocuments).where(eq(dailyProgressDocuments.id, id));
    return true;
  }

  // 5. Weather
  async getWeatherByDpr(dprId: string) {
    const res = await db
      .select()
      .from(dailyProgressWeather)
      .where(eq(dailyProgressWeather.dprId, dprId));
    return res.length > 0 ? res[0] : null;
  }

  async upsertWeather(dprId: string, data: { condition?: string; temperature?: number; humidity?: number; rainfall?: number; windSpeed?: number; remarks?: string }) {
    const existing = await this.getWeatherByDpr(dprId);
    const now = new Date().toISOString();

    if (existing) {
      await db
        .update(dailyProgressWeather)
        .set({
          condition: data.condition || existing.condition,
          temperature: data.temperature !== undefined ? data.temperature : existing.temperature,
          humidity: data.humidity !== undefined ? data.humidity : existing.humidity,
          rainfall: data.rainfall !== undefined ? data.rainfall : existing.rainfall,
          windSpeed: data.windSpeed !== undefined ? data.windSpeed : existing.windSpeed,
          remarks: data.remarks !== undefined ? data.remarks : existing.remarks
        })
        .where(eq(dailyProgressWeather.id, existing.id));
      return existing.id;
    } else {
      const id = `weather-${Date.now()}`;
      await db.insert(dailyProgressWeather).values({
        id,
        dprId,
        condition: data.condition || 'SUNNY',
        temperature: data.temperature || null,
        humidity: data.humidity || null,
        rainfall: data.rainfall || null,
        windSpeed: data.windSpeed || null,
        remarks: data.remarks || null,
        createdAt: now
      });
      return id;
    }
  }

  // 6. Delays
  async getDelaysByDpr(dprId: string) {
    return db
      .select()
      .from(dailyProgressDelays)
      .where(eq(dailyProgressDelays.dprId, dprId));
  }

  async createDelay(data: { dprId: string; category: string; reason: string; responsibleParty?: string; impact?: string; affectedActivityId?: string; affectedBoqId?: string; affectedWbsId?: string; estimatedDelayHours?: number; correctiveAction?: string; status?: string }) {
    const id = `delay-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    await db.insert(dailyProgressDelays).values({
      id,
      dprId: data.dprId,
      category: data.category,
      reason: data.reason,
      responsibleParty: data.responsibleParty || null,
      impact: data.impact || 'MEDIUM',
      affectedActivityId: data.affectedActivityId || null,
      affectedBoqId: data.affectedBoqId || null,
      affectedWbsId: data.affectedWbsId || null,
      estimatedDelayHours: data.estimatedDelayHours || 0,
      correctiveAction: data.correctiveAction || null,
      status: data.status || 'OPEN',
      createdAt: now
    });

    return id;
  }

  async updateDelay(id: string, data: Partial<{ category: string; reason: string; responsibleParty: string; impact: string; estimatedDelayHours: number; correctiveAction: string; status: string }>) {
    await db
      .update(dailyProgressDelays)
      .set(data)
      .where(eq(dailyProgressDelays.id, id));
    return true;
  }

  async deleteDelay(id: string) {
    await db.delete(dailyProgressDelays).where(eq(dailyProgressDelays.id, id));
    return true;
  }

  // 7. Approvals & Comments
  async getApprovalsByDpr(dprId: string) {
    return db
      .select()
      .from(dailyProgressApprovals)
      .where(eq(dailyProgressApprovals.dprId, dprId))
      .orderBy(desc(dailyProgressApprovals.createdAt));
  }

  async addApproval(dprId: string, data: { approverId?: string; approverName: string; action: string; remarks?: string }) {
    const id = `approval-${Date.now()}`;
    const now = new Date().toISOString();

    await db.insert(dailyProgressApprovals).values({
      id,
      dprId,
      approverId: data.approverId || null,
      approverName: data.approverName,
      action: data.action,
      remarks: data.remarks || null,
      createdAt: now
    });

    // Update DPR status accordingly
    let newStatus = 'SUBMITTED';
    if (data.action === 'APPROVE') newStatus = 'APPROVED';
    if (data.action === 'REJECT') newStatus = 'REJECTED';
    if (data.action === 'RETURN') newStatus = 'RETURNED';
    if (data.action === 'REVIEW') newStatus = 'REVIEWED';

    await db
      .update(dailyProgressReports)
      .set({ status: newStatus, approvedByName: data.action === 'APPROVE' ? data.approverName : null, updatedAt: now })
      .where(eq(dailyProgressReports.id, dprId));

    return id;
  }

  async getCommentsByDpr(dprId: string) {
    return db
      .select()
      .from(dailyProgressComments)
      .where(eq(dailyProgressComments.dprId, dprId))
      .orderBy(desc(dailyProgressComments.createdAt));
  }

  async addComment(dprId: string, data: { authorId?: string; authorName: string; role?: string; comment: string }) {
    const id = `comment-${Date.now()}`;
    const now = new Date().toISOString();

    await db.insert(dailyProgressComments).values({
      id,
      dprId,
      authorId: data.authorId || null,
      authorName: data.authorName,
      role: data.role || 'ENGINEER',
      comment: data.comment,
      createdAt: now
    });

    return id;
  }

  // 8. Project Level KPIs
  async getProjectDprKpis(projectId: string) {
    const allReports = await this.getAllByProject(projectId);
    
    const todayStr = new Date().toISOString().split('T')[0];
    const todayReports = allReports.filter(r => r.date === todayStr);

    const pendingApprovals = allReports.filter(r => r.status === 'SUBMITTED' || r.status === 'REVIEWED').length;
    const totalDprs = allReports.length;
    const approvedDprs = allReports.filter(r => r.status === 'APPROVED').length;

    // Get all delays
    const allDprIds = allReports.map(r => r.id);
    let openDelaysCount = 0;
    if (allDprIds.length > 0) {
      const delays = await db
        .select()
        .from(dailyProgressDelays)
        .where(inArray(dailyProgressDelays.dprId, allDprIds));
      openDelaysCount = delays.filter(d => d.status === 'OPEN' || d.status === 'IN_PROGRESS').length;
    }

    return {
      totalDprs,
      approvedDprs,
      todayDprsCount: todayReports.length,
      pendingApprovals,
      openDelaysCount
    };
  }
}

export const dprRepository = new DprRepository();
