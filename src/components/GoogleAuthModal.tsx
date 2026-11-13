import React, { useState } from 'react';
import { X, UserPlus, CheckCircle2, ShieldCheck, Mail, Flame } from 'lucide-react';
import type { User } from '../types';
import { signInWithGoogle } from '../firebase';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  existingUsers: User[];
  onOpenFirebaseConfig?: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  existingUsers,
}) => {
  const [activeTab, setActiveTab] = useState<'firebase' | 'quick' | 'custom'>('firebase');
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. Firebase Google Popup Login
  const handleFirebaseGoogleLogin = async () => {
    setErrorMessage(null);

    try {
      setLoading(true);
      const user = await signInWithGoogle();
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      console.error('Firebase Auth Error:', err);
      const code = err.code || '';
      if (code === 'auth/popup-closed-by-user') {
        setErrorMessage('로그인 팝업 창이 닫혔습니다. 다시 시도해 주세요.');
      } else if (code === 'auth/popup-blocked') {
        setErrorMessage('브라우저에서 팝업 창이 차단되었습니다. 주소창 우측에서 팝업 허용을 눌러주세요.');
      } else if (code === 'auth/operation-not-allowed') {
        setErrorMessage('Firebase 콘솔에서 Google 로그인이 아직 [사용 설정]되지 않았거나 저장되지 않았습니다. (Firebase 콘솔 > Authentication > Google > 사용 설정 > 저장)');
      } else if (code === 'auth/unauthorized-domain') {
        setErrorMessage('Firebase 콘솔의 승인된 도메인(Authorized Domains)에 현재 도메인이 등록되어 있지 않습니다. (Firebase 콘솔 > Authentication > 설정 > 승인된 도메인에 localhost 추가 필요)');
      } else if (code === 'auth/cancelled-popup-request') {
        setErrorMessage('이전 로그인 요청이 취소되었습니다. 다시 클릭해 주세요.');
      } else {
        setErrorMessage(`[${code || '에러'}] ${err.message || '로그인 중 오류가 발생했습니다.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Quick select existing user
  const handleSelectUser = (user: User) => {
    onLoginSuccess(user);
    onClose();
  };

  // 3. Custom new user registration
  const handleCustomRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customEmail.trim()) {
      alert('이름과 이메일을 입력해주세요.');
      return;
    }

    const cleanEmail = customEmail.trim().toLowerCase();
    const handleName = cleanEmail.split('@')[0];

    const found = existingUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (found) {
      onLoginSuccess(found);
      onClose();
      return;
    }

    const newUser: User = {
      id: 'user_' + Date.now(),
      email: cleanEmail,
      name: customName.trim(),
      handle: '@' + handleName,
      bio: `안녕하세요, ${customName.trim()}의 마이링크입니다.`,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(handleName)}&backgroundColor=e2e8f0`,
    };

    onLoginSuccess(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
        {/* Google Header */}
        <div className="p-6 text-center border-b border-gray-100 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Google Logo */}
          <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-2xl bg-white shadow-xs border border-gray-100 p-2">
            <svg className="w-full h-full" viewBox="0 0 24 24">
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

          <h2 className="text-lg font-bold text-gray-900 tracking-tight">
            Google 계정으로 로그인
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Firebase Google OAuth 인증으로 안전하게 시작하세요.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          <button
            type="button"
            onClick={() => setActiveTab('firebase')}
            className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition flex items-center justify-center gap-1.5 ${
              activeTab === 'firebase'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>Firebase 구글 로그인</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('quick')}
            className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition ${
              activeTab === 'quick'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            계정 선택
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition ${
              activeTab === 'custom'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            직접 가입
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 leading-relaxed text-left">
              {errorMessage}
            </div>
          )}

          {activeTab === 'firebase' && (
            <div className="space-y-4 text-center py-2">
              <p className="text-xs text-gray-500 mb-2">
                구글 계정으로 간편하게 인증하고 시작하세요.
              </p>

              {/* Main Button */}
              <button
                type="button"
                onClick={handleFirebaseGoogleLogin}
                disabled={loading}
                className="w-full py-3.5 px-4 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 rounded-xl font-semibold text-sm shadow-xs flex items-center justify-center gap-3 transition cursor-pointer active:scale-[0.99]"
              >
                <div className="w-5 h-5 shrink-0">
                  <svg className="w-full h-full" viewBox="0 0 24 24">
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
                <span>
                  {loading ? 'Google 인증 창 여는 중...' : 'Google 계정으로 계속하기'}
                </span>
              </button>
            </div>
          )}

          {activeTab === 'quick' && (
            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-gray-500 mb-2 text-left">저장된 계정</p>
              {existingUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/40 transition group text-left"
                >
                  <div className="flex items-center space-x-3 truncate">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-10 h-10 rounded-full border border-gray-200 object-cover shrink-0"
                    />
                    <div className="truncate">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-gray-300 group-hover:text-blue-600 shrink-0 transition" />
                </button>
              ))}
            </div>
          )}

          {activeTab === 'custom' && (
            <form onSubmit={handleCustomRegister} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  이름 (Google 프로필명)
                </label>
                <input
                  type="text"
                  placeholder="예: 홍길동"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Google 이메일
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="user@gmail.com"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl flex items-start space-x-2 text-blue-800 text-[11px] leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  가입 시 본인만의 마이링크 프로필 및 링크를 추가/수정할 수 있습니다.
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#1a56db] hover:bg-[#1648b7] text-white font-semibold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Google 계정으로 가입하고 시작하기</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-400">
            Firebase Authentication과 안전하게 동기화됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};
