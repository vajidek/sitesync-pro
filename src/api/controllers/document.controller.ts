import { Request, Response } from 'express';
import { documentService } from '../services/document.service';
import {
  createFolderSchema,
  updateFolderSchema,
  createDocumentSchema,
  updateDocumentSchema,
  createVersionSchema,
  checkinDocumentSchema,
  checkoutDocumentSchema,
  reviewDocumentSchema,
  approvalDocumentSchema,
  shareDocumentSchema,
} from '../validators/document.validator';

function getAuthenticatedActor(req: Request, res: Response): string | null {
  const user = (req as any).user;
  const actor = String(user?.name || user?.fullName || user?.email || '').trim();
  if (!actor) {
    res.status(401).json({ success: false, message: 'Authenticated document actor identity is required.' });
    return null;
  }
  return actor;
}
export class DocumentController {
  async getStats(req: Request, res: Response) {
    try {
      const stats = await documentService.getStats();
      res.json({ success: true, data: stats });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async getFolders(req: Request, res: Response) {
    try {
      const { projectId, parentId } = req.query;
      const folders = await documentService.getFolders(
        projectId as string,
        parentId === 'null' ? null : (parentId as string)
      );
      res.json({ success: true, count: folders.length, data: folders });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async getFolderById(req: Request, res: Response) {
    try {
      const folder = await documentService.getFolderById(req.params.id);
      res.json({ success: true, data: folder });
    } catch (e: any) {
      res.status(404).json({ success: false, message: e.message });
    }
  }

  async createFolder(req: Request, res: Response) {
    try {
      const user = getAuthenticatedActor(req, res);
      if (!user) return;
      const validated = createFolderSchema.parse(req.body);
      const folder = await documentService.createFolder({ ...validated, createdBy: user });
      res.status(201).json({ success: true, data: folder });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  async updateFolder(req: Request, res: Response) {
    try {
      const user = getAuthenticatedActor(req, res);
      if (!user) return;
      const validated = updateFolderSchema.parse(req.body);
      const folder = await documentService.updateFolder(req.params.id, { ...validated, updatedBy: user });
      res.json({ success: true, data: folder });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  async deleteFolder(req: Request, res: Response) {
    try {
      const user = getAuthenticatedActor(req, res);
      if (!user) return;
      await documentService.deleteFolder(req.params.id, user);
      res.json({ success: true, message: 'Folder deleted successfully' });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async getDocuments(req: Request, res: Response) {
    try {
      const { folderId, categoryId, search, workflowStatus, isFavorite, isArchived, projectId, isDeleted } = req.query;
      const docs = await documentService.getDocuments({
        folderId: folderId as string,
        categoryId: categoryId as string,
        search: search as string,
        workflowStatus: workflowStatus as string,
        isFavorite: isFavorite === 'true' ? true : isFavorite === 'false' ? false : undefined,
        isArchived: isArchived === 'true' ? true : isArchived === 'false' ? false : undefined,
        projectId: projectId as string,
        isDeleted: isDeleted === 'true' ? true : false,
      });
      res.json({ success: true, count: docs.length, data: docs });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async getDocumentById(req: Request, res: Response) {
    try {
      const doc = await documentService.getDocumentById(req.params.id);
      res.json({ success: true, data: doc });
    } catch (e: any) {
      res.status(404).json({ success: false, message: e.message });
    }
  }

  async createDocument(req: Request, res: Response) {
    try {
      const user = getAuthenticatedActor(req, res);
      if (!user) return;
      const validated = createDocumentSchema.parse(req.body);
      const doc = await documentService.createDocument({ ...validated, createdBy: user });
      res.status(201).json({ success: true, data: doc });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  async updateDocument(req: Request, res: Response) {
    try {
      const user = getAuthenticatedActor(req, res);
      if (!user) return;
      const validated = updateDocumentSchema.parse(req.body);
      const doc = await documentService.updateDocument(req.params.id, { ...validated, updatedBy: user });
      res.json({ success: true, data: doc });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  async deleteDocument(req: Request, res: Response) {
    try {
      const user = getAuthenticatedActor(req, res);
      if (!user) return;
      await documentService.deleteDocument(req.params.id, user);
      res.json({ success: true, message: 'Document soft deleted successfully' });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async toggleFavorite(req: Request, res: Response) {
    try {
      const user = getAuthenticatedActor(req, res);
      if (!user) return;
      const isFav = await documentService.toggleFavorite(req.params.id, user);
      res.json({ success: true, isFavorite: isFav });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async archiveDocument(req: Request, res: Response) {
    try {
      const { reason } = req.body;
      const user = getAuthenticatedActor(req, res);
      if (!user) return;
      if (!String(reason || '').trim()) {
        res.status(400).json({ success: false, message: 'Archive reason is required.' });
        return;
      }
      await documentService.archiveDocument(req.params.id, String(reason).trim(), user);
      res.json({ success: true, message: 'Document archived successfully' });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async restoreDocument(req: Request, res: Response) {
    try {
      const user = getAuthenticatedActor(req, res);
      if (!user) return;
      await documentService.restoreDocument(req.params.id, user);
      res.json({ success: true, message: 'Document restored successfully' });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async getVersions(req: Request, res: Response) {
    try {
      const versions = await documentService.getVersions(req.params.id);
      res.json({ success: true, count: versions.length, data: versions });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async createVersion(req: Request, res: Response) {
    try {
      const user = getAuthenticatedActor(req, res);
      if (!user) return;
      const validated = createVersionSchema.parse(req.body);
      const doc = await documentService.addVersion({ ...validated, uploadedBy: user });
      res.status(201).json({ success: true, data: doc });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  async checkinDocument(req: Request, res: Response) {
    try {
      const user = getAuthenticatedActor(req, res);
      if (!user) return;
      const validated = checkinDocumentSchema.parse(req.body);
      await documentService.checkinDocument(
        validated.documentId,
        user,
        validated.newVersionName,
        validated.fileUrl,
        validated.changeSummary
      );
      res.json({ success: true, message: 'Document checked in successfully' });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }
  async checkoutDocument(req: Request, res: Response) {
    try {
      const user = getAuthenticatedActor(req, res);
      if (!user) return;
      const validated = checkoutDocumentSchema.parse(req.body);
      await documentService.checkoutDocument(validated.documentId, user, validated.checkoutNotes, validated.expectedCheckInDate);
      res.json({ success: true, message: 'Document checked out successfully' });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  async reviewDocument(req: Request, res: Response) {
    try {
      const user = getAuthenticatedActor(req, res);
      if (!user) return;
      const validated = reviewDocumentSchema.parse(req.body);
      const review = {
        ...validated,
        reviewerName: user,
      };
      await documentService.reviewDocument(review);
      res.json({ success: true, message: 'Document review submitted successfully' });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  async approveDocument(req: Request, res: Response) {
    try {
      const user = getAuthenticatedActor(req, res);
      if (!user) return;
      const validated = approvalDocumentSchema.parse(req.body);
      await documentService.approveDocument({
        ...validated,
        approverName: user,
      });
      res.json({ success: true, message: 'Document approval decision logged successfully' });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  async getReviews(req: Request, res: Response) {
    try {
      const reviews = await documentService.getReviews(req.params.id);
      res.json({ success: true, count: reviews.length, data: reviews });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async getApprovals(req: Request, res: Response) {
    try {
      const approvals = await documentService.getApprovals(req.params.id);
      res.json({ success: true, count: approvals.length, data: approvals });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async searchDocuments(req: Request, res: Response) {
    try {
      const q = (req.query.q as string) || '';
      const results = await documentService.searchDocuments(q, req.query);
      res.json({ success: true, count: results.length, data: results });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async getAuditLogs(req: Request, res: Response) {
    try {
      const { documentId } = req.query;
      const logs = await documentService.getAuditLogs(documentId as string);
      res.json({ success: true, count: logs.length, data: logs });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async shareDocument(req: Request, res: Response) {
    try {
      const user = getAuthenticatedActor(req, res);
      if (!user) return;
      const validated = shareDocumentSchema.parse(req.body);
      const share = await documentService.shareDocument({ ...validated, createdBy: user });
      res.status(201).json({ success: true, data: share });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  async getShares(req: Request, res: Response) {
    try {
      const shares = await documentService.getShares(req.params.id);
      res.json({ success: true, count: shares.length, data: shares });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }
}
