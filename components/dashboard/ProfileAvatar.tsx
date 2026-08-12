'use client';

import { FC } from 'react';
import { useAuth } from '@/components/providers/auth-provider';

interface ProfileAvatarProps {
  name?: string;
  photoUrl?: string | null;
}

const initialsFromName = (name?: string) => {
  if (!name) return 'E';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const ProfileAvatar: FC<ProfileAvatarProps> = ({ name, photoUrl }) => {
  const { user } = useAuth();
  const imageUrl = photoUrl ?? user?.profilePicture ?? null;
  const displayName = name ?? user?.name ?? 'Employee';

  return (
    <div className="flex items-center">
      <div
        className="relative rounded-full bg-white p-[3px] shadow-md"
        style={{ width: 90, height: 90 }}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={displayName}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0ea5e9] text-white font-semibold text-2xl">
            {initialsFromName(displayName)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileAvatar;