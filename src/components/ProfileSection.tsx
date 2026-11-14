import React from 'react';
import { Pencil, Plus, Check, User as UserIcon } from 'lucide-react';
import type { User } from '../types';

interface ProfileSectionProps {
  user: User;
  onEditProfile: () => void;
  isAdmin?: boolean;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onOpenAddLink: () => void;
  onOpenAuthModal?: () => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  user,
  onEditProfile,
  isAdmin = false,
  isEditMode,
  onToggleEditMode,
  onOpenAddLink,
  onOpenAuthModal,
}) => {
  return (
    <div className="flex flex-col items-center text-center pt-8 pb-4">
      {/* Avatar Container */}
      <div className="relative group">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-gray-200 overflow-hidden bg-white shadow-2xs flex items-center justify-center">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-full h-full object-cover transition duration-200 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        </div>
        {isAdmin && isEditMode && (
          <button
            onClick={onEditProfile}
            className="absolute bottom-0 right-0 p-2 bg-blue-600 border-2 border-white rounded-full text-white shadow-md hover:bg-blue-700 transition"
            title="프로필 정보 변경"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Name & Admin Badge */}
      <div className="flex items-center gap-1.5 mt-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          {user.name}
        </h1>
        {isAdmin && (
          <span className="px-2 py-0.5 text-[11px] font-semibold bg-blue-100 text-blue-700 rounded-full">
            관리자
          </span>
        )}
      </div>

      {/* Handle */}
      <p className="text-xs sm:text-sm text-gray-400 font-mono tracking-wide mt-1">
        {user.handle}
      </p>

      {/* Bio */}
      <p className="text-xs sm:text-sm text-gray-600 font-mono mt-2 max-w-md whitespace-pre-line">
        {user.bio}
      </p>

      {/* Action Buttons: 프로필 수정 버튼 & 프로필 수정 클릭 시 나타나는 링크 추가 버튼 */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {isAdmin ? (
          !isEditMode ? (
            /* 평상시: 깔끔한 [프로필 수정] 버튼 */
            <button
              onClick={onToggleEditMode}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 hover:border-blue-500 hover:text-blue-600 shadow-2xs transition"
            >
              <Pencil className="w-3.5 h-3.5 text-blue-600" />
              <span>프로필 수정</span>
            </button>
          ) : (
            /* 프로필 수정을 눌렀을 때: 새 링크 추가 버튼, 프로필 정보 변경, 수정 완료 */
            <>
              {/* 따로 만들어진 링크 추가 버튼 */}
              <button
                onClick={onOpenAddLink}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ 새 링크 추가</span>
              </button>

              {/* 기본 프로필 정보 변경 버튼 */}
              <button
                onClick={onEditProfile}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 shadow-2xs transition"
              >
                <UserIcon className="w-3.5 h-3.5 text-gray-500" />
                <span>정보(소개/사진) 변경</span>
              </button>

              {/* 수정 완료 버튼 */}
              <button
                onClick={onToggleEditMode}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-300 rounded-full hover:bg-emerald-100 shadow-2xs transition"
              >
                <Check className="w-4 h-4" />
                <span>수정 완료</span>
              </button>
            </>
          )
        ) : (
          /* 비로그인 / 방문자: 프로필 수정 클릭 시 관리자 로그인 모달 유도 */
          <button
            onClick={onOpenAuthModal}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:text-blue-600 shadow-2xs transition"
          >
            <Pencil className="w-3.5 h-3.5 text-gray-400" />
            <span>프로필 수정 (관리자 로그인)</span>
          </button>
        )}
      </div>
    </div>
  );
};
