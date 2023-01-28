import { AbilityBuilder, Ability } from '@casl/ability';

export type Role = 'Admin' | 'User' | 'Student' | 'Teacher' | 'Parent';
export type Subjects = string;
export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete';

export type AppAbility = Ability<[Actions, Subjects]> | undefined;

export const AppAbility = Ability as any;
export type ACLObj = {
  action: Actions;
  subject: string;
};

/**
 * Please define your own Ability rules according to your app requirements.
 * We have just shown Admin and Client rules for demo purpose where
 * admin can manage everything and client can just visit ACL page
 */
const defineRulesFor = (role: Role, subject: string) => {
  const { can, rules } = new AbilityBuilder(AppAbility);

  if (role === 'Admin') {
    can(['read'], 'home-page');
    can(['read'], 'manage-data');
    can(['read'], 'report-category');
    can(['read'], 'teacher-page');
    can(['read'], 'teacher-list-pages');
    can(['read'], 'student-page');
    can(['read'], 'student-list-pages');
    can(['read'], 'account-page');
    can(['read'], 'admin-report-check-in-page');
    can(['read'], 'admin-report-check-in-daily-page');
    can(['read'], 'admin-report-check-in-weekly-page');
    can(['read'], 'admin-report-check-in-monthly-page');
    can(['update'], 'student-edit-page');
    can(['create'], 'add-student-page');
    can(['read'], 'view-student-page');
    can(['read'], 'admin-activity-check-in-page');
  } else if (role === 'Teacher') {
    can(['read'], 'home-page');
    can(['read'], 'check-in-page');
    can(['read'], 'manage-data');
    can(['read'], 'account-page');
    can(['read'], 'report-category');
    can(['read'], 'report-check-in-page');
    can(['read'], 'report-check-in-daily-page');
    can(['read'], 'report-check-in-summary-page');
    can(['update'], 'student-edit-page');
    can(['read'], 'student-page');
    can(['read'], 'student-list-pages');
    can(['read', 'update'], 'account-settings');
    can(['create'], 'add-student-page');
    can(['read'], 'view-student-page');
    can(['read'], 'activity-check-in-page');
    can(['read'], 'daily-check-in-report-activity-page');
    can(['read'], 'summary-check-in-report-activity-page');
  } else if (role === 'Student') {
    can(['read'], 'home-page');
  } else if (role === 'Parent') {
    can(['read'], 'home-page');
  } else {
    // User
    can(['read', 'create', 'update', 'delete'], subject);
  }

  return rules;
};

export const buildAbilityFor = (role: Role, subject: string): AppAbility => {
  return new AppAbility(defineRulesFor(role, subject), {
    // https://casl.js.org/v5/en/guide/subject-type-detection
    detectSubjectType: (object: any) => object!.type,
  });
};

export const defaultACLObj: ACLObj = {
  action: 'manage',
  subject: 'all',
};

export default defineRulesFor;
