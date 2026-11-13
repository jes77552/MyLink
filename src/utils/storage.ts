import type { User, LinkItem } from '../types';

const USERS_STORAGE_KEY = 'mylink_users_v2';
const CURRENT_USER_KEY = 'mylink_current_user_id_v2';
const LINKS_STORAGE_KEY = 'mylink_links_v2';

// 기본 사용자: 전은석 (@jes77552)
const DEFAULT_USER: User = {
  id: 'user_eunseok',
  email: 'jes77552@gmail.com',
  name: '전은석',
  handle: '@jes77552',
  bio: '안녕하세요 전은석',
  avatarUrl: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=jes77552&backgroundColor=e2e8f0',
};

// 기본 링크: 깃허브
const DEFAULT_LINKS: LinkItem[] = [
  {
    id: 'link_github_initial',
    userId: 'user_eunseok',
    title: '깃허브',
    url: 'https://github.com/jes77552/MyLink',
    iconType: 'github',
    clickCount: 0,
    createdAt: Date.now(),
  },
];

export const getStoredUsers = (): User[] => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([DEFAULT_USER]));
      return [DEFAULT_USER];
    }
    const users = JSON.parse(raw);
    if (!users || users.length === 0) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([DEFAULT_USER]));
      return [DEFAULT_USER];
    }
    return users;
  } catch (e) {
    console.error('Failed to load users from localStorage', e);
    return [DEFAULT_USER];
  }
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

export const getCurrentUserId = (): string | null => {
  const current = localStorage.getItem(CURRENT_USER_KEY);
  if (current === 'LOGGED_OUT') return null;
  if (current) return current;
  // 첫 방문 시 기본값으로 DEFAULT_USER 설정
  localStorage.setItem(CURRENT_USER_KEY, DEFAULT_USER.id);
  return DEFAULT_USER.id;
};

export const setCurrentUserId = (userId: string | null) => {
  if (userId) {
    localStorage.setItem(CURRENT_USER_KEY, userId);
  } else {
    localStorage.setItem(CURRENT_USER_KEY, 'LOGGED_OUT');
  }
};

export const getStoredLinks = (): LinkItem[] => {
  try {
    const raw = localStorage.getItem(LINKS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LINKS_STORAGE_KEY, JSON.stringify(DEFAULT_LINKS));
      return DEFAULT_LINKS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load links from localStorage', e);
    return DEFAULT_LINKS;
  }
};

export const saveLinks = (links: LinkItem[]) => {
  localStorage.setItem(LINKS_STORAGE_KEY, JSON.stringify(links));
};

export const detectIconType = (url: string): LinkItem['iconType'] => {
  const lower = url.toLowerCase();
  if (lower.includes('github.com')) return 'github';
  if (lower.includes('google.com') || lower.includes('goo.gl')) return 'google';
  if (lower.includes('instagram.com')) return 'instagram';
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  if (lower.includes('twitter.com') || lower.includes('x.com')) return 'twitter';
  if (lower.includes('linkedin.com')) return 'linkedin';
  return 'globe';
};
