export interface User {
  id: string;
  email: string;
  name: string;
  handle: string;
  bio: string;
  avatarUrl: string;
}

export interface LinkItem {
  id: string;
  userId: string;
  title: string;
  url: string;
  iconType: 'github' | 'google' | 'instagram' | 'youtube' | 'twitter' | 'linkedin' | 'globe';
  clickCount: number;
  createdAt: number;
}
