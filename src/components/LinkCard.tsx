import React from 'react';
import { Pencil, Trash2, Eye } from 'lucide-react';
import type { LinkItem } from '../types';
import { ServiceIcon } from './ServiceIcon';

interface LinkCardProps {
  link: LinkItem;
  onEdit?: (link: LinkItem) => void;
  onDelete?: (linkId: string) => void;
  onIncrementClick: (linkId: string) => void;
  isEditable?: boolean;
}

export const LinkCard: React.FC<LinkCardProps> = ({
  link,
  onEdit,
  onDelete,
  onIncrementClick,
  isEditable = true,
}) => {
  const handleClick = () => {
    onIncrementClick(link.id);
    let targetUrl = link.url;
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={handleClick}
      className="group relative w-full bg-white border border-gray-200 rounded-md p-4 sm:p-5 flex items-center justify-between shadow-2xs hover:border-blue-400 hover:shadow-xs transition duration-150 cursor-pointer"
    >
      {/* Left: Icon & Info */}
      <div className="flex items-center space-x-4 min-w-0">
        <div className="shrink-0 w-10 h-10 flex items-center justify-center">
          <ServiceIcon iconType={link.iconType} className="w-9 h-9" />
        </div>

        <div className="min-w-0 text-left">
          <h2 className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-blue-600 transition truncate">
            {link.title}
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono mt-0.5">
            <Eye className="w-3.5 h-3.5" />
            <span>{link.clickCount}</span>
          </div>
        </div>
      </div>

      {/* Right: Actions (in editable mode) */}
      {isEditable && (
        <div className="flex items-center space-x-2 shrink-0 ml-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(link);
            }}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded transition"
            title="수정하기"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(link.id);
            }}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded transition"
            title="삭제하기"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
