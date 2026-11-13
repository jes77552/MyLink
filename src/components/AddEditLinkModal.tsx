import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import type { LinkItem } from '../types';
import { detectIconType } from '../utils/storage';
import { ServiceIcon } from './ServiceIcon';

interface AddEditLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (linkData: { title: string; url: string; iconType: LinkItem['iconType'] }) => void;
  initialData?: LinkItem | null;
}

const AVAILABLE_ICONS: Array<{ type: LinkItem['iconType']; label: string }> = [
  { type: 'github', label: 'GitHub' },
  { type: 'google', label: 'Google' },
  { type: 'instagram', label: 'Instagram' },
  { type: 'youtube', label: 'YouTube' },
  { type: 'twitter', label: 'X (Twitter)' },
  { type: 'linkedin', label: 'LinkedIn' },
  { type: 'globe', label: '기타 웹사이트' },
];

export const AddEditLinkModal: React.FC<AddEditLinkModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [iconType, setIconType] = useState<LinkItem['iconType']>('globe');
  const [userSelectedIcon, setUserSelectedIcon] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setUrl(initialData.url);
      setIconType(initialData.iconType);
      setUserSelectedIcon(true);
    } else {
      setTitle('');
      setUrl('');
      setIconType('globe');
      setUserSelectedIcon(false);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    if (!userSelectedIcon) {
      const detected = detectIconType(newUrl);
      setIconType(detected);
      if (!title && detected !== 'globe') {
        const found = AVAILABLE_ICONS.find((i) => i.type === detected);
        if (found) setTitle(found.label);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      alert('제목과 링크 주소를 모두 입력해주세요.');
      return;
    }
    onSave({
      title: title.trim(),
      url: url.trim(),
      iconType,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">
            {initialData ? '링크 수정하기' : '새로운 링크 추가하기'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              링크 이름
            </label>
            <input
              type="text"
              placeholder="예: 깃허브, 개인 블로그, 포트폴리오"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              URL 주소
            </label>
            <input
              type="text"
              placeholder="https://github.com/..."
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              아이콘 선택
            </label>
            <div className="grid grid-cols-4 gap-2">
              {AVAILABLE_ICONS.map((item) => {
                const isSelected = iconType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => {
                      setIconType(item.type);
                      setUserSelectedIcon(true);
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <ServiceIcon iconType={item.type} className="w-6 h-6 mb-1" />
                    <span className="text-[11px] font-medium text-gray-700 truncate w-full text-center">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
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
              <span>{initialData ? '저장하기' : '추가하기'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
