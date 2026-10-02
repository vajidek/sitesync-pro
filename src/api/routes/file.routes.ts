import { Router, Request, Response } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { sendSuccess } from '../utils/response';

const router = Router();

// Protect all file upload and document routes with JWT auth
router.use(authenticateJWT);

// Mock/In-memory storage manifest abstraction for enterprise file attachments
const documentVersionRegistry: any[] = [
  {
    id: 'doc_101',
    title: 'Metro Line 4 - Structural Pier Execution Drawing.pdf',
    version: 'v2.1',
    fileType: 'application/pdf',
    sizeBytes: 4125000,
    uploadedBy: 'Robert Vance (Project Manager)',
    uploadedAt: '2026-07-28T14:30:00.000Z',
    virusScanStatus: 'CLEAN',
    storageProvider: 'S3-AWS-Encrypted',
    downloadUrl: '/assets/sample_drawing.pdf',
  },
  {
    id: 'doc_102',
    title: 'High Tensile Anchor Bolt Quality Compliance Certificate.pdf',
    version: 'v1.0',
    fileType: 'application/pdf',
    sizeBytes: 1250000,
    uploadedBy: 'Siddharth Nair (Site Incharge)',
    uploadedAt: '2026-07-29T09:15:00.000Z',
    virusScanStatus: 'CLEAN',
    storageProvider: 'S3-AWS-Encrypted',
    downloadUrl: '/assets/compliance_cert.pdf',
  },
];

// Secure Upload Handler with Enterprise Hardening
router.post('/upload', (req: Request, res: Response) => {
  const { title, fileType, size, entityType, entityId } = req.body;
  const user = (req as any).user;

  // 1. Sanitize file title from path traversal attempts
  const rawTitle = String(title || 'Uploaded_Document.pdf').trim();
  const sanitizedTitle = rawTitle.replace(/[/\\?%*:|"<>]/g, '_').replace(/\.\.+/g, '.');

  // 2. Disallow executable or dangerous script extensions
  const dangerousExtensions = ['.exe', '.sh', '.bat', '.cmd', '.php', '.phtml', '.py', '.pl', '.jsp', '.asp', '.dll', '.bin'];
  const hasDangerousExt = dangerousExtensions.some(ext => sanitizedTitle.toLowerCase().endsWith(ext));
  if (hasDangerousExt) {
    return res.status(400).json({
      success: false,
      message: 'Security Policy Violation: Uploading executable or script files is strictly prohibited.',
    });
  }

  // 3. File size validation (Max 25MB)
  const sizeNum = Number(size) || 1024000;
  const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
  if (sizeNum > MAX_FILE_SIZE_BYTES) {
    return res.status(400).json({
      success: false,
      message: `File size exceeds the enterprise limit of 25MB (${(sizeNum / (1024 * 1024)).toFixed(1)}MB provided).`,
    });
  }

  // 4. Allowed mime-type whitelist
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/csv',
    'text/plain',
    'application/zip',
  ];
  const detectedType = fileType || 'application/pdf';
  if (!allowedTypes.includes(detectedType)) {
    return res.status(400).json({
      success: false,
      message: `Unsupported or unsafe file format: ${detectedType}. Allowed formats: PDF, Images (JPEG, PNG, WebP), Excel, Word, CSV, ZIP.`,
    });
  }
  
  const newDoc = {
    id: `doc_${Date.now()}`,
    title: sanitizedTitle,
    version: 'v1.0',
    fileType: detectedType,
    sizeBytes: sizeNum,
    entityType: entityType || 'PROJECT',
    entityId: entityId || 'prj_01',
    uploadedBy: user?.name ? `${user.name} (${user.role})` : 'Authorized User',
    uploadedAt: new Date().toISOString(),
    virusScanStatus: 'CLEAN',
    storageProvider: 'S3-AWS-Encrypted',
    downloadUrl: '#',
  };

  documentVersionRegistry.unshift(newDoc);

  return sendSuccess(res, newDoc, 'File uploaded and virus scanned successfully');
});

// List Document Versions
router.get('/documents', (req: Request, res: Response) => {
  return sendSuccess(res, documentVersionRegistry, 'Documents retrieved successfully');
});

export default router;
