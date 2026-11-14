import React, { useState, useEffect } from 'react';
import { X, Check, Plus, Pencil, Trash2, Link as LinkIcon, User as UserIcon } from 'lucide-react';
import type { User, LinkItem } from '../types';
import { ServiceIcon } from './ServiceIcon';
import { detectIconType } from '../utils/storage';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSaveProfile: (updatedData: Partial<User>) => void;
  links: LinkItem[];
  onSaveLink: (linkData: { id?: string; title: string; url: string; iconType: LinkItem['iconType'] }) => void;
  onDeleteLink: (linkId: string) => void;
}

const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=jes77552&backgroundColor=e2e8f0',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/identicon/svg?seed=eunseok&backgroundColor=c0aede',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
];

const AVAILABLE_ICONS: Array<{ type: LinkItem['iconType']; label: string }> = [
  { type: 'github', label: 'GitHub' },
  { type: 'google', label: 'Google' },
  { type: 'instagram', label: 'Instagram' },
  { type: 'youtube', label: 'YouTube' },
  { type: 'twitter', label: 'X (Twitter)' },
  { type: 'linkedin', label: 'LinkedIn' },
  { type: 'globe', label: '기타 웹' },
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveProfile,
  links,
  onSaveLink,
  onDeleteLink,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'links'>('profile');

  // Profile Form States
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Link Form States (모달 내부에서 새 링크 추가 및 수정)
  const [isAddingOrEditingLink, setIsAddingOrEditingLink] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkIcon, setLinkIcon] = useState<LinkItem['iconType']>('globe');
  const [iconManual, setIconManual] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setHandle(currentUser.handle);
      setBio(currentUser.bio);
      setAvatarUrl(currentUser.avatarUrl);
    }
    setIsAddingOrEditingLink(false);
    setEditingLinkId(null);
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  // Profile submit
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    let formattedHandle = handle.trim();
    if (formattedHandle && !formattedHandle.startsWith('@')) {
      formattedHandle = '@' + formattedHandle;
    }

    onSaveProfile({
      name: name.trim(),
      handle: formattedHandle || '@' + name.trim().toLowerCase(),
      bio: bio.trim(),
      avatarUrl: avatarUrl.trim() || currentUser.avatarUrl,
    });
    onClose();
  };

  // Start adding a new link
  const handleStartAddLink = () => {
    setEditingLinkId(null);
    setLinkTitle('');
    setLinkUrl('');
    setLinkIcon('globe');
    setIconManual(false);
    setIsAddingOrEditingLink(true);
  };

  // Start editing an existing link
  const handleStartEditLink = (link: LinkItem) => {
    setEditingLinkId(link.id);
    setLinkTitle(link.title);
    setLinkUrl(link.url);
    setLinkIcon(link.iconType);
    setIconManual(true);
    setIsAddingOrEditingLink(true);
  };

  // URL input handler with auto-detection
  const handleUrlChange = (val: string) => {
    setLinkUrl(val);
    if (!iconManual) {
      const detected = detectIconType(val);
      setLinkIcon(detected);
      if (!linkTitle && detected !== 'globe') {
        const found = AVAILABLE_ICONS.find((i) => i.type === detected);
        if (found) setLinkTitle(found.label);
      }
    }
  };

  // Link save handler
  const handleSaveLinkItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkTitle.trim() || !linkUrl.trim()) {
      alert('링크 제목과 URL 주소를 모두 입력해주세요.');
      return;
    }

    onSaveLink({
      id: editingLinkId || undefined,
      title: linkTitle.trim(),
      url: linkUrl.trim(),
      iconType: linkIcon,
    });

    setIsAddingOrEditingLink(false);
    setEditingLinkId(null);
    setLinkTitle('');
    setLinkUrl('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">프로필 &amp; 링크 관리</h2>
            <p className="text-xs text-gray-500">프로필 정보와 표시할 링크를 편집합니다</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-100 bg-gray-50/60">
          <button
            type="button"
            onClick={() => {
              setActiveTab('profile');
              setIsAddingOrEditingLink(false);
            }}
            className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition flex items-center justify-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>프로필 정보 수정</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('links')}
            className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition flex items-center justify-center gap-1.5 ${
              activeTab === 'links'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>링크 관리 ({links.length})</span>
          </button>
        </div>

        {/* Tab 1: Profile Information Edit */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="p-6 space-y-4 overflow-y-auto">
            {/* Avatar Preview & Preset Selection */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border border-gray-200 overflow-hidden bg-gray-50 mb-3 shadow-2xs">
                <img
                  src={avatarUrl || currentUser.avatarUrl}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(preset)}
                    className={`w-7 h-7 rounded-full overflow-hidden border-2 transition ${
                      avatarUrl === preset ? 'border-blue-600 scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={preset} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-gray-400">프리셋을 클릭하거나 아래에 이미지 URL을 입력하세요</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                프로필 이미지 URL
              </label>
              <input
                type="text"
                placeholder="https://..."
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  이름
                </label>
                <input
                  type="text"
                  placeholder="전은석"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  핸들 (ID)
                </label>
                <input
                  type="text"
                  placeholder="@jes77552"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono text-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                소개글 (바이오)
              </label>
              <textarea
                rows={3}
                placeholder="안녕하세요 전은석"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#1a56db] hover:bg-[#1648b7] rounded-lg transition shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>프로필 저장하기</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Links Management */}
        {activeTab === 'links' && (
          <div className="p-6 overflow-y-auto space-y-4">
            {/* Inline Link Add/Edit Form */}
            {isAddingOrEditingLink ? (
              <form onSubmit={handleSaveLinkItem} className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3 animate-in fade-in duration-100 text-left">
                <div className="flex items-center justify-between pb-1 border-b border-blue-100">
                  <h3 className="text-xs font-bold text-blue-900">
                    {editingLinkId ? '링크 수정하기' : '새로운 링크 추가하기'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAddingOrEditingLink(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    링크 이름
                  </label>
                  <input
                    type="text"
                    placeholder="예: 깃허브, 블로그, 포트폴리오"
                    value={linkTitle}
                    onChange={(e) => setLinkTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    URL 주소
                  </label>
                  <input
                    type="text"
                    placeholder="https://github.com/..."
                    value={linkUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">
                    아이콘 선택
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {AVAILABLE_ICONS.map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => {
                          setLinkIcon(item.type);
                          setIconManual(true);
                        }}
                        className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-left transition ${
                          linkIcon === item.type
                            ? 'border-blue-600 bg-white shadow-2xs font-semibold'
                            : 'border-gray-200 bg-white/70 hover:border-gray-300'
                        }`}
                      >
                        <ServiceIcon iconType={item.type} className="w-4 h-4 shrink-0" />
                        <span className="text-[10px] text-gray-700 truncate">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingOrEditingLink(false)}
                    className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1 px-4 py-1.5 text-xs font-semibold text-white bg-[#1a56db] hover:bg-[#1648b7] rounded-lg transition shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{editingLinkId ? '수정 완료' : '링크 추가하기'}</span>
                  </button>
                </div>
              </form>
            ) : (
              /* "+ 새로운 링크 추가하기" Blue Button inside Profile Modal */
              <button
                type="button"
                onClick={handleStartAddLink}
                className="w-full py-3 px-4 bg-[#1a56db] hover:bg-[#1648b7] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs flex items-center justify-center gap-2 transition duration-150 cursor-pointer active:scale-[0.99]"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>새로운 링크 추가하기</span>
              </button>
            )}

            {/* Current Links List */}
            <div className="space-y-2 pt-2 text-left">
              <p className="text-xs font-semibold text-gray-500 mb-1">
                현재 등록된 링크 ({links.length}개)
              </p>
              {links.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl">
                  등록된 링크가 없습니다. 위의 버튼을 눌러 새 링크를 추가하세요.
                </div>
              ) : (
                links.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-gray-300 bg-white transition group"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <ServiceIcon iconType={link.iconType} className="w-6 h-6 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {link.title}
                        </p>
                        <p className="text-[11px] text-gray-400 font-mono truncate">
                          {link.url}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0 ml-3">
                      <button
                        type="button"
                        onClick={() => handleStartEditLink(link)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition"
                        title="수정"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteLink(link.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-lg transition"
                        title="삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
