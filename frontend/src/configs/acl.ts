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
    can('manage', 'all');
  } else if (role === 'Teacher') {
    can('manage', 'all');
  } else if (role === 'Student') {
    can(['read'], 'acl-page');
  } else if (role === 'Parent') {
    can(['read'], 'acl-page');
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
