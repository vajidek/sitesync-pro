import React, { useMemo, useState } from 'react';

export type HseOperationalRecordType =
  | 'toolbox'
  | 'inspections'
  | 'ppe'
  | 'training'
  | 'drills'
  | 'fire'
  | 'environmental'
  | 'waste';

type FieldKind = 'text' | 'date' | 'number' | 'textarea' | 'select';

interface FieldConfig {
  name: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  step?: string;
  min?: number;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  helper?: string;
}

const recordConfig: Record<HseOperationalRecordType, {
  title: string;
  endpoint: string;
  fields: FieldConfig[];
}> = {
  toolbox: {
    title: 'Record Toolbox Talk',
    endpoint: '/api/hse/toolbox-talks',
    fields: [
      { name: 'topic', label: 'Topic', kind: 'text', required: true, placeholder: 'Toolbox talk subject' },
      { name: 'location', label: 'Location', kind: 'text', required: true, placeholder: 'Site / work area' },
      { name: 'talkDate', label: 'Date', kind: 'date', required: true },
      { name: 'attendeesCount', label: 'Attendees', kind: 'number', required: true, min: 0, step: '1' },
      { name: 'keyPoints', label: 'Key Points', kind: 'textarea', required: true, placeholder: 'Main safety points discussed' },
      { name: 'attendeesList', label: 'Attendee Details', kind: 'textarea', placeholder: 'Names, crew, or employee IDs' },
    ],
  },
  inspections: {
    title: 'Record Safety Inspection',
    endpoint: '/api/hse/safety-inspections',
    fields: [
      { name: 'inspectionType', label: 'Inspection Type', kind: 'select', required: true, options: [
        { value: 'DAILY_WALKTHROUGH', label: 'Daily Walkthrough' },
        { value: 'WEEKLY_SITE', label: 'Weekly Site' },
        { value: 'SCAFFOLDING', label: 'Scaffolding' },
        { value: 'HEAVY_EQUIPMENT', label: 'Heavy Equipment' },
        { value: 'FIRE_SAFETY', label: 'Fire Safety' },
      ]},
      { name: 'location', label: 'Location', kind: 'text', required: true, placeholder: 'Site / area' },
      { name: 'inspectionDate', label: 'Date', kind: 'date', required: true },
      { name: 'totalItemsChecked', label: 'Items Checked', kind: 'number', required: true, min: 1, step: '1' },
      { name: 'compliantItems', label: 'Compliant', kind: 'number', required: true, min: 0, step: '1' },
      { name: 'nonCompliantItems', label: 'Non-compliant', kind: 'number', required: true, min: 0, step: '1' },
      { name: 'findings', label: 'Findings / Actions', kind: 'textarea', placeholder: 'Inspection findings and required corrective actions' },
    ],
  },
  ppe: {
    title: 'Record PPE Issuance',
    endpoint: '/api/hse/ppe',
    fields: [
      { name: 'employeeId', label: 'Employee ID', kind: 'text', required: true, placeholder: 'Employee ID' },
      { name: 'employeeName', label: 'Employee Name', kind: 'text', required: true, placeholder: 'Employee name' },
      { name: 'department', label: 'Department', kind: 'text', required: true, placeholder: 'Department / crew' },
      { name: 'ppeItem', label: 'PPE Item', kind: 'text', required: true, placeholder: 'Helmet, harness, gloves, etc.' },
      { name: 'quantity', label: 'Quantity', kind: 'number', required: true, min: 1, step: '1' },
      { name: 'issueDate', label: 'Issue Date', kind: 'date', required: true },
      { name: 'expiryDate', label: 'Expiry Date', kind: 'date' },
      { name: 'condition', label: 'Condition', kind: 'select', required: true, options: [
        { value: 'NEW', label: 'New' },
        { value: 'REPLACEMENT', label: 'Replacement' },
        { value: 'REPAIRED', label: 'Repaired' },
      ]},
    ],
  },
  training: {
    title: 'Record HSE Training',
    endpoint: '/api/hse/training',
    fields: [
      { name: 'courseName', label: 'Course / Training', kind: 'text', required: true, placeholder: 'Training title' },
      { name: 'trainerName', label: 'Trainer', kind: 'text', required: true, placeholder: 'Trainer / training provider' },
      { name: 'trainingDate', label: 'Training Date', kind: 'date', required: true },
      { name: 'validityMonths', label: 'Validity (months)', kind: 'number', required: true, min: 1, step: '1' },
      { name: 'participantsCount', label: 'Participants', kind: 'number', required: true, min: 1, step: '1' },
      { name: 'participantsList', label: 'Participants', kind: 'textarea', placeholder: 'Employee names / IDs' },
    ],
  },
  drills: {
    title: 'Record Emergency Drill',
    endpoint: '/api/hse/drills',
    fields: [
      { name: 'drillType', label: 'Drill Type', kind: 'select', required: true, options: [
        { value: 'FIRE_EVACUATION', label: 'Fire Evacuation' },
        { value: 'CHEMICAL_SPILL', label: 'Chemical Spill' },
        { value: 'MEDICAL_EMERGENCY', label: 'Medical Emergency' },
        { value: 'CONFINED_SPACE_RESCUE', label: 'Confined Space Rescue' },
      ]},
      { name: 'location', label: 'Location', kind: 'text', required: true, placeholder: 'Assembly area / work location' },
      { name: 'drillDate', label: 'Drill Date', kind: 'date', required: true },
      { name: 'evacuationTimeSeconds', label: 'Evacuation Time (seconds)', kind: 'number', required: true, min: 1, step: '1' },
      { name: 'participantsCount', label: 'Participants', kind: 'number', required: true, min: 1, step: '1' },
      { name: 'performanceRating', label: 'Performance', kind: 'select', required: true, options: [
        { value: 'EXCELLENT', label: 'Excellent' },
        { value: 'SATISFACTORY', label: 'Satisfactory' },
        { value: 'NEEDS_IMPROVEMENT', label: 'Needs Improvement' },
        { value: 'UNACCEPTABLE', label: 'Unacceptable' },
      ]},
      { name: 'recommendations', label: 'Recommendations', kind: 'textarea', placeholder: 'Corrective / follow-up actions' },
    ],
  },
  fire: {
    title: 'Register Fire Equipment',
    endpoint: '/api/hse/fire-equipment',
    fields: [
      { name: 'equipmentTag', label: 'Equipment Tag', kind: 'text', required: true, placeholder: 'Unique equipment tag' },
      { name: 'equipmentType', label: 'Equipment Type', kind: 'select', required: true, options: [
        { value: 'FIRE_EXTINGUISHER_CO2', label: 'CO₂ Fire Extinguisher' },
        { value: 'FIRE_EXTINGUISHER_DCP', label: 'DCP Fire Extinguisher' },
        { value: 'FIRE_HOSE_REEL', label: 'Fire Hose Reel' },
        { value: 'FIRE_BLANKET', label: 'Fire Blanket' },
        { value: 'SMOKE_DETECTOR', label: 'Smoke Detector' },
      ]},
      { name: 'location', label: 'Location', kind: 'text', required: true, placeholder: 'Installed location' },
      { name: 'lastInspectionDate', label: 'Last Inspection', kind: 'date', required: true },
      { name: 'nextInspectionDue', label: 'Next Inspection Due', kind: 'date', required: true },
      { name: 'pressureStatus', label: 'Pressure', kind: 'select', required: true, options: [
        { value: 'NORMAL', label: 'Normal' },
        { value: 'LOW', label: 'Low' },
        { value: 'OVERCHARGED', label: 'Overcharged' },
      ]},
      { name: 'physicalCondition', label: 'Physical Condition', kind: 'select', required: true, options: [
        { value: 'GOOD', label: 'Good' },
        { value: 'DAMAGED', label: 'Damaged' },
        { value: 'EXPIRED', label: 'Expired' },
      ]},
      { name: 'status', label: 'Status', kind: 'select', required: true, options: [
        { value: 'OPERATIONAL', label: 'Operational' },
        { value: 'REFILL_REQUIRED', label: 'Refill Required' },
        { value: 'OUT_OF_SERVICE', label: 'Out of Service' },
      ]},
    ],
  },
  environmental: {
    title: 'Record Environmental Monitoring',
    endpoint: '/api/hse/environment',
    fields: [
      { name: 'location', label: 'Location', kind: 'text', required: true, placeholder: 'Monitoring point' },
      { name: 'parameter', label: 'Parameter', kind: 'select', required: true, options: [
        { value: 'NOISE_LEVEL', label: 'Noise Level' },
        { value: 'AIR_QUALITY_PM25', label: 'Air Quality PM2.5' },
        { value: 'WATER_TURBIDITY', label: 'Water Turbidity' },
        { value: 'DUST_EMISSION', label: 'Dust Emission' },
        { value: 'AMBIENT_TEMP', label: 'Ambient Temperature' },
      ]},
      { name: 'measuredValue', label: 'Measured Value', kind: 'number', required: true, step: '0.01' },
      { name: 'unit', label: 'Unit', kind: 'text', required: true, placeholder: 'dBA, ug/m³, NTU, °C...' },
      { name: 'permissibleLimit', label: 'Permissible Limit', kind: 'number', required: true, min: 0, step: '0.01' },
      { name: 'monitoringDate', label: 'Monitoring Date', kind: 'date', required: true },
    ],
  },
  waste: {
    title: 'Record Waste Manifest',
    endpoint: '/api/hse/waste',
    fields: [
      { name: 'wasteCategory', label: 'Waste Category', kind: 'select', required: true, options: [
        { value: 'HAZARDOUS', label: 'Hazardous' },
        { value: 'NON_HAZARDOUS', label: 'Non-hazardous' },
        { value: 'E_WASTE', label: 'E-waste' },
        { value: 'CONSTRUCTION_DEBRIS', label: 'Construction Debris' },
        { value: 'SEWAGE', label: 'Sewage' },
      ]},
      { name: 'wasteType', label: 'Waste Type', kind: 'text', required: true, placeholder: 'Used oil, concrete rubble, scrap, etc.' },
      { name: 'quantityKg', label: 'Quantity (kg)', kind: 'number', required: true, min: 0.01, step: '0.01' },
      { name: 'disposalMethod', label: 'Disposal Method', kind: 'select', required: true, options: [
        { value: 'AUTHORIZED_RECYCLER', label: 'Authorized Recycler' },
        { value: 'LANDFILL', label: 'Landfill' },
        { value: 'INCINERATION', label: 'Incineration' },
        { value: 'MUNICIPAL', label: 'Municipal' },
      ]},
      { name: 'approvedContractor', label: 'Approved Contractor', kind: 'text', required: true, placeholder: 'Authorized waste contractor' },
      { name: 'disposalDate', label: 'Planned / Disposal Date', kind: 'date', required: true },
      { name: 'certificateRef', label: 'Certificate Reference', kind: 'text', placeholder: 'Enter after disposal where applicable' },
    ],
  },
};

function initialValue(kind: FieldKind): string {
  if (kind === 'date') return new Date().toISOString().split('T')[0];
  return '';
}

export const HseOperationalRecordModal: React.FC<{
  type: HseOperationalRecordType;
  onClose: () => void;
  onCreated: () => Promise<void> | void;
}> = ({ type, onClose, onCreated }) => {
  const config = recordConfig[type];
  const initial = useMemo(() => Object.fromEntries(config.fields.map((field) => [field.name, initialValue(field.kind)])), [config]);
  const [form, setForm] = useState<Record<string, string>>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (name: string, value: string) => setForm((current) => ({ ...current, [name]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    const payload: Record<string, unknown> = {};
    for (const field of config.fields) {
      const value = form[field.name] ?? '';
      if (field.required && !String(value).trim()) {
        setError(field.label + ' is required.');
        setSaving(false);
        return;
      }
      if (field.kind === 'number') {
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || (field.min !== undefined && parsed < field.min)) {
          setError(field.label + ' must be a valid number.');
          setSaving(false);
          return;
        }
        payload[field.name] = parsed;
      } else {
        payload[field.name] = value.trim();
      }
    }

    try {
      const token = localStorage.getItem('token') || '';
      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.message || 'Unable to save this HSE record.');
      }

      await onCreated();
      onClose();
    } catch (submitError: any) {
      setError(submitError?.message || 'Unable to save this HSE record.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">HSE Record</p>
            <h3 className="text-lg font-bold text-slate-900">{config.title}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Close</button>
        </div>

        <form onSubmit={submit} className="space-y-4 p-5">
          {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</div>}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {config.fields.map((field) => (
              <div key={field.name} className={field.kind === 'textarea' ? 'md:col-span-2' : ''}>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  {field.label}{field.required ? ' *' : ''}
                </label>

                {field.kind === 'textarea' ? (
                  <textarea
                    value={form[field.name] || ''}
                    onChange={(e) => update(field.name, e.target.value)}
                    required={field.required}
                    rows={4}
                    placeholder={field.placeholder}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                ) : field.kind === 'select' ? (
                  <select
                    value={form[field.name] || ''}
                    onChange={(e) => update(field.name, e.target.value)}
                    required={field.required}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="">Select {field.label}</option>
                    {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                ) : (
                  <input
                    type={field.kind}
                    value={form[field.name] || ''}
                    onChange={(e) => update(field.name, e.target.value)}
                    required={field.required}
                    min={field.min}
                    step={field.step}
                    placeholder={field.placeholder}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                )}

                {field.helper && <p className="mt-1 text-[11px] text-slate-500">{field.helper}</p>}
              </div>
            ))}
          </div>

          {type === 'inspections' && (
            <p className="text-xs text-slate-500">
              Inspection outcome is calculated and validated by the server from the compliant and non-compliant counts.
            </p>
          )}
          {type === 'environmental' && (
            <p className="text-xs text-slate-500">
              Compliance is derived from the measured value versus the permissible limit; it is not manually selectable.
            </p>
          )}
          {type === 'waste' && (
            <p className="text-xs text-slate-500">
              New manifests start at <span className="font-semibold">Stored on Site</span>. Disposal completion is a controlled later step.
            </p>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
            <button type="button" onClick={onClose} disabled={saving} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
