export const BRANDING_CONFIG = {
  companyName: 'SiteSync Pro',
  companyShortName: 'SiteSync Pro',
  appName: 'SiteSync Pro',
  appFullName: 'SiteSync Pro',
  subtitle: 'Construction & Infrastructure Project Management Platform',
  version: '1.0.0',
  footerText: 'SiteSync Pro • Construction & Infrastructure Project Management Platform',
  developer: 'Abdul Vajid EK',
  developerRole: 'Product Architect',
  contactEmail: 'vajidek1@gmail.com',
  location: 'Kerala, India',
};

export const CREATOR_INFO = {
  name: BRANDING_CONFIG.developer,
  role: BRANDING_CONFIG.developerRole,
  bio: 'Creator of SiteSync Pro, focused on construction and infrastructure project operations, project controls, commercial workflows, ERP architecture, and digital field systems.',
  appName: BRANDING_CONFIG.appName,
  companyName: BRANDING_CONFIG.companyName,
  subtitle: BRANDING_CONFIG.subtitle,
  version: BRANDING_CONFIG.version,
  footerText: `Designed & Developed by ${BRANDING_CONFIG.developer}`,
  techStack: [
    'React 19 & TypeScript',
    'Tailwind CSS',
    'Node.js & Express',
    'PostgreSQL & Drizzle ORM',
    'Progressive Web App (PWA)',
  ],
  contact: {
    email: BRANDING_CONFIG.contactEmail,
    location: BRANDING_CONFIG.location,
  }
};
