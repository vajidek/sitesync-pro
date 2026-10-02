import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { formsService } from '../services/forms.service';

export class FormsController {
  async getForms(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { moduleCode, search } = req.query;
      const result = await formsService.getForms(
        moduleCode ? String(moduleCode) : undefined,
        search ? String(search) : undefined
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getFormById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const form = await formsService.getFormById(id);
      if (!form) {
        return res.status(404).json({ success: false, message: 'Form not found' });
      }
      res.json({ success: true, data: form });
    } catch (err) {
      next(err);
    }
  }

  async createForm(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const form = await formsService.createForm(req.body);
      res.status(201).json({ success: true, data: form, message: 'Dynamic Form created' });
    } catch (err) {
      next(err);
    }
  }

  async publishForm(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const form = await formsService.publishForm(id);
      res.json({ success: true, data: form, message: 'Form published successfully' });
    } catch (err) {
      next(err);
    }
  }

  async getSubmissions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { formId, projectId } = req.query;
      const subs = await formsService.getSubmissions(
        formId ? String(formId) : undefined,
        projectId ? String(projectId) : undefined
      );
      res.json({ success: true, data: subs });
    } catch (err) {
      next(err);
    }
  }

  async submitForm(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      const submission = await formsService.submitForm({
        ...req.body,
        submittedByUserId: user?.id || 'usr-anon',
        submittedByUserName: user?.name || 'Site User',
        submittedByUserRole: user?.role || 'USER',
      });
      res.status(201).json({ success: true, data: submission, message: 'Form submitted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

export const formsController = new FormsController();
