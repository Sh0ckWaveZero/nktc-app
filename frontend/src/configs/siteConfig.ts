/**
 * Centralized Site & Institution Configuration
 * Allows dynamic white-labeling and environment-based configuration across the NKTC application.
 */
export const siteConfig = {
  acronym: 'COLLEGE',
  name: 'วิทยาลัย',
  nameEn: 'Technical College',
  securityEmail: 'security@college.ac.th',
  dataResidency: {
    primaryLocation: 'วิทยาลัย',
    primaryServer: 'วิทยาลัย Server',
    drRegion: 'ภูมิภาคเอเชียตะวันออกเฉียงใต้ (Southeast Asia Cloud Region)',
    backupSchedule: 'Automated Snapshots ทุก 15 นาที',
  },
  systemUptime: '99.98%',
  latestAuditCycle: 'มิถุนายน 2026 (Q2 2026 Audit Cycle)',
  latestAuditMonth: 'มิถุนายน 2026',
};

export default siteConfig;
