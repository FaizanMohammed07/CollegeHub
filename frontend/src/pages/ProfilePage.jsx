import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { Button, Card, Input, Modal, Skeleton, Badge, Avatar, Alert } from '../components/UI';
import { Container } from '../components/Layouts';
import { useForm } from '../hooks/useCustomHooks';
import toast from 'react-hot-toast';

const validateProfileForm = (values) => {
  const errors = {};
  if (!values.name) errors.name = 'Name is required';
  if (!values.email) errors.email = 'Email is required';
  if (values.phone && !/^\+?\d{7,15}$/.test(values.phone)) errors.phone = 'Invalid phone number';
  return errors;
};

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { profile, getProfile, updateProfile, loading } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    getProfile();
  }, []);

  const { values, errors, handleChange, handleSubmit } = useForm(
    profile || { name: '', email: '', phone: '', profilePicUrl: '' },
    async (formData) => {
      try {
        await updateProfile(formData);
        setIsEditing(false);
      } catch (error) {
        console.error('Failed to update profile:', error);
      }
    },
    validateProfileForm
  );

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading && !profile) {
    return <Container className="py-8"><Skeleton className="h-96 rounded" /></Container>;
  }

  return (
    <Container className="py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Manage your account settings</p>
      </div>

      {/* Profile Header */}
      <Card className="mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <Avatar
              src={profile?.profilePicUrl}
              alt={profile?.name}
              size="lg"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{profile?.name}</h2>
              <p className="text-gray-600">{profile?.email}</p>
              <Badge variant="primary" className="mt-2 capitalize">
                {user?.role}
              </Badge>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </Button>
        </div>

        {/* Account Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
          <div>
            <p className="text-sm text-gray-600 mb-1">College</p>
            <p className="font-semibold text-gray-900">{profile?.college?.name || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Member Since</p>
            <p className="font-semibold text-gray-900">
              {new Date(profile?.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Phone</p>
            <p className="font-semibold text-gray-900">{profile?.phone || 'Not set'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Status</p>
            <Badge variant={profile?.isVerified ? 'success' : 'warning'}>
              {profile?.isVerified ? 'Verified' : 'Unverified'}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-1">Clubs Joined</p>
            <p className="text-3xl font-bold text-gray-900">0</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-1">Events Registered</p>
            <p className="text-3xl font-bold text-gray-900">0</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-1">Check-ins</p>
            <p className="text-3xl font-bold text-gray-900">0</p>
          </div>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="border-red-200 bg-red-50">
        <h3 className="text-lg font-bold text-red-900 mb-4">Account Actions</h3>
        <div className="flex gap-2">
          <Button
            variant="danger"
            onClick={() => setShowLogoutModal(true)}
          >
            Logout
          </Button>
        </div>
      </Card>

      {/* Edit Profile Modal */}
      {isEditing && (
        <Modal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          title="Edit Profile"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name"
              name="name"
              value={values.name || ''}
              onChange={handleChange}
              error={errors.name}
              required
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={values.email || ''}
              onChange={handleChange}
              error={errors.email}
              required
              disabled
            />

            <Input
              label="Phone"
              name="phone"
              value={values.phone || ''}
              onChange={handleChange}
              error={errors.phone}
              placeholder="+1234567890"
            />

            <Input
              label="Profile Picture URL"
              name="profilePicUrl"
              type="url"
              value={values.profilePicUrl || ''}
              onChange={handleChange}
              placeholder="https://..."
            />

            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setIsEditing(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                loading={loading}
                className="flex-1"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <Modal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          title="Logout"
        >
          <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowLogoutModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleLogout}
              className="flex-1"
            >
              Logout
            </Button>
          </div>
        </Modal>
      )}
    </Container>
  );
};

export default ProfilePage;
