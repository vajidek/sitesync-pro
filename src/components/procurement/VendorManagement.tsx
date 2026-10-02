import React, { useState } from 'react';
import { Vendor, VendorCategory, VendorStatus } from '../../types/procurement';
import { 
  Building2, 
  Plus, 
  Search, 
  Star, 
  ShieldCheck, 
  FileText, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  Award, 
  CheckCircle2, 
  Clock, 
  X,
  Edit2,
  Trash2,
  ChevronDown
} from 'lucide-react';

interface VendorManagementProps {
  vendors: Vendor[];
  onAddVendor: (vendor: Partial<Vendor>) => void;
  onUpdateVendor: (id: string, vendor: Partial<Vendor>) => void;
  onDeleteVendor: (id: string) => void;
}

export const VendorManagement: React.FC<VendorManagementProps> = ({
  vendors,
  onAddVendor,
  onUpdateVendor,
  onDeleteVendor
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVendorForDetails, setSelectedVendorForDetails] = useState<Vendor | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'Civil & Structural Materials' as VendorCategory,
    gstin: '',
    pan: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    contactDesignation: 'Sales Manager',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branchName: '',
    paymentTerms: 'Net 30 Days',
    creditPeriodDays: 30,
    status: 'Approved' as VendorStatus
  });

  const categories: VendorCategory[] = [
    'Civil & Structural Materials',
    'Mechanical & Piping Components',
    'Electrical & Instrumentation',
    'Heavy Equipment & Rental',
    'Subcontracting Services',
    'Safety & Consumables',
    'Fuel & Lubricants'
  ];

  const filteredVendors = vendors.filter((v) => {
    const matchesSearch = 
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vendorCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.gstin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.pan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || v.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || v.status === selectedStatus;
    return matchesSearch && matchesCat && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.gstin) return;

    onAddVendor({
      name: formData.name,
      category: formData.category,
      gstin: formData.gstin,
      pan: formData.pan,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      paymentTerms: formData.paymentTerms,
      creditPeriodDays: Number(formData.creditPeriodDays),
      status: formData.status,
      contactPersons: [
        {
          id: `cp_${Date.now()}`,
          name: formData.contactName || 'Primary Contact',
          email: formData.contactEmail || 'contact@vendor.com',
          phone: formData.contactPhone || '+91 90000 00000',
          designation: formData.contactDesignation
        }
      ],
      bankDetails: {
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
        branchName: formData.branchName
      }
    });

    setIsModalOpen(false);
    setFormData({
      name: '',
      category: 'Civil & Structural Materials',
      gstin: '',
      pan: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      contactDesignation: 'Sales Manager',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      branchName: '',
      paymentTerms: 'Net 30 Days',
      creditPeriodDays: 30,
      status: 'Approved'
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <span>Approved Vendor Directory & Master Register</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete vendor records, GSTIN/PAN compliance, credit terms & quality rating histories
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard New Vendor</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search vendor name, code, GSTIN, PAN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Compliance Statuses</option>
            <option value="Approved">Approved Only</option>
            <option value="Pending Audit">Pending Audit</option>
            <option value="Suspended">Suspended</option>
            <option value="Blacklisted">Blacklisted</option>
          </select>
        </div>
      </div>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVendors.map((vendor) => (
          <div
            key={vendor.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                    {vendor.vendorCode}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1.5 leading-snug">
                    {vendor.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{vendor.category}</p>
                </div>

                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider border ${
                  vendor.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800' :
                  vendor.status === 'Pending Audit' ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800' :
                  'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
                }`}>
                  {vendor.status}
                </span>
              </div>

              {/* GSTIN / PAN & Rating */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">GSTIN</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{vendor.gstin}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">PAN</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{vendor.pan}</span>
                </div>
              </div>

              {/* Rating & Performance Metrics */}
              <div className="mt-3 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Performance Rating:</span>
                  <div className="flex items-center space-x-1 font-bold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{vendor.rating} / 5.0</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>On-Time Delivery:</span>
                  <strong className="text-slate-700 dark:text-slate-300">{vendor.performance?.onTimeDeliveryRate}%</strong>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Quality Compliance:</span>
                  <strong className="text-slate-700 dark:text-slate-300">{vendor.performance?.qualityComplianceRate}%</strong>
                </div>
              </div>

              {/* Contact & Terms */}
              <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                {vendor.contactPersons[0] && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{vendor.contactPersons[0].name} ({vendor.contactPersons[0].phone})</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>Terms: <strong>{vendor.paymentTerms}</strong> ({vendor.creditPeriodDays} Days Credit)</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setSelectedVendorForDetails(vendor)}
                className="text-blue-600 dark:text-blue-400 font-bold text-xs hover:underline flex items-center space-x-1"
              >
                <span>View Full Profile</span>
              </button>
              <button
                onClick={() => onDeleteVendor(vendor.id)}
                className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Onboard Vendor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <span>Onboard New Vendor Entry</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Vendor / Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Larsen Steel & Infra Ltd"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as VendorCategory })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">GSTIN Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="27AAACL1234H1Z5"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">PAN Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="AAACL1234H"
                    value={formData.pan}
                    onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg font-mono uppercase"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Address</label>
                <input
                  type="text"
                  placeholder="Plot 42, Heavy Industrial Area, Thane"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Pincode</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* Contact Person */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
                <h4 className="font-bold text-slate-300 mb-2">Primary Contact Person</h4>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Contact Name"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Designation"
                    value={formData.contactDesignation}
                    onChange={(e) => setFormData({ ...formData, contactDesignation: e.target.value })}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                  />
                </div>
              </div>

              {/* Bank Details */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
                <h4 className="font-bold text-slate-300 mb-2">Bank Account & Commercial Terms</h4>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Bank Name (e.g. HDFC)"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Account Number"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg font-mono"
                  />
                  <input
                    type="text"
                    placeholder="IFSC Code"
                    value={formData.ifscCode}
                    onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg font-mono uppercase"
                  />
                  <input
                    type="text"
                    placeholder="Payment Terms (e.g. Net 30 Days)"
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-md"
                >
                  Save & Register Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vendor Details Modal */}
      {selectedVendorForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 p-6 space-y-6 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="font-mono text-blue-600 font-bold">{selectedVendorForDetails.vendorCode}</span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedVendorForDetails.name}</h3>
                <p className="text-slate-500">{selectedVendorForDetails.category}</p>
              </div>
              <button
                onClick={() => setSelectedVendorForDetails(null)}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <p className="text-slate-400">GSTIN:</p>
                <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedVendorForDetails.gstin}</p>
              </div>
              <div>
                <p className="text-slate-400">PAN:</p>
                <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedVendorForDetails.pan}</p>
              </div>
              <div>
                <p className="text-slate-400">Registered Address:</p>
                <p className="text-slate-800 dark:text-slate-200">{selectedVendorForDetails.address}, {selectedVendorForDetails.city}, {selectedVendorForDetails.state} - {selectedVendorForDetails.pincode}</p>
              </div>
              <div>
                <p className="text-slate-400">Commercial Credit Period:</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">{selectedVendorForDetails.paymentTerms} ({selectedVendorForDetails.creditPeriodDays} Days)</p>
              </div>
            </div>

            {/* Bank details */}
            <div>
              <h4 className="font-bold text-slate-300 text-sm mb-2">Bank Account Mandate Details</h4>
              <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 font-mono">
                <div><span className="text-slate-400 block text-[10px]">Bank:</span>{selectedVendorForDetails.bankDetails.bankName}</div>
                <div><span className="text-slate-400 block text-[10px]">A/C No:</span>{selectedVendorForDetails.bankDetails.accountNumber}</div>
                <div><span className="text-slate-400 block text-[10px]">IFSC:</span>{selectedVendorForDetails.bankDetails.ifscCode}</div>
              </div>
            </div>

            {/* Performance History */}
            <div>
              <h4 className="font-bold text-slate-300 text-sm mb-2">Performance Audit History</h4>
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <p className="text-slate-300">{selectedVendorForDetails.performance?.remarks}</p>
                <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>Total Fulfilled Orders: <strong>{selectedVendorForDetails.performance?.totalOrders}</strong></span>
                  <span>Last Audit: <strong>{selectedVendorForDetails.performance?.lastEvaluatedDate}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
