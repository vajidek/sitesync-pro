import { Router } from 'express';
import { numberingService } from '../services/numbering.service';
import { DocumentEntityType } from '../repositories/numbering.repository';

const router = Router();

// GET /api/numbering/preview/:entityType
router.get('/preview/:entityType', async (req, res) => {
  try {
    const { entityType } = req.params;
    const { companyId, branchId, projectId, date, manualNumber } = req.query;

    const preview = await numberingService.peekNextNumber({
      entityType: entityType.toUpperCase() as DocumentEntityType,
      companyId: companyId as string,
      branchId: branchId as string,
      projectId: projectId as string,
      date: date as string,
      manualNumber: manualNumber as string,
    });

    res.json({
      success: true,
      data: {
        entityType: entityType.toUpperCase(),
        previewNumber: preview,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to preview document number',
    });
  }
});

// POST /api/numbering/allocate/:entityType
router.post('/allocate/:entityType', async (req, res) => {
  try {
    const { entityType } = req.params;
    const { companyId, branchId, projectId, date, manualNumber, allocatedBy } = req.body;

    const allocation = await numberingService.getNextNumber({
      entityType: entityType.toUpperCase() as DocumentEntityType,
      companyId,
      branchId,
      projectId,
      date,
      manualNumber,
      allocatedBy: allocatedBy || (req as any).user?.username || 'SYSTEM',
    });

    res.json({
      success: true,
      data: allocation,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to allocate document number',
    });
  }
});

// GET /api/numbering/policy/:entityType
router.get('/policy/:entityType', async (req, res) => {
  try {
    const { entityType } = req.params;
    const { companyId } = req.query;

    const policy = await numberingService.getPolicy(
      entityType.toUpperCase(),
      companyId as string
    );

    res.json({
      success: true,
      data: policy,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to retrieve numbering policy',
    });
  }
});

// POST /api/numbering/policy/:entityType
router.post('/policy/:entityType', async (req, res) => {
  try {
    const { entityType } = req.params;
    const policyData = req.body;

    const updated = await numberingService.configurePolicy({
      ...policyData,
      entityType: entityType.toUpperCase(),
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update numbering policy',
    });
  }
});

export default router;
