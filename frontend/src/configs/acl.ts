import { AbilityBuilder, Ability } from '@casl/ability';

export type Subjects = string
export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete'

export type AppAbility = Ability<[Actions, Subjects]> | undefined

export const AppAbility = Ability as any
export type ACLObj = {
  action: Actions
  subject: string
}

/**
 * Please define your own Ability rules according to your app requirements.
 * We have just shown Admin and Client rules for demo purpose where
 * admin can manage everything and client can just visit ACL page
 */
const defineRulesFor = (role: string, subject: string) => {
  const { can, rules } = new AbilityBuilder(AppAbility);


  if (role === 'Admin') {
    can(['create'], 'add-student-page');
    can(['read'], 'account-page');
    can(['read'], 'admin-activity-check-in-page');
    can(['read'], 'admin-report-check-in-daily-page');
    can(['read'], 'admin-report-check-in-monthly-page');
    can(['read'], 'admin-report-check-in-page');
    can(['read'], 'admin-report-check-in-weekly-page');
    can(['read'], 'history-page');
    can(['read'], 'home-page');
    can(['read'], 'manage-data');
    can(['read'], 'report-category');
    can(['read'], 'student-list-pages');
    can(['read'], 'student-page');
    can(['read'], 'teacher-list-pages');
    can(['read'], 'teacher-page');
    can(['read'], 'view-student-page');
    can(['update'], 'student-edit-page');
    can(['manage'], 'student-goodness-summary-report');
    can(['manage'], 'student-badness-summary-report');
    can(['read'], 'setting-system-page');
    can(['manage'], 'settings-classroom-list-pages');
    can(['manage'], 'settings-program-list-pages');
    can(['read'], 'calendar-page');
  } else if (role === 'Teacher') {
    can(['create'], 'add-student-page');
    can(['read', 'update'], 'account-settings');
    can(['read'], 'about-the-system');
    can(['read'], 'account-page');
    can(['read'], 'activity-check-in-page');
    can(['read'], 'check-in-page');
    can(['read'], 'daily-check-in-report-activity-page');
    can(['read'], 'history-page');
    can(['read'], 'home-page');
    can(['read'], 'manage-data');
    can(['read'], 'record-badness-page');
    can(['read'], 'record-goodness-page');
    can(['read'], 'report-badness-group-page');
    can(['read'], 'report-badness-page');
    can(['read'], 'report-category');
    can(['read'], 'report-check-in-daily-page');
    can(['read'], 'report-check-in-page');
    can(['read'], 'report-check-in-summary-page');
    can(['read'], 'report-goodness-page');
    can(['read'], 'student-list-pages');
    can(['read'], 'student-page');
    can(['read'], 'summary-check-in-report-activity-page');
    can(['read'], 'view-student-page');
    can(['update'], 'student-edit-page');
    can(['read'], 'student-goodness-summary-report');
    can(['read'], 'student-badness-summary-report');
    can(['read'], 'visit-student-page');
    can(['read'], 'visit-student-list-page');
    can(['create'], 'create-visit-student-page');
  } else if (role === 'Student') {
    can(['read'], 'student-academic-performance-report');
    can(['read'], 'student-badness-report');
    can(['read'], 'student-change-password');
    can(['read'], 'student-check-in-report');
    can(['read'], 'student-goodness-report');
    can(['read'], 'student-overview-page');
    can(['read'], 'student-sorting-goodness-report');
    can(['read'], 'student-goodness-summary-report');
    can(['read'], 'student-badness-summary-report');

  } else if (role === 'Parent') {
    can(['read'], 'home-page');
  } else {
    // User
    can(['read', 'create', 'update', 'delete'], subject);
  }

  return rules;
};

export const buildAbilityFor = (role: string, subject: string): AppAbility => {
  return new AppAbility(defineRulesFor(role, subject), {
    // https://casl.js.org/v5/en/guide/subject-type-detection
    detectSubjectType: (object: any) => object!.type
  })
}

export const defaultACLObj: ACLObj = {
  action: 'manage',
  subject: 'all',
};

export default defineRulesFor;
