export type UserRole = 'student' | 'lecturer';

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  student: 'University Student',
  lecturer: 'University Lecturer',
};

export type Profile = {
  id: string;
  fullName: string;
  universityId: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl: string | null;
};
