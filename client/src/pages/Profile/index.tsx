import React, { useState } from 'react';
import PageContainer from '../../components/PageContainer';
import { PencilIcon } from '@heroicons/react/24/outline';
import EditAvatarModal from '../../components/Profile/EditAvatarModal';
import EditBasicInfoModal from '../../components/Profile/EditBasicInfoModal';
import EditPreferencesModal from '../../components/Profile/EditPreferencesModal';

interface ProfileData {
  initials: string;
  imageUrl: string | undefined;
  basicInfo: {
    username: string;
    email: string;
    joinedDate: string;
  };
  preferences: {
    timezone: string;
    language: string;
    notifications: string[];
  };
}

const Profile: React.FC = () => {
  // Modal states
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isBasicInfoModalOpen, setIsBasicInfoModalOpen] = useState(false);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);

  // Dummy data - replace with real data later
  const [profileData, setProfileData] = useState<ProfileData>({
    initials: 'JD',
    imageUrl: undefined,
    basicInfo: {
      username: 'johndoe123',
      email: 'john.doe@example.com',
      joinedDate: 'January 15, 2024'
    },
    preferences: {
      timezone: 'UTC+01:00',
      language: 'English',
      notifications: ['email', 'push']
    }
  });

  // Handler functions
  const handleAvatarUpdate = (data: { initials: string; imageUrl?: string }) => {
    setProfileData(prev => ({ 
      ...prev, 
      initials: data.initials,
      imageUrl: data.imageUrl 
    }));
  };

  const handleBasicInfoUpdate = (data: { username: string; email: string }) => {
    setProfileData(prev => ({
      ...prev,
      basicInfo: { ...prev.basicInfo, ...data }
    }));
  };

  const handlePreferencesUpdate = (data: { timezone: string; language: string; notifications: string[] }) => {
    setProfileData(prev => ({ ...prev, preferences: data }));
  };

  return (
    <PageContainer>
      <h1 className="text-3xl font-bold text-base-content mb-8">Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Avatar Section */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-start">
              <h2 className="card-title">Avatar</h2>
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => setIsAvatarModalOpen(true)}
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="avatar">
                {profileData.imageUrl ? (
                  <div className="w-32 h-32 rounded-full">
                    <img 
                      src={profileData.imageUrl} 
                      alt="User avatar" 
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://img.freepik.com/premium-vector/black-silhouette-default-profile-avatar_664995-354.jpg?semt=ais_hybrid";
                      }}
                    />
                  </div>
                ) : (
                  <div className="bg-base-300 text-base-content rounded-full w-32 h-32 flex items-center justify-center">
                    <span className="text-3xl">{profileData.initials}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Basic Info Section */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-start">
              <h2 className="card-title">Basic Information</h2>
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => setIsBasicInfoModalOpen(true)}
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-base-content/70">Username</label>
                <p className="text-base-content">{profileData.basicInfo.username}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-base-content/70">Email</label>
                <p className="text-base-content">{profileData.basicInfo.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-base-content/70">Joined</label>
                <p className="text-base-content">{profileData.basicInfo.joinedDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Game Stats Section - No edit functionality needed */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Game Stats</h2>
            <div className="stats stats-vertical shadow">
              <div className="stat">
                <div className="stat-title">Level</div>
                <div className="stat-value">12</div>
                <div className="stat-desc">4,800 / 5,000 XP to next level</div>
              </div>
              
              <div className="stat">
                <div className="stat-title">Total XP</div>
                <div className="stat-value text-primary">48,250</div>
                <div className="stat-desc">↗︎ 2,400 (30 days)</div>
              </div>

              <div className="stat">
                <div className="stat-title">Achievements</div>
                <div className="stat-value">23</div>
                <div className="stat-desc">↗︎ 3 new this month</div>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-start">
              <h2 className="card-title">Preferences</h2>
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => setIsPreferencesModalOpen(true)}
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-base-content/70">Time Zone</label>
                <p className="text-base-content">{profileData.preferences.timezone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-base-content/70">Language</label>
                <p className="text-base-content">{profileData.preferences.language}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-base-content/70">Notifications</label>
                <p className="text-base-content">{profileData.preferences.notifications.join(', ')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditAvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSubmit={handleAvatarUpdate}
        currentInitials={profileData.initials}
        currentImageUrl={profileData.imageUrl}
      />

      <EditBasicInfoModal
        isOpen={isBasicInfoModalOpen}
        onClose={() => setIsBasicInfoModalOpen(false)}
        onSubmit={handleBasicInfoUpdate}
        currentInfo={{
          username: profileData.basicInfo.username,
          email: profileData.basicInfo.email
        }}
      />

      <EditPreferencesModal
        isOpen={isPreferencesModalOpen}
        onClose={() => setIsPreferencesModalOpen(false)}
        onSubmit={handlePreferencesUpdate}
        currentPreferences={profileData.preferences}
      />
    </PageContainer>
  );
};

export default Profile; 