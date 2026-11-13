import React from 'react';
import { Pencil } from 'lucide-react';
import type { User } from '../types';

interface ProfileSectionProps {
  user: User;
  onEditProfile: () => void;
  isEditable?: boolean;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  user,
  onEditProfile,
  isEditable = true,
}) => {
  return (
    <div className="flex flex-col items-center text-center pt-8 pb-4">
      {/* Avatar Container with subtle edit overlay */}
      <div className="relative group">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-gray-200 overflow-hidden bg-white shadow-2xs flex items-center justify-center">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-full h-full object-cover transition duration-200 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        </div>
        {isEditable && (
          <button
            onClick={onEditProfile}
            className="absolute bottom-0 right-0 p-1.5 bg-white border border-gray-200 rounded-full text-gray-600 shadow-sm hover:text-blue-600 hover:border-blue-400 transition"
            title="프로필 편집"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Name */}
      <h1 className="mt-4 text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
        {user.name}
      </h1>

      {/* Handle */}
      <p className="text-xs sm:text-sm text-gray-400 font-mono tracking-wide mt-1">
        {user.handle}
      </p>

      {/* Bio */}
      <p className="text-xs sm:text-sm text-gray-600 font-mono mt-2 max-w-md whitespace-pre-line">
        {user.bio}
      </p>
    </div>
  );
};
