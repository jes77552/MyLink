import React, { useState, useEffect } from 'react';
import { X, Check, Flame, ExternalLink, HelpCircle, KeyRound, Sparkles } from 'lucide-react';
import {
  getActiveFirebaseConfig,
  saveFirebaseConfig,
  clearFirebaseConfig,
  type FirebaseConfig,
} from '../firebase';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [projectId, setProjectId] = useState('');
  const [appId, setAppId] = useState('');
  const [snippetText, setSnippetText] = useState('');
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    const current = getActiveFirebaseConfig();
    if (current) {
      setApiKey(current.apiKey || '');
      setAuthDomain(current.authDomain || '');
      setProjectId(current.projectId || '');
      setAppId(current.appId || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Firebase 콘솔 스니펫 코드 전체 붙여넣기 시 자동 파싱
  const handleParseSnippet = (text: string) => {
    setSnippetText(text);
    try {
      const apiKeyMatch = text.match(/apiKey:\s*["']([^"']+)["']/);
      const authDomainMatch = text.match(/authDomain:\s*["']([^"']+)["']/);
      const projectIdMatch = text.match(/projectId:\s*["']([^"']+)["']/);
      const appIdMatch = text.match(/appId:\s*["']([^"']+)["']/);

      if (apiKeyMatch) setApiKey(apiKeyMatch[1]);
      if (authDomainMatch) setAuthDomain(authDomainMatch[1]);
      if (projectIdMatch) setProjectId(projectIdMatch[1]);
      if (appIdMatch) setAppId(appIdMatch[1]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || !authDomain.trim() || !projectId.trim()) {
      alert('apiKey, authDomain, projectId는 필수 입력 항목입니다.');
      return;
    }

    const config: FirebaseConfig = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim(),
      appId: appId.trim(),
    };

    saveFirebaseConfig(config);
    alert('Firebase 설정이 저장되었습니다! 이제 Google 팝업 로그인이 동작합니다.');
    onConfigSaved();
    onClose();
  };

  const handleReset = () => {
    if (window.confirm('저장된 Firebase 설정을 초기화하시겠습니까?')) {
      clearFirebaseConfig();
      setApiKey('');
      setAuthDomain('');
      setProjectId('');
      setAppId('');
      setSnippetText('');
      onConfigSaved();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
              <Flame className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Firebase Google OAuth 설정</h2>
              <p className="text-xs text-gray-500">실제 Firebase 프로젝트 키를 연동합니다</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-left">
          {/* Guide toggle button */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-900">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <span>Firebase 키를 어디서 얻나요?</span>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="text-xs text-blue-600 font-medium hover:underline"
              >
                {showGuide ? '가이드 닫기' : '3분 가이드 보기'}
              </button>
            </div>

            {showGuide && (
              <div className="mt-3 pt-3 border-t border-blue-100/80 text-xs text-blue-950 space-y-2">
                <p>
                  1. <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="underline font-semibold inline-flex items-center gap-0.5 text-blue-700">Firebase 콘솔<ExternalLink className="w-3 h-3" /></a>에서 새 프로젝트 생성
                </p>
                <p>
                  2. 좌측 메뉴 <strong>빌드 &gt; Authentication</strong> &gt; [시작하기] 클릭 후 <strong>Google</strong> 제공업체를 [사용 설정]
                </p>
                <p>
                  3. <strong>프로젝트 설정(톱니바퀴) &gt; 일반 &gt; 내 앱 &gt; 웹(&lt;/&gt;)</strong> 앱 등록 후 나오는 <code>firebaseConfig</code> 객체를 아래에 붙여넣기
                </p>
              </div>
            )}
          </div>

          {/* Quick Paste Box */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>firebaseConfig 코드 통째로 붙여넣기 (스마트 자동 입력)</span>
              </span>
            </label>
            <textarea
              rows={2}
              placeholder="const firebaseConfig = { apiKey: '...', authDomain: '...', ... };"
              value={snippetText}
              onChange={(e) => handleParseSnippet(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500 font-mono bg-gray-50/60"
            />
          </div>

          <form onSubmit={handleSave} className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                API Key <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500 font-mono"
                  required
                />
                <KeyRound className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Auth Domain <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="your-app.firebaseapp.com"
                  value={authDomain}
                  onChange={(e) => setAuthDomain(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Project ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="your-app-id"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500 font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                App ID (선택)
              </label>
              <input
                type="text"
                placeholder="1:123456789:web:abcdef..."
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500 font-mono"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-gray-500 hover:text-red-600 transition"
              >
                설정 초기화
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>설정 저장하기</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
