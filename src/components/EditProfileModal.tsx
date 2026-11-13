import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import type { User } from '../types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSave: (updatedData: Partial<User>) => void;
}

const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=jes77552&backgroundColor=e2e8f0',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/identicon/svg?seed=eunseok&backgroundColor=c0aede',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setHandle(currentUser.handle);
      setBio(currentUser.bio);
      setAvatarUrl(currentUser.avatarUrl);
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    let formattedHandle = handle.trim();
    if (formattedHandle && !formattedHandle.startsWith('@')) {
      formattedHandle = '@' + formattedHandle;
    }

    onSave({
      name: name.trim(),
      handle: formattedHandle || '@' + name.trim().toLowerCase(),
      bio: bio.trim(),
      avatarUrl: avatarUrl.trim() || currentUser.avatarUrl,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">프로필 수정</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
            <div className="flex items-center gap-2 mb-2">
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
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              프로필 이미지 URL
            </label>
            <input
              type="text"
              placeholder="https://..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              이름
            </label>
            <input
              type="text"
              placeholder="전은석"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              핸들 (ID)
            </label>
            <input
              type="text"
              placeholder="@wjsdmstjr"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono text-gray-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              소개글 (바이오)
            </label>
            <textarea
              rows={3}
              placeholder="안녕하세요 전은석"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
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
              <span>변경사항 저장</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
