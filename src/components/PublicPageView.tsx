import React, { useState } from 'react';
import { ArrowLeft, Copy, Check, ExternalLink } from 'lucide-react';
import type { User, LinkItem } from '../types';
import { ServiceIcon } from './ServiceIcon';

interface PublicPageViewProps {
  user: User;
  links: LinkItem[];
  onBackToAdmin: () => void;
  onIncrementClick: (linkId: string) => void;
}

export const PublicPageView: React.FC<PublicPageViewProps> = ({
  user,
  links,
  onBackToAdmin,
  onIncrementClick,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCardClick = (link: LinkItem) => {
    onIncrementClick(link.id);
    let targetUrl = link.url;
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Top Banner for Preview */}
      <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm sticky top-0 z-50">
        <button
          onClick={onBackToAdmin}
          className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>관리자 편집 화면으로</span>
        </button>

        <span className="hidden sm:inline font-medium text-slate-300">
          방문자용 공개 페이지 미리보기
        </span>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded transition"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? '링크 복사됨!' : '내 링크 주소 복사'}</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 py-12 flex flex-col items-center">
        {/* Profile Avatar */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-gray-200 overflow-hidden bg-white shadow-xs flex items-center justify-center mb-4">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Profile Name */}
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          {user.name}
        </h1>

        {/* Handle */}
        <p className="text-sm text-gray-400 font-mono tracking-wide mt-1">
          {user.handle}
        </p>

        {/* Bio */}
        <p className="text-sm text-gray-600 font-mono mt-2 text-center max-w-md whitespace-pre-line mb-8">
          {user.bio}
        </p>

        {/* Links List */}
        <div className="w-full space-y-3.5">
          {links.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-gray-200 text-gray-400 text-sm">
              등록된 링크가 아직 없습니다.
            </div>
          ) : (
            links.map((link) => (
              <div
                key={link.id}
                onClick={() => handleCardClick(link)}
                className="w-full bg-white border border-gray-200 hover:border-blue-500 hover:shadow-md rounded-xl p-4 flex items-center justify-between cursor-pointer transition duration-150 group"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="shrink-0 w-9 h-9 flex items-center justify-center">
                    <ServiceIcon iconType={link.iconType} className="w-8 h-8" />
                  </div>
                  <span className="text-base font-semibold text-gray-800 group-hover:text-blue-600 transition">
                    {link.title}
                  </span>
                </div>

                <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition" />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-xs text-gray-400 flex items-center justify-center gap-1">
          <span>Powered by</span>
          <span className="font-bold text-blue-600">MyLink</span>
        </footer>
      </main>
    </div>
  );
};
