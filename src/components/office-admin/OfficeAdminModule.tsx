import React, { useState, useEffect } from 'react';
import { safeFetchJson } from '../../lib/safeFetch';
import {
  Building,
  Users,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  MapPin,
  Smartphone,
  Phone,
  Mail,
  UserCheck,
  Car,
  Briefcase,
  Layers,
  Send,
  Printer,
  Download,
  Filter,
  Check,
  Tag,
  Share2,
  CalendarDays,
  DoorOpen,
  FileSpreadsheet
} from 'lucide-react';
import { DSPageHeader, DSButton, DSTabs, DSCard, DSBadge, DSSearchBox, DSStatusChip } from '../ui/design-system';

export const OfficeAdminModule: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'visitors' | 'meetings' | 'notices' | 'serviceRequests'
  >('overview');

  const [loading, setLoading] = useState(false);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isBookMeetingModalOpen, setIsBookMeetingModalOpen] = useState(false);
  const [isPublishNoticeModalOpen, setIsPublishNoticeModalOpen] = useState(false);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [selectedMeetingForMoM, setSelectedMeetingForMoM] = useState<any | null>(null);
  const [momText, setMomText] = useState('');
  const [actionItemTask, setActionItemTask] = useState('');
  const [actionItemAssignee, setActionItemAssignee] = useState('');
  const [actionItemDueDate, setActionItemDueDate] = useState('');
  const [actionItemsList, setActionItemsList] = useState<any[]>([]);

  // Form states
  const [newVisitor, setNewVisitor] = useState({
    fullName: '',
    company: '',
    phone: '',
    email: '',
    hostEmployeeName: 'Abdul Vajid EK',
    hostDepartment: 'Executive Operations',
    purpose: 'MEETING',
    idProofType: 'NATIONAL_ID',
    idProofNumber: '',
    hasVehicle: false,
    vehiclePlateNumber: '',
    ndaSigned: true,
    securityNotes: '',
  });

  const [newMeeting, setNewMeeting] = useState({
    roomId: 'room-001',
    title: '',
    description: '',
    organizerName: 'Abdul Vajid EK',
    department: 'Executive Operations',
    meetingDate: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:30',
    agenda: 'Discussion of operational and project milestones',
    attendeesText: 'Abdul Vajid EK, Priya Sharma, Rajesh Nair',
  });

  const [newNotice, setNewNotice] = useState({
    title: '',
    category: 'CIRCULAR',
    priority: 'NORMAL',
    targetAudience: 'ALL',
    content: '',
    isPinned: false,
    requiresAcknowledgment: true,
  });

  const [newServiceRequest, setNewServiceRequest] = useState({
    category: 'VEHICLE_BOOKING',
    title: '',
    description: '',
    requesterName: 'Abdul Vajid EK',
    department: 'Executive Operations',
    priority: 'NORMAL',
    neededByDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    estimatedCost: 0,
    destination: '',
    durationHours: 4,
  });

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [vRes, rRes, mRes, nRes, sRes] = await Promise.all([
        safeFetchJson('/api/admin-services/visitors'),
        safeFetchJson('/api/admin-services/meeting-rooms'),
        safeFetchJson('/api/admin-services/meetings'),
        safeFetchJson('/api/admin-services/notices'),
        safeFetchJson('/api/admin-services/service-requests'),
      ]);

      if (vRes?.success && Array.isArray(vRes.data)) setVisitors(vRes.data);
      if (rRes?.success && Array.isArray(rRes.data)) setRooms(rRes.data);
      if (mRes?.success && Array.isArray(mRes.data)) setMeetings(mRes.data);
      if (nRes?.success && Array.isArray(nRes.data)) setNotices(nRes.data);
      if (sRes?.success && Array.isArray(sRes.data)) setServiceRequests(sRes.data);
    } catch (err) {
      console.error('Error fetching admin services data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleCheckInVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await safeFetchJson('/api/admin-services/visitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVisitor),
      });
      if (res?.success) {
        setIsCheckInModalOpen(false);
        setNewVisitor({
          fullName: '',
          company: '',
          phone: '',
          email: '',
          hostEmployeeName: 'Abdul Vajid EK',
          hostDepartment: 'Executive Operations',
          purpose: 'MEETING',
          idProofType: 'NATIONAL_ID',
          idProofNumber: '',
          hasVehicle: false,
          vehiclePlateNumber: '',
          ndaSigned: true,
          securityNotes: '',
        });
        fetchAdminData();
      }
    } catch (err) {
      console.error('Error checking in visitor:', err);
    }
  };

  const handleCheckOut = async (id: string) => {
    try {
      await safeFetchJson(`/api/admin-services/visitors/${id}/checkout`, { method: 'PUT' });
      fetchAdminData();
    } catch (err) {
      console.error('Error checking out visitor:', err);
    }
  };

  const handleBookMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const attendees = newMeeting.attendeesText
        .split(',')
        .map((name) => ({ name: name.trim(), email: `${name.trim().toLowerCase().replace(/\s+/g, '.')}@sitesyncpro.com` }));

      const res = await safeFetchJson('/api/admin-services/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: newMeeting.roomId,
          title: newMeeting.title,
          description: newMeeting.description,
          organizerName: newMeeting.organizerName,
          department: newMeeting.department,
          meetingDate: newMeeting.meetingDate,
          startTime: newMeeting.startTime,
          endTime: newMeeting.endTime,
          attendees,
          agendaItems: newMeeting.agenda.split('\n').filter(Boolean),
        }),
      });

      if (res?.success) {
        setIsBookMeetingModalOpen(false);
        setNewMeeting({
          roomId: 'room-001',
          title: '',
          description: '',
          organizerName: 'Abdul Vajid EK',
          department: 'Executive Operations',
          meetingDate: new Date().toISOString().split('T')[0],
          startTime: '10:00',
          endTime: '11:30',
          agenda: 'Discussion of operational and project milestones',
          attendeesText: 'Abdul Vajid EK, Priya Sharma, Rajesh Nair',
        });
        fetchAdminData();
      }
    } catch (err) {
      console.error('Error booking meeting:', err);
    }
  };

  const handleSaveMoM = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeetingForMoM) return;
    try {
      await safeFetchJson(`/api/admin-services/meetings/${selectedMeetingForMoM.id}/mom`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          minutesOfMeeting: momText,
          actionItems: actionItemsList,
        }),
      });
      setSelectedMeetingForMoM(null);
      fetchAdminData();
    } catch (err) {
      console.error('Error saving MoM:', err);
    }
  };

  const handlePublishNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await safeFetchJson('/api/admin-services/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotice),
      });
      if (res?.success) {
        setIsPublishNoticeModalOpen(false);
        setNewNotice({
          title: '',
          category: 'CIRCULAR',
          priority: 'NORMAL',
          targetAudience: 'ALL',
          content: '',
          isPinned: false,
          requiresAcknowledgment: true,
        });
        fetchAdminData();
      }
    } catch (err) {
      console.error('Error publishing notice:', err);
    }
  };

  const handleAcknowledgeNotice = async (id: string) => {
    try {
      await safeFetchJson(`/api/admin-services/notices/${id}/acknowledge`, { method: 'POST' });
      fetchAdminData();
    } catch (err) {
      console.error('Error acknowledging notice:', err);
    }
  };

  const handleSubmitServiceRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await safeFetchJson('/api/admin-services/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: newServiceRequest.category,
          title: newServiceRequest.title,
          description: newServiceRequest.description,
          requesterName: newServiceRequest.requesterName,
          department: newServiceRequest.department,
          priority: newServiceRequest.priority,
          neededByDate: newServiceRequest.neededByDate,
          estimatedCost: Number(newServiceRequest.estimatedCost) || 0,
          requestDetails: {
            destination: newServiceRequest.destination,
            durationHours: newServiceRequest.durationHours,
          },
        }),
      });
      if (res?.success) {
        setIsNewRequestModalOpen(false);
        setNewServiceRequest({
          category: 'VEHICLE_BOOKING',
          title: '',
          description: '',
          requesterName: 'Abdul Vajid EK',
          department: 'Executive Operations',
          priority: 'NORMAL',
          neededByDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          estimatedCost: 0,
          destination: '',
          durationHours: 4,
        });
        fetchAdminData();
      }
    } catch (err) {
      console.error('Error creating request:', err);
    }
  };

  const handleUpdateRequestStatus = async (id: string, status: string) => {
    try {
      await safeFetchJson(`/api/admin-services/service-requests/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, approverName: 'Abdul Vajid EK', remarks: `Approved & authorized via Administration console.` }),
      });
      fetchAdminData();
    } catch (err) {
      console.error('Error updating request status:', err);
    }
  };

  // KPI Calculations
  const checkedInVisitorsCount = visitors.filter((v) => v.status === 'CHECKED_IN').length;
  const scheduledMeetingsCount = meetings.filter((m) => m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS').length;
  const pendingRequestsCount = serviceRequests.filter((r) => r.status === 'SUBMITTED').length;
  const pinnedNoticesCount = notices.filter((n) => n.isPinned).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <DSPageHeader
        title="Office Administration & General Services"
        description="Comprehensive visitor management, conference room scheduling & MoM, official circulars, and corporate travel & facility requests"
        breadcrumbs={[{ label: 'ERP' }, { label: 'Corporate Services' }, { label: 'Office Admin' }]}
        actions={
          <div className="flex items-center gap-2">
            <DSButton variant="outline" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5 text-blue-600" />} onClick={fetchAdminData}>
              Refresh
            </DSButton>
            {activeSubTab === 'visitors' && (
              <DSButton variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsCheckInModalOpen(true)}>
                Issue Visitor Pass
              </DSButton>
            )}
            {activeSubTab === 'meetings' && (
              <DSButton variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsBookMeetingModalOpen(true)}>
                Book Meeting Room
              </DSButton>
            )}
            {activeSubTab === 'notices' && (
              <DSButton variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsPublishNoticeModalOpen(true)}>
                Publish Notice
              </DSButton>
            )}
            {activeSubTab === 'serviceRequests' && (
              <DSButton variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsNewRequestModalOpen(true)}>
                New Service Request
              </DSButton>
            )}
          </div>
        }
      />

      {/* Tabs */}
      <DSTabs
        activeTab={activeSubTab}
        onChange={(id) => setActiveSubTab(id as any)}
        tabs={[
          { id: 'overview', label: 'Administration Overview', icon: <Building className="w-4 h-4" /> },
          { id: 'visitors', label: `Visitor Management (${checkedInVisitorsCount} Active)`, icon: <Users className="w-4 h-4 text-emerald-500" /> },
          { id: 'meetings', label: `Meeting Rooms & MoM (${scheduledMeetingsCount})`, icon: <CalendarDays className="w-4 h-4 text-indigo-500" /> },
          { id: 'notices', label: `Circulars & Notices (${notices.length})`, icon: <FileText className="w-4 h-4 text-amber-500" /> },
          { id: 'serviceRequests', label: `Corporate Requests (${pendingRequestsCount} Pending)`, icon: <Briefcase className="w-4 h-4 text-cyan-500" /> },
        ]}
      />

      {/* 1. OVERVIEW TAB */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <DSCard className="p-4 bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Active Visitors on Site</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{checkedInVisitorsCount}</h3>
                  <p className="text-xs text-gray-500 mt-1">{visitors.length} total recorded today</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </DSCard>

            <DSCard className="p-4 bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-indigo-600 uppercase tracking-wider">Conference Rooms</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{rooms.length}</h3>
                  <p className="text-xs text-gray-500 mt-1">{scheduledMeetingsCount} scheduled sessions</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
            </DSCard>

            <DSCard className="p-4 bg-gradient-to-br from-amber-50 to-white border-amber-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">Official Notices</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{notices.length}</h3>
                  <p className="text-xs text-gray-500 mt-1">{pinnedNoticesCount} pinned statutory notices</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
            </DSCard>

            <DSCard className="p-4 bg-gradient-to-br from-cyan-50 to-white border-cyan-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-cyan-600 uppercase tracking-wider">Service Requests</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{serviceRequests.length}</h3>
                  <p className="text-xs text-gray-500 mt-1">{pendingRequestsCount} awaiting authorization</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center text-cyan-600">
                  <Car className="w-5 h-5" />
                </div>
              </div>
            </DSCard>
          </div>

          {/* Quick Actions & Live Status Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Visitors on Premises */}
            <DSCard className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  Active Visitors Currently on Premises
                </h4>
                <DSButton variant="ghost" size="sm" onClick={() => setActiveSubTab('visitors')}>
                  View All &rarr;
                </DSButton>
              </div>
              <div className="space-y-3">
                {visitors.filter((v) => v.status === 'CHECKED_IN').slice(0, 3).map((visitor) => (
                  <div key={visitor.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{visitor.fullName}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-mono">{visitor.badgeNumber}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{visitor.company} &bull; Host: {visitor.hostEmployeeName} ({visitor.hostDepartment})</p>
                    </div>
                    <DSButton variant="outline" size="xs" onClick={() => handleCheckOut(visitor.id)}>
                      Check Out
                    </DSButton>
                  </div>
                ))}
              </div>
            </DSCard>

            {/* Room Availability & Today's Schedule */}
            <DSCard className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Conference Rooms & Today's Schedule
                </h4>
                <DSButton variant="ghost" size="sm" onClick={() => setActiveSubTab('meetings')}>
                  Manage Rooms &rarr;
                </DSButton>
              </div>
              <div className="space-y-3">
                {rooms.map((room) => {
                  const currentMtg = meetings.find((m) => m.roomId === room.id && m.status === 'IN_PROGRESS');
                  return (
                    <div key={room.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{room.roomName}</span>
                          <span className="text-xs text-gray-500">Cap: {room.capacity} seats</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {currentMtg ? `In Progress: ${currentMtg.title}` : `Available &bull; ${room.floorLocation}`}
                        </p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${currentMtg ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {currentMtg ? 'Occupied' : 'Available'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </DSCard>
          </div>
        </div>
      )}

      {/* 2. VISITORS TAB */}
      {activeSubTab === 'visitors' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="w-full sm:w-80">
              <DSSearchBox
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search visitor, company, pass #..."
              />
            </div>
            <DSButton variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsCheckInModalOpen(true)}>
              Issue New Visitor Pass
            </DSButton>
          </div>

          <DSCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Pass & Badge</th>
                    <th className="px-4 py-3">Visitor Info</th>
                    <th className="px-4 py-3">Host Employee</th>
                    <th className="px-4 py-3">Purpose</th>
                    <th className="px-4 py-3">Check-In Time</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {visitors
                    .filter((v) =>
                      v.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      v.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      v.passNumber.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((visitor) => (
                      <tr key={visitor.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{visitor.passNumber}</div>
                          <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono font-semibold">
                            Badge: {visitor.badgeNumber}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{visitor.fullName}</div>
                          <div className="text-xs text-gray-500">{visitor.company} &bull; {visitor.phone}</div>
                          {visitor.vehiclePlateNumber && (
                            <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                              <Car className="w-3 h-3 text-gray-500" /> Vehicle: {visitor.vehiclePlateNumber}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{visitor.hostEmployeeName}</div>
                          <div className="text-xs text-gray-500">{visitor.hostDepartment}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                            {visitor.purpose}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          <div>{new Date(visitor.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          <div className="text-[11px] text-gray-400">{new Date(visitor.checkInTime).toLocaleDateString()}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            visitor.status === 'CHECKED_IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {visitor.status === 'CHECKED_IN' ? 'Checked In' : 'Checked Out'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {visitor.status === 'CHECKED_IN' ? (
                            <DSButton variant="outline" size="xs" onClick={() => handleCheckOut(visitor.id)}>
                              Check Out
                            </DSButton>
                          ) : (
                            <span className="text-xs text-gray-400">
                              Out: {new Date(visitor.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </DSCard>
        </div>
      )}

      {/* 3. MEETINGS & ROOMS TAB */}
      {activeSubTab === 'meetings' && (
        <div className="space-y-6">
          {/* Rooms Grid */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Meeting Facilities & Rooms</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {rooms.map((room) => (
                <DSCard key={room.id} className="p-4 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-semibold text-gray-900">{room.roomName}</h5>
                      <p className="text-xs text-gray-500">{room.floorLocation}</p>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      {room.capacity} Pax
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {Array.isArray(room.facilities) && room.facilities.map((fac: string, idx: number) => (
                      <span key={idx} className="text-[11px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {fac.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-emerald-600 font-medium">Ready for Reservation</span>
                    <DSButton
                      variant="ghost"
                      size="xs"
                      onClick={() => {
                        setNewMeeting((prev) => ({ ...prev, roomId: room.id }));
                        setIsBookMeetingModalOpen(true);
                      }}
                    >
                      Book &rarr;
                    </DSButton>
                  </div>
                </DSCard>
              ))}
            </div>
          </div>

          {/* Scheduled Meetings & Minutes of Meeting (MoM) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Scheduled Sessions & Minutes of Meeting (MoM)</h4>
              <DSButton variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsBookMeetingModalOpen(true)}>
                Schedule Meeting
              </DSButton>
            </div>

            <div className="space-y-4">
              {meetings.map((meeting) => (
                <DSCard key={meeting.id} className="p-5 border border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900 text-base">{meeting.title}</h4>
                        <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded font-mono font-medium">
                          {meeting.meetingCode}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          meeting.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                          meeting.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {meeting.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Room: <span className="font-medium text-gray-700">{meeting.roomName}</span> &bull; Organizer: {meeting.organizerName} ({meeting.department})
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-gray-900">{meeting.meetingDate}</div>
                      <div className="text-xs text-gray-500">{meeting.startTime} - {meeting.endTime}</div>
                    </div>
                  </div>

                  {/* Agenda items & attendees */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Agenda Items</p>
                      <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                        {Array.isArray(meeting.agendaItems) && meeting.agendaItems.map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Attendees</p>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.isArray(meeting.attendees) && meeting.attendees.map((att: any, i: number) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700 flex items-center gap-1">
                            {att.name} {att.isExternal && <span className="text-[10px] text-amber-600 font-bold">(Ext)</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* MoM Section */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-xs font-semibold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        Minutes of Meeting (MoM) & Action Items
                      </h5>
                      <DSButton
                        variant="outline"
                        size="xs"
                        onClick={() => {
                          setSelectedMeetingForMoM(meeting);
                          setMomText(meeting.minutesOfMeeting || '');
                          setActionItemsList(meeting.actionItems || []);
                        }}
                      >
                        {meeting.minutesOfMeeting ? 'Edit Minutes & Actions' : '+ Record MoM'}
                      </DSButton>
                    </div>

                    {meeting.minutesOfMeeting ? (
                      <div className="p-3 bg-blue-50/50 rounded border border-blue-100 text-xs text-gray-700">
                        <p className="whitespace-pre-line">{meeting.minutesOfMeeting}</p>
                        {Array.isArray(meeting.actionItems) && meeting.actionItems.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-blue-200/60">
                            <p className="font-semibold text-gray-800 mb-1">Agreed Action Items:</p>
                            <div className="space-y-1">
                              {meeting.actionItems.map((act: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between text-[11px] bg-white p-1.5 rounded border border-blue-100">
                                  <span>&bull; {act.task} (<span className="font-medium text-gray-800">{act.assignedTo}</span>)</span>
                                  <span className="text-gray-500">Due: {act.dueDate}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No minutes recorded yet. Click above to capture discussions and assign action deliverables.</p>
                    )}
                  </div>
                </DSCard>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. NOTICES & CIRCULARS TAB */}
      {activeSubTab === 'notices' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900 text-base">Corporate Circulars & Official Announcements</h4>
              <p className="text-xs text-gray-500">Company policies, safety directives, holiday circulars & regulatory notices</p>
            </div>
            <DSButton variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsPublishNoticeModalOpen(true)}>
              Publish Notice
            </DSButton>
          </div>

          <div className="space-y-4">
            {notices.map((notice) => (
              <DSCard key={notice.id} className={`p-5 border ${notice.isPinned ? 'border-amber-300 bg-amber-50/20' : 'border-gray-200'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    {notice.isPinned && (
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-xs">PINNED</span>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-mono font-medium">
                      {notice.noticeNumber}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      notice.priority === 'URGENT' ? 'bg-rose-100 text-rose-800' :
                      notice.priority === 'HIGH' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {notice.priority}
                    </span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">{notice.category}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Published: <span className="font-medium text-gray-700">{notice.publishDate}</span>
                  </div>
                </div>

                <div className="mt-3">
                  <h4 className="text-base font-bold text-gray-900 mb-2">{notice.title}</h4>
                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{notice.content}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-500">
                  <div>
                    Issued by: <span className="font-medium text-gray-800">{notice.authorName}</span> ({notice.authorRole})
                  </div>
                  <div className="flex items-center gap-3">
                    {notice.requiresAcknowledgment && (
                      <span className="text-gray-500">
                        Acknowledged by <strong className="text-gray-900">{notice.acknowledgmentsCount || 0}</strong> team members
                      </span>
                    )}
                    <DSButton variant="outline" size="xs" leftIcon={<Check className="w-3.5 h-3.5 text-emerald-600" />} onClick={() => handleAcknowledgeNotice(notice.id)}>
                      Acknowledge & Read
                    </DSButton>
                  </div>
                </div>
              </DSCard>
            ))}
          </div>
        </div>
      )}

      {/* 5. CORPORATE SERVICE REQUESTS TAB */}
      {activeSubTab === 'serviceRequests' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 text-base">Corporate Logistics & Administration Requests</h4>
              <p className="text-xs text-gray-500">Employee travel bookings, site fleet vehicles, stationery and general administration desk</p>
            </div>
            <DSButton variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsNewRequestModalOpen(true)}>
              Submit New Request
            </DSButton>
          </div>

          <DSCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Req #</th>
                    <th className="px-4 py-3">Category & Title</th>
                    <th className="px-4 py-3">Requester</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Needed By</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Workflow Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {serviceRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-gray-900">{req.requestNumber}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{req.title}</div>
                        <div className="text-xs text-gray-500">{req.category.replace(/_/g, ' ')} &bull; {req.description.substring(0, 70)}...</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{req.requesterName}</div>
                        <div className="text-xs text-gray-500">{req.department}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          req.priority === 'URGENT' ? 'bg-rose-100 text-rose-800' :
                          req.priority === 'HIGH' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {req.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700">{req.neededByDate}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                          req.status === 'IN_FULFILLMENT' ? 'bg-indigo-100 text-indigo-800' :
                          req.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {req.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {req.status === 'SUBMITTED' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <DSButton variant="primary" size="xs" onClick={() => handleUpdateRequestStatus(req.id, 'APPROVED')}>
                              Approve
                            </DSButton>
                            <DSButton variant="outline" size="xs" onClick={() => handleUpdateRequestStatus(req.id, 'REJECTED')}>
                              Reject
                            </DSButton>
                          </div>
                        ) : req.status === 'APPROVED' ? (
                          <DSButton variant="outline" size="xs" onClick={() => handleUpdateRequestStatus(req.id, 'IN_FULFILLMENT')}>
                            Mark In Fulfillment
                          </DSButton>
                        ) : req.status === 'IN_FULFILLMENT' ? (
                          <DSButton variant="primary" size="xs" onClick={() => handleUpdateRequestStatus(req.id, 'COMPLETED')}>
                            Complete Request
                          </DSButton>
                        ) : (
                          <span className="text-xs text-gray-400">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DSCard>
        </div>
      )}

      {/* --- MODAL 1: ISSUE VISITOR PASS --- */}
      {isCheckInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">Issue Security Visitor Pass</h3>
              <button onClick={() => setIsCheckInModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleCheckInVisitor} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Visitor Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newVisitor.fullName}
                    onChange={(e) => setNewVisitor({ ...newVisitor, fullName: e.target.value })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. Vikram Sengupta"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Company / Organization *</label>
                  <input
                    type="text"
                    required
                    value={newVisitor.company}
                    onChange={(e) => setNewVisitor({ ...newVisitor, company: e.target.value })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. Holcim ReadyMix Ltd"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Phone *</label>
                  <input
                    type="text"
                    required
                    value={newVisitor.phone}
                    onChange={(e) => setNewVisitor({ ...newVisitor, phone: e.target.value })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    placeholder="+91 98450 12345"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Visit Purpose</label>
                  <select
                    value={newVisitor.purpose}
                    onChange={(e) => setNewVisitor({ ...newVisitor, purpose: e.target.value })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="MEETING">Business Meeting</option>
                    <option value="AUDIT">Quality / HSE Audit</option>
                    <option value="CONTRACTOR">Contractor Execution</option>
                    <option value="INTERVIEW">Candidate Interview</option>
                    <option value="DELIVERY">Material Delivery</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Host Employee</label>
                  <input
                    type="text"
                    value={newVisitor.hostEmployeeName}
                    onChange={(e) => setNewVisitor({ ...newVisitor, hostEmployeeName: e.target.value })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Host Department</label>
                  <input
                    type="text"
                    value={newVisitor.hostDepartment}
                    onChange={(e) => setNewVisitor({ ...newVisitor, hostDepartment: e.target.value })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Vehicle Plate (Optional)</label>
                  <input
                    type="text"
                    value={newVisitor.vehiclePlateNumber}
                    onChange={(e) => setNewVisitor({ ...newVisitor, vehiclePlateNumber: e.target.value, hasVehicle: Boolean(e.target.value) })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. KL-07-CD-4190"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newVisitor.ndaSigned}
                      onChange={(e) => setNewVisitor({ ...newVisitor, ndaSigned: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    NDA / Confidentiality Signed
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-2">
                <DSButton variant="outline" size="sm" type="button" onClick={() => setIsCheckInModalOpen(false)}>
                  Cancel
                </DSButton>
                <DSButton variant="primary" size="sm" type="submit">
                  Generate Badge & Check In
                </DSButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: BOOK MEETING ROOM --- */}
      {isBookMeetingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">Book Conference Room</h3>
              <button onClick={() => setIsBookMeetingModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleBookMeeting} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Select Room *</label>
                <select
                  value={newMeeting.roomId}
                  onChange={(e) => setNewMeeting({ ...newMeeting, roomId: e.target.value })}
                  className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.roomName} ({r.floorLocation}) - Cap: {r.capacity}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Meeting Title *</label>
                <input
                  type="text"
                  required
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                  className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Metro Viaduct Pier Foundation Technical Sync"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={newMeeting.meetingDate}
                    onChange={(e) => setNewMeeting({ ...newMeeting, meetingDate: e.target.value })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={newMeeting.startTime}
                    onChange={(e) => setNewMeeting({ ...newMeeting, startTime: e.target.value })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">End Time *</label>
                  <input
                    type="time"
                    required
                    value={newMeeting.endTime}
                    onChange={(e) => setNewMeeting({ ...newMeeting, endTime: e.target.value })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Attendees (comma separated)</label>
                <input
                  type="text"
                  value={newMeeting.attendeesText}
                  onChange={(e) => setNewMeeting({ ...newMeeting, attendeesText: e.target.value })}
                  className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  placeholder="Abdul Vajid EK, Priya Sharma, Rajesh Nair"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Agenda Items (One per line)</label>
                <textarea
                  rows={3}
                  value={newMeeting.agenda}
                  onChange={(e) => setNewMeeting({ ...newMeeting, agenda: e.target.value })}
                  className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-2">
                <DSButton variant="outline" size="sm" type="button" onClick={() => setIsBookMeetingModalOpen(false)}>
                  Cancel
                </DSButton>
                <DSButton variant="primary" size="sm" type="submit">
                  Confirm Reservation
                </DSButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: RECORD MINUTES OF MEETING (MoM) --- */}
      {selectedMeetingForMoM && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Record Minutes of Meeting (MoM)</h3>
                <p className="text-xs text-gray-500">{selectedMeetingForMoM.title} ({selectedMeetingForMoM.meetingCode})</p>
              </div>
              <button onClick={() => setSelectedMeetingForMoM(null)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleSaveMoM} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Meeting Discussion Minutes *</label>
                <textarea
                  rows={4}
                  required
                  value={momText}
                  onChange={(e) => setMomText(e.target.value)}
                  className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  placeholder="Summarize key deliberations, decisions reached, and stakeholder agreements..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Add Action Deliverables</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={actionItemTask}
                    onChange={(e) => setActionItemTask(e.target.value)}
                    placeholder="Task description..."
                    className="flex-1 text-xs p-2 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={actionItemAssignee}
                    onChange={(e) => setActionItemAssignee(e.target.value)}
                    placeholder="Assigned to..."
                    className="w-36 text-xs p-2 border border-gray-300 rounded"
                  />
                  <input
                    type="date"
                    value={actionItemDueDate}
                    onChange={(e) => setActionItemDueDate(e.target.value)}
                    className="w-32 text-xs p-2 border border-gray-300 rounded"
                  />
                  <DSButton
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => {
                      if (actionItemTask && actionItemAssignee) {
                        setActionItemsList([
                          ...actionItemsList,
                          { task: actionItemTask, assignedTo: actionItemAssignee, dueDate: actionItemDueDate || '2026-09-30', status: 'PENDING' },
                        ]);
                        setActionItemTask('');
                        setActionItemAssignee('');
                      }
                    }}
                  >
                    Add
                  </DSButton>
                </div>

                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {actionItemsList.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded border border-gray-200">
                      <span>{item.task} (<strong className="text-gray-800">{item.assignedTo}</strong>)</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Due: {item.dueDate}</span>
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700 font-bold"
                          onClick={() => setActionItemsList(actionItemsList.filter((_, i) => i !== idx))}
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-2">
                <DSButton variant="outline" size="sm" type="button" onClick={() => setSelectedMeetingForMoM(null)}>
                  Cancel
                </DSButton>
                <DSButton variant="primary" size="sm" type="submit">
                  Save Minutes & Conclude Meeting
                </DSButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4: PUBLISH NOTICE --- */}
      {isPublishNoticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">Publish Official Notice / Circular</h3>
              <button onClick={() => setIsPublishNoticeModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handlePublishNotice} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Notice Headline *</label>
                <input
                  type="text"
                  required
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Safety Alert: Monsoon Protocol for Tower Cranes"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={newNotice.category}
                    onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="CIRCULAR">Administrative Circular</option>
                    <option value="SAFETY_ALERT">HSE Safety Alert</option>
                    <option value="POLICY">Statutory Policy Update</option>
                    <option value="HOLIDAY">Holiday Calendar</option>
                    <option value="ANNOUNCEMENT">Corporate Announcement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Priority</label>
                  <select
                    value={newNotice.priority}
                    onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent / Action Required</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Notice Content *</label>
                <textarea
                  rows={4}
                  required
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                  className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter detailed notification or policy instructions..."
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newNotice.isPinned}
                    onChange={(e) => setNewNotice({ ...newNotice, isPinned: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  Pin to Top of Dashboard
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newNotice.requiresAcknowledgment}
                    onChange={(e) => setNewNotice({ ...newNotice, requiresAcknowledgment: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  Require Read Acknowledgment
                </label>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-2">
                <DSButton variant="outline" size="sm" type="button" onClick={() => setIsPublishNoticeModalOpen(false)}>
                  Cancel
                </DSButton>
                <DSButton variant="primary" size="sm" type="submit">
                  Publish to Organization
                </DSButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 5: SUBMIT SERVICE REQUEST --- */}
      {isNewRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">New Corporate Logistics Request</h3>
              <button onClick={() => setIsNewRequestModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleSubmitServiceRequest} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Service Type *</label>
                  <select
                    value={newServiceRequest.category}
                    onChange={(e) => setNewServiceRequest({ ...newServiceRequest, category: e.target.value })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="VEHICLE_BOOKING">Site Vehicle Dispatch</option>
                    <option value="TRAVEL">Flight & Hotel Travel</option>
                    <option value="STATIONERY">Office & CAD Stationery</option>
                    <option value="COURIER">Courier & Document Dispatch</option>
                    <option value="OFFICE_MAINTENANCE">Office Facility Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Priority</label>
                  <select
                    value={newServiceRequest.priority}
                    onChange={(e) => setNewServiceRequest({ ...newServiceRequest, priority: e.target.value })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Request Title *</label>
                <input
                  type="text"
                  required
                  value={newServiceRequest.title}
                  onChange={(e) => setNewServiceRequest({ ...newServiceRequest, title: e.target.value })}
                  className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. 4x4 Pickup dispatch for concrete sampling"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Detailed Description & Justification *</label>
                <textarea
                  rows={3}
                  required
                  value={newServiceRequest.description}
                  onChange={(e) => setNewServiceRequest({ ...newServiceRequest, description: e.target.value })}
                  className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  placeholder="Provide full details, locations, or passenger counts..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Needed By Date *</label>
                  <input
                    type="date"
                    required
                    value={newServiceRequest.neededByDate}
                    onChange={(e) => setNewServiceRequest({ ...newServiceRequest, neededByDate: e.target.value })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Estimated Budget (USD / AED)</label>
                  <input
                    type="number"
                    value={newServiceRequest.estimatedCost}
                    onChange={(e) => setNewServiceRequest({ ...newServiceRequest, estimatedCost: Number(e.target.value) })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-2">
                <DSButton variant="outline" size="sm" type="button" onClick={() => setIsNewRequestModalOpen(false)}>
                  Cancel
                </DSButton>
                <DSButton variant="primary" size="sm" type="submit">
                  Submit Request for Approval
                </DSButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
