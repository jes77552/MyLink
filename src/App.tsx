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
} from './utils/storage';
import {
  subscribeToAuthChanges,
  logOutFromFirebase,
} from './firebase';
import { Header } from './components/Header';
import { ProfileSection } from './components/ProfileSection';
import { LinkCard } from './components/LinkCard';
import { AddEditLinkModal } from './components/AddEditLinkModal';
import { EditProfileModal } from './components/EditProfileModal';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { PublicPageView } from './components/PublicPageView';

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserIdState] = useState<string | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);

  // Modals & Views
  const [isPublicView, setIsPublicView] = useState(false);
  const [isAddEditLinkOpen, setIsAddEditLinkOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
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

  // Filter links belonging to the current user
  const userLinks = currentUser ? links.filter((l) => l.userId === currentUser.id) : [];

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
  };

  // Update Profile
  const handleUpdateProfile = (updated: Partial<User>) => {
    if (!currentUser) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, ...updated } : u))
    );
  };

  // Save (Create or Update) Link
  const handleSaveLink = (linkData: {
    title: string;
    url: string;
    iconType: LinkItem['iconType'];
  }) => {
    if (!currentUser) return;

    if (editingLink) {
      // Update existing
      setLinks((prev) =>
        prev.map((l) =>
          l.id === editingLink.id
            ? { ...l, ...linkData }
            : l
        )
      );
    } else {
      // Create new
      const newLink: LinkItem = {
        id: 'link_' + Date.now(),
        userId: currentUser.id,
        title: linkData.title,
        url: linkData.url,
        iconType: linkData.iconType,
        clickCount: 0,
        createdAt: Date.now(),
      };
      setLinks((prev) => [newLink, ...prev]);
    }
    setEditingLink(null);
  };

  // Delete Link
  const handleDeleteLink = (linkId: string) => {
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
  if (isPublicView && currentUser) {
    return (
      <PublicPageView
        user={currentUser}
        links={userLinks}
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
        onOpenPublicPage={() => setIsPublicView(true)}
        onOpenAuthModal={() => setIsGoogleAuthOpen(true)}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
        onLogout={handleLogout}
        allUsers={users}
        onSwitchUser={handleSwitchUser}
      />

      {/* Main Body */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 pb-20">
        {currentUser ? (
          <>
            {/* Profile Section */}
            <ProfileSection
              user={currentUser}
              onEditProfile={() => setIsEditProfileOpen(true)}
              isEditable={true}
            />

            {/* "+ 새로운 링크 추가하기" Blue Button */}
            <div className="mt-6 mb-4">
              <button
                onClick={() => {
                  setEditingLink(null);
                  setIsAddEditLinkOpen(true);
                }}
                className="w-full py-3.5 px-4 bg-[#1a56db] hover:bg-[#1648b7] text-white text-sm sm:text-base font-semibold rounded-md shadow-xs flex items-center justify-center gap-2 transition duration-150 cursor-pointer active:scale-[0.99]"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>새로운 링크 추가하기</span>
              </button>
            </div>

            {/* Links List */}
            <div className="space-y-3 mt-4">
              {userLinks.length === 0 ? (
                <div className="py-12 px-6 text-center bg-white rounded-md border border-gray-200 shadow-2xs">
                  <p className="text-gray-500 text-sm font-medium">
                    등록된 링크가 없습니다.
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    위의 '+ 새로운 링크 추가하기' 버튼을 눌러 첫 링크를 추가해보세요!
                  </p>
                </div>
              ) : (
                userLinks.map((link) => (
                  <LinkCard
                    key={link.id}
                    link={link}
                    onEdit={(item) => {
                      setEditingLink(item);
                      setIsAddEditLinkOpen(true);
                    }}
                    onDelete={handleDeleteLink}
                    onIncrementClick={handleIncrementClick}
                    isEditable={true}
                  />
                ))
              )}
            </div>
          </>
        ) : (
          /* Empty / Logged out view */
          <div className="mt-16 text-center py-12 px-6 bg-white rounded-3xl border border-gray-200/80 shadow-sm max-w-md mx-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">로그인이 필요합니다</h2>
            <p className="text-xs sm:text-sm text-gray-500 mb-6 leading-relaxed">
              Google 계정으로 로그인하시면 나만의 프로필과 링크를<br />자유롭게 만들고 관리할 수 있습니다.
            </p>
            <div className="space-y-2.5">
              <button
                onClick={() => setIsGoogleAuthOpen(true)}
                className="w-full py-3 bg-[#1a56db] hover:bg-[#1648b7] text-white text-sm font-semibold rounded-xl shadow-xs transition"
              >
                Google 계정으로 로그인
              </button>
              {users.length > 0 && (
                <button
                  onClick={() => handleSwitchUser(users[0].id)}
                  className="w-full py-2.5 text-xs text-gray-600 hover:text-gray-900 font-medium hover:bg-gray-50 rounded-xl transition border border-gray-200"
                >
                  기존 프로필({users[0].name})로 둘러보기
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <AddEditLinkModal
        isOpen={isAddEditLinkOpen}
        onClose={() => {
          setIsAddEditLinkOpen(false);
          setEditingLink(null);
        }}
        onSave={handleSaveLink}
        initialData={editingLink}
      />

      {currentUser && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          currentUser={currentUser}
          onSave={handleUpdateProfile}
        />
      )}

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
