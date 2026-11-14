import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import type { User, LinkItem } from './types';
import {
  getStoredUsers,
  saveUsers,
  getCurrentUserId,
  setCurrentUserId,
  getStoredLinks,
  saveLinks,
  checkIsAdmin,
} from './utils/storage';
import {
  subscribeToAuthChanges,
  logOutFromFirebase,
} from './firebase';
import { Header } from './components/Header';
import { ProfileSection } from './components/ProfileSection';
import { LinkCard } from './components/LinkCard';
import { EditProfileModal } from './components/EditProfileModal';
import { AddEditLinkModal } from './components/AddEditLinkModal';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { PublicPageView } from './components/PublicPageView';

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserIdState] = useState<string | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);

  // Modals & Edit Mode States
  const [isPublicView, setIsPublicView] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [isGoogleAuthOpen, setIsGoogleAuthOpen] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    const loadedUsers = getStoredUsers();
    const loadedUserId = getCurrentUserId();
    const loadedLinks = getStoredLinks();

    setUsers(loadedUsers);
    setCurrentUserIdState(loadedUserId);
    setLinks(loadedLinks);

    // Listen to Firebase Auth state
    const unsubscribe = subscribeToAuthChanges((fbUser) => {
      if (fbUser) {
        setUsers((prev) => {
          const exists = prev.some((u) => u.id === fbUser.id);
          if (exists) {
            return prev.map((u) => (u.id === fbUser.id ? { ...u, avatarUrl: fbUser.avatarUrl || u.avatarUrl } : u));
          }
          return [...prev, fbUser];
        });
        setCurrentUserIdState(fbUser.id);
        setCurrentUserId(fbUser.id);
      }
    });

    return () => unsubscribe();
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (users.length > 0) {
      saveUsers(users);
    }
  }, [users]);

  useEffect(() => {
    if (links.length > 0) {
      saveLinks(links);
    }
  }, [links]);

  const currentUser = currentUserId ? (users.find((u) => u.id === currentUserId) || null) : null;
  const isAdmin = checkIsAdmin(currentUser);

  // 기본 소유자 정보 (비로그인 방문자에게 보여질 기본 프로필)
  const ownerUser: User = users.find((u) => u.id === 'user_eunseok') || {
    id: 'user_eunseok',
    email: 'jes77552@gmail.com',
    name: '전은석',
    handle: '@jes77552',
    bio: '안녕하세요 전은석',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=jes77552&backgroundColor=e2e8f0',
  };

  // 화면에 표시할 프로필과 링크: 관리자 로그인 상태면 관리자 본인 프로필, 아니면 전은석의 공개 프로필
  const activeUser = (currentUser && isAdmin) ? currentUser : ownerUser;
  const activeUserId = activeUser.id;
  const displayedLinks = links.filter((l) => l.userId === activeUserId || l.userId === 'user_eunseok');

  // Switch active user
  const handleSwitchUser = (userId: string) => {
    setCurrentUserIdState(userId);
    setCurrentUserId(userId);
  };

  // Google OAuth Login / Registration Success
  const handleLoginSuccess = (user: User) => {
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === user.id);
      if (exists) {
        return prev.map((u) => (u.id === user.id ? user : u));
      }
      return [...prev, user];
    });

    setCurrentUserIdState(user.id);
    setCurrentUserId(user.id);
  };

  // Logout
  const handleLogout = async () => {
    try {
      await logOutFromFirebase();
    } catch (e) {
      console.error('Logout error:', e);
    }
    setCurrentUserIdState(null);
    setCurrentUserId(null);
    setIsEditMode(false);
  };

  // Update Profile (관리자만 가능)
  const handleUpdateProfile = (updated: Partial<User>) => {
    if (!isAdmin) {
      alert('관리자만 프로필을 수정할 수 있습니다.');
      return;
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === activeUser.id ? { ...u, ...updated } : u))
    );
  };

  // Save (Create or Update) Link (관리자만 가능)
  const handleSaveLink = (linkData: {
    id?: string;
    title: string;
    url: string;
    iconType: LinkItem['iconType'];
  }) => {
    if (!isAdmin) {
      alert('관리자만 링크를 추가하거나 수정할 수 있습니다.');
      return;
    }

    if (linkData.id) {
      // Update existing
      setLinks((prev) =>
        prev.map((l) =>
          l.id === linkData.id
            ? { ...l, title: linkData.title, url: linkData.url, iconType: linkData.iconType }
            : l
        )
      );
    } else {
      // Create new
      const newLink: LinkItem = {
        id: 'link_' + Date.now(),
        userId: activeUserId,
        title: linkData.title,
        url: linkData.url,
        iconType: linkData.iconType,
        clickCount: 0,
        createdAt: Date.now(),
      };
      setLinks((prev) => [newLink, ...prev]);
    }
  };

  // Delete Link (관리자만 가능)
  const handleDeleteLink = (linkId: string) => {
    if (!isAdmin) {
      alert('관리자만 링크를 삭제할 수 있습니다.');
      return;
    }
    if (window.confirm('이 링크를 정말 삭제하시겠습니까?')) {
      setLinks((prev) => prev.filter((l) => l.id !== linkId));
    }
  };

  // Increment Click Count
  const handleIncrementClick = (linkId: string) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === linkId ? { ...l, clickCount: l.clickCount + 1 } : l))
    );
  };

  // If Public Page Preview Mode is on
  if (isPublicView) {
    return (
      <PublicPageView
        user={activeUser}
        links={displayedLinks}
        onBackToAdmin={() => setIsPublicView(false)}
        onIncrementClick={handleIncrementClick}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      {/* Top Navigation */}
      <Header
        currentUser={currentUser}
        isAdmin={isAdmin}
        onOpenPublicPage={() => setIsPublicView(true)}
        onOpenAuthModal={() => setIsGoogleAuthOpen(true)}
        onOpenEditProfile={() => {
          setIsEditMode(true);
          setIsEditProfileOpen(true);
        }}
        onLogout={handleLogout}
        allUsers={users}
        onSwitchUser={handleSwitchUser}
      />

      {/* Main Body */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 pb-20">
        {/* Profile Section */}
        <ProfileSection
          user={activeUser}
          isAdmin={isAdmin}
          isEditMode={isEditMode}
          onToggleEditMode={() => setIsEditMode((prev) => !prev)}
          onEditProfile={() => setIsEditProfileOpen(true)}
          onOpenAddLink={() => {
            setEditingLink(null);
            setIsAddLinkOpen(true);
          }}
          onOpenAuthModal={() => setIsGoogleAuthOpen(true)}
        />

        {/* 프로필 수정을 눌렀을 때만 나타나는 '+ 새로운 링크 추가하기' 전용 버튼 */}
        {isAdmin && isEditMode && (
          <div className="mt-6 mb-2 animate-in fade-in slide-in-from-top-2 duration-150">
            <button
              onClick={() => {
                setEditingLink(null);
                setIsAddLinkOpen(true);
              }}
              className="w-full py-3.5 px-4 bg-white border-2 border-dashed border-blue-400 hover:border-blue-600 hover:bg-blue-50/50 text-blue-600 font-semibold rounded-xl flex items-center justify-center gap-2 transition shadow-xs group"
            >
              <Plus className="w-5 h-5 group-hover:scale-125 transition-transform" />
              <span>+ 새로운 링크 추가하기</span>
            </button>
          </div>
        )}

        {/* Links List */}
        <div className="space-y-3 mt-4">
          {displayedLinks.length === 0 ? (
            <div className="py-12 px-6 text-center bg-white rounded-md border border-gray-200 shadow-2xs">
              <p className="text-gray-500 text-sm font-medium">
                등록된 링크가 없습니다.
              </p>
              {isAdmin && (
                <p className="text-gray-400 text-xs mt-1">
                  위의 [프로필 수정] 버튼을 누른 후 [+ 새 링크 추가]를 눌러 링크를 추가할 수 있습니다.
                </p>
              )}
            </div>
          ) : (
            displayedLinks.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                onIncrementClick={handleIncrementClick}
                isEditable={isAdmin && isEditMode}
                onEdit={(item) => {
                  setEditingLink(item);
                  setIsAddLinkOpen(true);
                }}
                onDelete={handleDeleteLink}
              />
            ))
          )}
        </div>

        {/* Non-admin / Visitor Notice */}
        {!isAdmin && (
          <div className="mt-12 text-center">
            <p className="text-xs text-gray-400">
              방문자 모드로 조회 중입니다.
            </p>
            {!currentUser && (
              <button
                onClick={() => setIsGoogleAuthOpen(true)}
                className="mt-2 text-xs text-blue-600 font-medium hover:underline"
              >
                관리자로 로그인하여 프로필 및 링크 관리하기 →
              </button>
            )}
          </div>
        )}
      </main>

      {/* 새 링크 추가 / 수정 전용 모달 */}
      <AddEditLinkModal
        isOpen={isAddLinkOpen}
        onClose={() => {
          setIsAddLinkOpen(false);
          setEditingLink(null);
        }}
        onSave={(data) => {
          handleSaveLink({
            id: editingLink?.id,
            title: data.title,
            url: data.url,
            iconType: data.iconType,
          });
          setIsAddLinkOpen(false);
          setEditingLink(null);
        }}
        initialData={editingLink}
      />

      {/* 기본 프로필 정보(이름, 소개글, 사진) 변경 모달 */}
      {isAdmin && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          currentUser={activeUser}
          onSaveProfile={handleUpdateProfile}
          links={displayedLinks}
          onSaveLink={handleSaveLink}
          onDeleteLink={handleDeleteLink}
        />
      )}

      {/* Google / 이메일 관리자 인증 모달 */}
      <GoogleAuthModal
        isOpen={isGoogleAuthOpen}
        onClose={() => setIsGoogleAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        existingUsers={users}
        onOpenFirebaseConfig={() => {}}
      />
    </div>
  );
}
