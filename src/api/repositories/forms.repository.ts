import { db } from '../../db';
import { forms, formVersions, formFields, formSubmissions, formSubmissionHistory } from '../../db/schema';
import { eq, and, desc, like, or } from 'drizzle-orm';

export interface CreateFormDto {
  code: string;
  title: string;
  description?: string;
  moduleCode?: string;
  scopeType?: string;
  scopeId?: string;
  workflowCode?: string;
  category?: string;
  isTemplate?: boolean;
  fields: FormFieldDefinition[];
}

export interface FormFieldDefinition {
  fieldKey: string;
  label: string;
  fieldType: string; // TEXT, TEXTAREA, NUMBER, CURRENCY, PERCENTAGE, EMAIL, PHONE, PASSWORD, DATE, TIME, DATETIME, DROPDOWN, MULTI_SELECT, RADIO, CHECKBOX, SWITCH, FILE_UPLOAD, IMAGE_UPLOAD, DRAWING_UPLOAD, SIGNATURE, GPS_LOCATION, QR_CODE, BARCODE, RICH_TEXT, JSON, REPEATER, TABLE_GRID, SECTION, TAB, GROUP, DIVIDER, HEADING, LABEL, FORMULA, AUTO_NUMBER, REFERENCE_LOOKUP
  isRequired?: boolean;
  isReadOnly?: boolean;
  isHidden?: boolean;
  displayOrder?: number;
  width?: string;
  placeholder?: string;
  defaultValue?: string;
  options?: any[]; // for dropdown, radio, etc
  validation?: any;
}

export interface SubmitFormDto {
  formId: string;
  formVersionId?: string;
  moduleCode?: string;
  projectId?: string;
  departmentId?: string;
  workflowCode?: string;
  dataJson: Record<string, any>;
  attachmentsJson?: any;
  submittedByUserId: string;
  submittedByUserName: string;
  submittedByUserRole: string;
  status?: string;
}

export class FormsRepository {
  async ensureFormsSeeded() {
    const existing = await db.select().from(forms);
    if (existing.length === 0) {
      const now = new Date().toISOString();

      // Seed Default Site Sync Pro Form Templates
      const defaultForms = [
        {
          id: 'frm-qaqc-concrete',
          code: 'FORM_QAQC_CONCRETE_CHECKLIST',
          title: 'QA/QC Structural Concrete Pouring Checklist',
          description: 'Comprehensive QA/QC inspection before, during, and after concrete placement on construction sites.',
          moduleCode: 'QAQC',
          scopeType: 'GLOBAL',
          workflowCode: 'PO_APPROVAL',
          status: 'PUBLISHED',
          activeVersion: 1,
          category: 'INSPECTION',
          isTemplate: true,
          createdBy: 'SYSTEM',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'frm-hse-daily-audit',
          code: 'FORM_HSE_DAILY_SITE_INSPECTION',
          title: 'HSE Daily Site Safety & Hazard Audit',
          description: 'Health, Safety & Environment mandatory daily inspection log with GPS tag and photo attachment.',
          moduleCode: 'SAFETY',
          scopeType: 'GLOBAL',
          workflowCode: 'LEAVE_REQUEST_APPROVAL',
          status: 'PUBLISHED',
          activeVersion: 1,
          category: 'SAFETY',
          isTemplate: true,
          createdBy: 'SYSTEM',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'frm-proc-material-req',
          code: 'FORM_MATERIAL_REQUISITION_SLIP',
          title: 'Site Material Requisition & Release Form',
          description: 'On-site material request form linked to store inventory and project BOQ budgets.',
          moduleCode: 'PROCUREMENT',
          scopeType: 'GLOBAL',
          workflowCode: 'MATERIAL_REQUISITION_APPROVAL',
          status: 'PUBLISHED',
          activeVersion: 1,
          category: 'REQUISITION',
          isTemplate: true,
          createdBy: 'SYSTEM',
          createdAt: now,
          updatedAt: now,
        },
      ];

      for (const f of defaultForms) {
        await db.insert(forms).values(f).onConflictDoNothing();

        // Seed Version 1
        const verId = `fv-${f.id}-v1`;
        const defaultFields: FormFieldDefinition[] = [
          { fieldKey: 'inspectorName', label: 'Inspector Full Name', fieldType: 'TEXT', isRequired: true, displayOrder: 1, width: '50%' },
          { fieldKey: 'inspectionDate', label: 'Inspection Date & Time', fieldType: 'DATETIME', isRequired: true, displayOrder: 2, width: '50%' },
          { fieldKey: 'siteLocationGps', label: 'Site GPS Location', fieldType: 'GPS_LOCATION', isRequired: false, displayOrder: 3, width: '100%' },
          { fieldKey: 'complianceStatus', label: 'Compliance Grade', fieldType: 'DROPDOWN', isRequired: true, displayOrder: 4, width: '50%', options: [{ label: 'Pass', value: 'PASS' }, { label: 'Conditional Pass', value: 'CONDITIONAL' }, { label: 'Fail / Stop Work', value: 'FAIL' }] },
          { fieldKey: 'photoEvidence', label: 'Site Photo Evidence', fieldType: 'IMAGE_UPLOAD', isRequired: false, displayOrder: 5, width: '50%' },
          { fieldKey: 'remarks', label: 'Engineering Remarks & Defect Notes', fieldType: 'TEXTAREA', isRequired: false, displayOrder: 6, width: '100%' },
          { fieldKey: 'inspectorSignature', label: 'Digital Sign-off', fieldType: 'SIGNATURE', isRequired: true, displayOrder: 7, width: '100%' },
        ];

        await db.insert(formVersions).values({
          id: verId,
          formId: f.id,
          versionNumber: 1,
          status: 'PUBLISHED',
          changeLog: 'Initial published version',
          fieldsJson: defaultFields,
          publishedAt: now,
          createdAt: now,
        }).onConflictDoNothing();

        for (const fld of defaultFields) {
          await db.insert(formFields).values({
            id: `fld-${verId}-${fld.fieldKey}`,
            formVersionId: verId,
            formId: f.id,
            fieldKey: fld.fieldKey,
            label: fld.label,
            fieldType: fld.fieldType,
            isRequired: fld.isRequired || false,
            isReadOnly: fld.isReadOnly || false,
            isHidden: fld.isHidden || false,
            displayOrder: fld.displayOrder || 0,
            width: fld.width || '100%',
            optionsJson: fld.options || null,
            createdAt: now,
          }).onConflictDoNothing();
        }
      }
    }
  }

  // --- FORMS CRUD ---
  async getForms(moduleCode?: string, search?: string) {
    await this.ensureFormsSeeded();
    let query = db.select().from(forms);
    const conditions = [];

    if (moduleCode && moduleCode !== 'ALL') {
      conditions.push(eq(forms.moduleCode, moduleCode));
    }
    if (search) {
      conditions.push(or(like(forms.title, `%${search}%`), like(forms.code, `%${search}%`)));
    }

    if (conditions.length > 0) {
      return db.select().from(forms).where(and(...conditions)).orderBy(desc(forms.updatedAt));
    }
    return db.select().from(forms).orderBy(desc(forms.updatedAt));
  }

  async getFormById(id: string) {
    await this.ensureFormsSeeded();
    const [frm] = await db.select().from(forms).where(eq(forms.id, id));
    if (!frm) return null;

    // Fetch active version fields
    const versions = await db.select().from(formVersions).where(eq(formVersions.formId, id)).orderBy(desc(formVersions.versionNumber));
    const activeVer = versions.find((v) => v.versionNumber === frm.activeVersion) || versions[0] || null;

    return {
      ...frm,
      versions,
      activeVersionDetails: activeVer,
    };
  }

  async createForm(data: CreateFormDto) {
    const id = `frm-${Date.now()}`;
    const now = new Date().toISOString();
    const newForm = {
      id,
      code: data.code.toUpperCase().replace(/\s+/g, '_'),
      title: data.title,
      description: data.description || '',
      moduleCode: data.moduleCode || 'PROJECTS',
      scopeType: data.scopeType || 'GLOBAL',
      scopeId: data.scopeId || null,
      workflowCode: data.workflowCode || null,
      status: 'DRAFT',
      activeVersion: 1,
      category: data.category || 'INSPECTION',
      isTemplate: data.isTemplate || false,
      createdBy: 'ADMIN',
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(forms).values(newForm);

    // Version 1 creation
    const verId = `fv-${id}-v1`;
    await db.insert(formVersions).values({
      id: verId,
      formId: id,
      versionNumber: 1,
      status: 'DRAFT',
      changeLog: 'Initial draft creation',
      fieldsJson: data.fields || [],
      publishedAt: null,
      createdAt: now,
    });

    for (const fld of (data.fields || [])) {
      await db.insert(formFields).values({
        id: `fld-${verId}-${fld.fieldKey}`,
        formVersionId: verId,
        formId: id,
        fieldKey: fld.fieldKey,
        label: fld.label,
        fieldType: fld.fieldType,
        isRequired: fld.isRequired || false,
        isReadOnly: fld.isReadOnly || false,
        isHidden: fld.isHidden || false,
        displayOrder: fld.displayOrder || 0,
        width: fld.width || '100%',
        optionsJson: fld.options || null,
        createdAt: now,
      });
    }

    return this.getFormById(id);
  }

  async publishForm(id: string) {
    const now = new Date().toISOString();
    const frm = await this.getFormById(id);
    if (!frm) throw new Error('Form not found');

    await db.update(forms).set({ status: 'PUBLISHED', updatedAt: now }).where(eq(forms.id, id));
    if (frm.activeVersionDetails) {
      await db.update(formVersions).set({ status: 'PUBLISHED', publishedAt: now }).where(eq(formVersions.id, frm.activeVersionDetails.id));
    }
    return this.getFormById(id);
  }

  // --- SUBMISSIONS CRUD ---
  async getSubmissions(formId?: string, projectId?: string) {
    await this.ensureFormsSeeded();
    const conditions = [];
    if (formId) conditions.push(eq(formSubmissions.formId, formId));
    if (projectId) conditions.push(eq(formSubmissions.projectId, projectId));

    if (conditions.length > 0) {
      return db.select().from(formSubmissions).where(and(...conditions)).orderBy(desc(formSubmissions.createdAt));
    }
    return db.select().from(formSubmissions).orderBy(desc(formSubmissions.createdAt));
  }

  async submitForm(data: SubmitFormDto) {
    const id = `sub-${Date.now()}`;
    const subNumber = `SUB-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();

    const frm = await this.getFormById(data.formId);
    const verId = data.formVersionId || (frm?.activeVersionDetails?.id) || `fv-${data.formId}-v1`;

    const newSub = {
      id,
      formId: data.formId,
      formVersionId: verId,
      submissionNumber: subNumber,
      moduleCode: data.moduleCode || frm?.moduleCode || 'PROJECTS',
      projectId: data.projectId || null,
      departmentId: data.departmentId || null,
      workflowCode: data.workflowCode || frm?.workflowCode || null,
      workflowState: 'SUBMITTED',
      dataJson: data.dataJson,
      attachmentsJson: data.attachmentsJson || null,
      submittedByUserId: data.submittedByUserId,
      submittedByUserName: data.submittedByUserName,
      submittedByUserRole: data.submittedByUserRole,
      status: data.status || 'SUBMITTED',
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(formSubmissions).values(newSub);

    // Audit History Record
    await db.insert(formSubmissionHistory).values({
      id: `fsh-${Date.now()}`,
      submissionId: id,
      previousState: 'DRAFT',
      newState: 'SUBMITTED',
      actionTaken: 'Submit',
      performedByUserId: data.submittedByUserId,
      performedByUserName: data.submittedByUserName,
      comments: 'Dynamic Form submitted successfully',
      timestamp: now,
    });

    return newSub;
  }
}

export const formsRepository = new FormsRepository();
