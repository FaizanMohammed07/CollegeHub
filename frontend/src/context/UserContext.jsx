import React, { createContext, useContext, useState, useCallback } from 'react';
import { userAPI } from '../services/endpoints';
import { setUser } from '../services/auth.service';
import toast from 'react-hot-toast';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [nearby, setNearby] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get profile
  const getProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await userAPI.getProfile();
      setProfile(response.data.data);
      setUser(response.data.data); // Update localStorage
      return response.data.data;
    } catch (error) {
      console.error('Failed to get profile:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (data) => {
    setLoading(true);
    try {
      const response = await userAPI.updateProfile(data);
      setProfile(response.data.data);
      setUser(response.data.data);
      toast.success('Profile updated successfully');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to update profile';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update location
  const updateLocation = useCallback(async (lat, lng) => {
    try {
      await userAPI.updateLocation(lat, lng);
      setProfile((prev) => ({
        ...prev,
        location: { type: 'Point', coordinates: [lng, lat] },
      }));
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  }, []);

  // Get nearby users
  const getNearbyUsers = useCallback(async (lat, lng, maxDistance = 5000) => {
    setLoading(true);
    try {
      const response = await userAPI.getNearbyUsers(lat, lng, maxDistance);
      setNearby(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get nearby users:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Search users
  const searchUsers = useCallback(async (query, role) => {
    setLoading(true);
    try {
      const response = await userAPI.searchUsers(query, role);
      return response.data.data;
    } catch (error) {
      console.error('Failed to search users:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    profile,
    nearby,
    loading,
    getProfile,
    updateProfile,
    updateLocation,
    getNearbyUsers,
    searchUsers,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};
