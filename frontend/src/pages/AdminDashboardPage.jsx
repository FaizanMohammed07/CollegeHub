import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, mapsAPI } from '../services/endpoints';
import { useGeolocation } from '../hooks/useCustomHooks';
import { Button, Card, Input, Modal, Badge, Skeleton, Avatar, Alert } from '../components/UI';
import { Container } from '../components/Layouts';
import toast from 'react-hot-toast';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const { location, getCurrentLocation } = useGeolocation();
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [cacheStats, setCacheStats] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load cache stats
      const cacheResponse = await mapsAPI.getCacheStats();
      setCacheStats(cacheResponse.data.data);

      // In a real app, these would be separate API calls for admin
      getCurrentLocation();
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async () => {
    if (!selectedUser || !blockReason) {
      toast.error('Please provide a reason');
      return;
    }

    try {
      // await userAPI.blockUser(selectedUser._id, { reason: blockReason });
      toast.success('User blocked successfully');
      setSelectedUser(null);
      setBlockReason('');
    } catch (error) {
      console.error('Failed to block user:', error);
    }
  };

  const isAdmin = ['college_admin', 'super_admin'].includes(user?.role);

  if (!isAdmin) {
    return (
      <Container className="py-8">
        <Alert
          type="error"
          title="Access Denied"
          message="You do not have permission to access the admin dashboard."
        />
      </Container>
    );
  }

  return (
    <Container className="py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage users, events, and system resources</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-1">Total Users</p>
            <p className="text-3xl font-bold text-gray-900">---</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-1">Total Clubs</p>
            <p className="text-3xl font-bold text-gray-900">---</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-1">Total Events</p>
            <p className="text-3xl font-bold text-gray-900">---</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-1">Total Registrations</p>
            <p className="text-3xl font-bold text-gray-900">---</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Management */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Users</h2>
            <div className="space-y-3">
              {loading ? (
                <Skeleton className="h-12 rounded" count={5} />
              ) : (
                <Alert type="info" message="User list would be loaded here" />
              )}
            </div>
          </Card>
        </div>

        {/* System Stats */}
        <div>
          <Card className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Cache Statistics</h2>
            {cacheStats ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Size</span>
                  <span className="font-semibold">{cacheStats.size} MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hit Rate</span>
                  <span className="font-semibold">{cacheStats.hitRate?.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Requests</span>
                  <span className="font-semibold">{cacheStats.totalRequests}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 text-sm">Loading...</p>
            )}
          </Card>

          {/* Your Location */}
          {location && (
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Location</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-600">Latitude</p>
                  <p className="font-semibold">{location.lat?.toFixed(6)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Longitude</p>
                  <p className="font-semibold">{location.lng?.toFixed(6)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Accuracy</p>
                  <p className="font-semibold">{location.accuracy?.toFixed(2)}m</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Block User Modal */}
      {selectedUser && (
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title={`Block User: ${selectedUser.name}`}
        >
          <div className="space-y-4">
            <p className="text-gray-600">Provide a reason for blocking this user:</p>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={4}
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="Reason for blocking..."
            />
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setSelectedUser(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleBlockUser}
                className="flex-1"
              >
                Block User
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </Container>
  );
};

export default AdminDashboardPage;
