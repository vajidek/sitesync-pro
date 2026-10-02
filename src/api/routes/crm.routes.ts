import { Router } from 'express';
import { CRMController } from '../controllers/crm.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';

const router = Router();
const controller = new CRMController();

// JWT & RBAC Middleware
router.use(authenticateJWT);
router.use(requireRoles('ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR'));

// Overview Stats
router.get('/stats', controller.getStats.bind(controller));

// Customers
router.get('/customers', controller.getCustomers.bind(controller));
router.get('/customers/:id', controller.getCustomerById.bind(controller));
router.post('/customers', controller.createCustomer.bind(controller));

// Leads
router.get('/leads', controller.getLeads.bind(controller));
router.post('/leads', controller.createLead.bind(controller));
router.post('/leads/:id/convert', controller.convertLead.bind(controller));

// Opportunities
router.get('/opportunities', controller.getOpportunities.bind(controller));
router.post('/opportunities', controller.createOpportunity.bind(controller));

// Complaints
router.get('/complaints', controller.getComplaints.bind(controller));
router.post('/complaints', controller.createComplaint.bind(controller));

// Support Tickets
router.get('/tickets', controller.getTickets.bind(controller));
router.post('/tickets', controller.createTicket.bind(controller));
router.get('/tickets/:id/comments', controller.getTicketComments.bind(controller));
router.post('/tickets/comments', controller.addTicketComment.bind(controller));

// Support Alias
router.get('/support', controller.getTickets.bind(controller));
router.post('/support', controller.createTicket.bind(controller));

// Feedback
router.get('/feedback', controller.getFeedback.bind(controller));
router.post('/feedback', controller.createFeedback.bind(controller));

// Meetings
router.get('/meetings', controller.getMeetings.bind(controller));
router.post('/meetings', controller.createMeeting.bind(controller));

// Followups
router.get('/followups', controller.getFollowups.bind(controller));
router.post('/followups', controller.createFollowup.bind(controller));

// Client Portal Dashboard
router.get('/portal/dashboard', controller.getPortalDashboard.bind(controller));

export default router;
