import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import NotificationBell from './NotificationBell';

const DashboardHeader = () => {
  const { userData, currentUser } = useAuth();

  console.log('DashboardHeader: Rendering with userData:', userData);

  const getProfilePicture = () => {
    try {
      // First check userData, then localStorage with Safari compatibility
      if (userData && userData.profilePicture) {
        return userData.profilePicture;
      }
      
      if (currentUser && typeof window !== 'undefined' && window.localStorage) {
        try {
          const stored = localStorage.getItem(`profilePicture_${currentUser.uid}`);
          return stored;
        } catch (error) {
          console.warn('DashboardHeader: localStorage access failed:', error);
        }
      }
      
      return null;
    } catch (error) {
      console.error('DashboardHeader: Error getting profile picture:', error);
      return null;
    }
  };

  const getInitials = () => {
    try {
      if (userData && userData.firstName && userData.lastName) {
        return `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase();
      }
      return 'U';
    } catch (error) {
      console.error('DashboardHeader: Error getting initials:', error);
      return 'U';
    }
  };

  const getDisplayName = () => {
    try {
      if (userData && userData.firstName && userData.lastName) {
        return `${userData.firstName} ${userData.lastName}`;
      }
      return 'User';
    } catch (error) {
      console.error('DashboardHeader: Error getting display name:', error);
      return 'User';
    }
  };

  return (
    <div className="flex justify-between items-center mb-6 gap-3">
      {/* Bank Logo Only - Removed Bank Name */}
      <div className="hidden sm:flex items-center flex-shrink-0">
        <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
          <img 
            src="/lovable-uploads/2e27bb90-5008-46cc-a672-281c0761c779.png" 
            alt="West Coast Trust Bank" 
            className="w-8 h-8 object-cover rounded-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar className="h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0">
          <AvatarImage src={getProfilePicture() || undefined} />
          <AvatarFallback className="text-sm sm:text-lg">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
            Hi, {getDisplayName()}
          </h1>
        </div>
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        <NotificationBell />
      </div>
    </div>
  );
};

export default DashboardHeader;
