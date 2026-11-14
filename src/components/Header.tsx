import React, { useState, useRef, useEffect } from 'react';
import { ExternalLink, LogIn, LogOut, User as UserIcon, UserCheck, PlusCircle } from 'lucide-react';
import type { User } from '../types';

interface HeaderProps {
  currentUser: User | null;
  isAdmin: boolean;
  onOpenPublicPage: () => void;
  onOpenAuthModal: () => void;
  onOpenEditProfile: () => void;
  onLogout: () => void;
  allUsers: User[];
  onSwitchUser: (userId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  isAdmin,
  onOpenPublicPage,
  onOpenAuthModal,
  onOpenEditProfile,
  onLogout,
  allUsers,
  onSwitchUser,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <span
            className="text-xl font-bold tracking-tight text-[#1a56db] cursor-pointer"
            onClick={() => window.location.reload()}
          >
            MyLink
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Public Page Button */}
          <button
            onClick={onOpenPublicPage}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white bg-[#1a56db] hover:bg-[#1648b7] rounded transition shadow-xs"
            title="다른 사용자들에게 보여지는 공개 링크트리 보기"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>내 페이지</span>
          </button>

          {/* User Profile or Login */}
          {currentUser ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-9 h-9 rounded-full border border-gray-200 overflow-hidden hover:ring-2 hover:ring-blue-400 transition flex items-center justify-center bg-gray-50 focus:outline-hidden"
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </button>

              {/* Dropdown Menu */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 text-left animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">{currentUser.name}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isAdmin ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {isAdmin ? '관리자' : '일반 사용자'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{currentUser.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[11px] font-mono bg-blue-50 text-blue-700 rounded">
                      {currentUser.handle}
                    </span>
                  </div>

                  <div className="py-1">
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onOpenEditProfile();
                        }}
                        className="w-full px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <UserIcon className="w-4 h-4 text-blue-600" />
                        프로필 편집
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenPublicPage();
                      }}
                      className="w-full px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                      내 페이지 바로가기
                    </button>
                  </div>

                  {/* Switch user section if multiple users */}
                  {allUsers.length > 1 && (
                    <div className="py-1 border-t border-gray-100">
                      <p className="px-4 py-1 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                        계정 전환
                      </p>
                      {allUsers.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            setMenuOpen(false);
                            onSwitchUser(u.id);
                          }}
                          className={`w-full px-4 py-1.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center justify-between ${
                            u.id === currentUser.id ? 'bg-blue-50/60 font-medium' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <img src={u.avatarUrl} alt="" className="w-5 h-5 rounded-full" />
                            <span className="truncate">{u.name}</span>
                          </div>
                          {u.id === currentUser.id && <UserCheck className="w-3.5 h-3.5 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="py-1 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenAuthModal();
                      }}
                      className="w-full px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4 text-blue-500" />
                      다른 계정 로그인 / 가입
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      로그아웃
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 shadow-2xs"
            >
              <LogIn className="w-4 h-4 text-blue-600" />
              <span>관리자 로그인</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
