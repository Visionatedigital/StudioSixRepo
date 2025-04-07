'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Icon } from '@/components/Icons';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '••••••••',
    confirmPassword: '••••••••',
    weeklyNewsletter: true
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      setFormData(prev => ({
        ...prev,
        email: session.user.email || '',
        username: session.user.name || '',
      }));
    }
  }, [session, status, router]);

  // Show loading state while session is being fetched
  if (status === 'loading') {
    return (
      <DashboardLayout currentPage="Settings">
        <div className="w-full h-[calc(100vh-6rem)] bg-[#F6F8FA] rounded-2xl overflow-y-auto">
          <div className="max-w-[1200px] mx-auto px-6 py-8">
            <div className="flex items-center justify-center h-full">
              <div className="text-[#1B1464] font-medium">Loading...</div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state if session fetch failed
  if (!session) {
    return (
      <DashboardLayout currentPage="Settings">
        <div className="w-full h-[calc(100vh-6rem)] bg-[#F6F8FA] rounded-2xl overflow-y-auto">
          <div className="max-w-[1200px] mx-auto px-6 py-8">
            <div className="flex items-center justify-center h-full">
              <div className="text-red-600 font-medium">Error loading settings. Please try again.</div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // Process form data here
    // console.log('Form submitted:', formData);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Profile':
        return (
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Email */}
              <div>
                <label className="block text-[#1B1464] font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-[#E0DAF3] focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-[#1B1464] font-medium mb-2">User Name</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-[#E0DAF3] focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[#1B1464] font-medium mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-[#E0DAF3] focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <Icon
                      name={showPassword ? 'eye' : 'eye-closed'}
                      className="w-5 h-5 text-gray-500"
                    />
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[#1B1464] font-medium mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-[#E0DAF3] focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <Icon
                      name={showConfirmPassword ? 'eye' : 'eye-closed'}
                      className="w-5 h-5 text-gray-500"
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Newsletter Toggle */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleInputChange('weeklyNewsletter', !formData.weeklyNewsletter)}
                className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                  formData.weeklyNewsletter ? 'bg-[#814ADA]' : 'border border-[#E0DAF3]'
                }`}
              >
                {formData.weeklyNewsletter && (
                  <Icon name="check" className="w-4 h-4 text-white" />
                )}
              </button>
              <span className="text-[#1B1464] font-medium">Weekly Newsletters</span>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-[#814ADA] to-[#392CA0] text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
            >
              Save Changes
            </button>
          </form>
        );

      case 'Teams':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-12 text-center border border-[#E0DAF3]">
              <div className="w-24 h-24 mx-auto mb-6 bg-[#814ADA]/10 rounded-full flex items-center justify-center">
                <Icon name="teams" className="w-12 h-12 text-[#814ADA]" />
              </div>
              <h2 className="text-xl font-medium text-[#1B1464] mb-2">
                You're not a member of a team yet. Start a new team to
              </h2>
              <p className="text-xl font-medium mb-8">
                <span className="text-[#814ADA]">collaborate and create with</span> your teammates.
              </p>
              <button className="px-6 py-3 bg-[#814ADA] text-white font-medium rounded-lg flex items-center gap-2 mx-auto hover:opacity-90 transition-opacity">
                <Icon name="crown" className="w-5 h-5" />
                Upgrade Account
              </button>
            </div>
          </div>
        );

      case 'Account Management':
        return (
          <div className="max-w-4xl mx-auto grid grid-cols-2 gap-6">
            {/* Manage Subscription */}
            <div className="bg-white rounded-2xl p-8 border border-[#E0DAF3]">
              <h2 className="text-2xl font-bold text-[#1B1464] mb-3">Manage Subscription</h2>
              <p className="text-gray-600 mb-8">
                Manage payment method, change plan and more.
              </p>
              <button className="px-6 py-3 bg-[#814ADA] text-white font-medium rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity">
                <Icon name="profile" className="w-5 h-5" />
                Manage Subscriptions
              </button>
            </div>

            {/* Delete Account */}
            <div className="bg-white rounded-2xl p-8 border border-[#E0DAF3]">
              <h2 className="text-2xl font-bold text-[#1B1464] mb-3">Delete Account</h2>
              <p className="text-gray-600 mb-8">
                Deleting your account will remove all of your information from our database. This cannot be undone.
              </p>
              <button className="px-6 py-3 bg-white text-[#1B1464] font-medium rounded-lg flex items-center gap-2 border border-[#E0DAF3] hover:bg-gray-50 transition-colors">
                <Icon name="delete-user" className="w-5 h-5" />
                Delete Account
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout currentPage="Settings">
      <div className="w-full h-[calc(100vh-6rem)] bg-[#F6F8FA] rounded-2xl overflow-y-auto">
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-[#1B1464] text-center mb-8">Settings</h1>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-full p-1.5 flex items-center justify-center gap-2 max-w-2xl mx-auto mb-12 border border-[#E0DAF3]">
            {['Profile', 'Teams', 'Account Management'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-colors ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-[#814ADA] to-[#392CA0] text-white'
                    : 'text-gray-600 hover:text-[#1B1464]'
                }`}
              >
                <Icon
                  name={activeTab === tab 
                    ? (tab === 'Teams' ? 'teams-icon-white' : 
                       tab === 'Account Management' ? 'account-management-icon-white' : 
                       tab === 'Profile' ? 'profile-icon-white' : 
                       tab.toLowerCase().replace(' ', '-'))
                    : tab.toLowerCase().replace(' ', '-')}
                  className={`w-5 h-5 ${activeTab === tab ? 'text-white' : 'text-gray-500'}`}
                />
                <span className="font-medium">{tab}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </div>
    </DashboardLayout>
  );
} 