import React, { createContext, useContext, useState, useCallback } from "react";
import { clubAPI } from "../services/endpoints";
import toast from "react-hot-toast";

const ClubContext = createContext(null);

export const ClubProvider = ({ children }) => {
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [myClubs, setMyClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  // List clubs
  const listClubs = useCallback(async (page = 1, limit = 10, category) => {
    setLoading(true);
    try {
      const response = await clubAPI.listClubs(page, limit, category);
      const clubsData = response.data.data || [];
      const clubsList = Array.isArray(clubsData)
        ? clubsData
        : clubsData.clubs || [];
      setClubs(clubsList);
      setPagination({
        page,
        limit,
        total: response.data.pagination?.total || clubsList.length,
      });
      return {
        clubs: clubsList,
        total: response.data.pagination?.total || clubsList.length,
      };
    } catch (error) {
      console.error("Failed to list clubs:", error);
      setClubs([]);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create club
  const createClub = useCallback(async (data) => {
    setLoading(true);
    try {
      const response = await clubAPI.createClub(data);
      const newClub = response.data.data;
      setClubs((prev) => [newClub, ...prev]);
      setMyClubs((prev) => [newClub, ...prev]);
      toast.success("Club created successfully");
      return newClub;
    } catch (error) {
      const message =
        error.response?.data?.error?.message || "Failed to create club";
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get club details
  const getClub = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await clubAPI.getClub(id);
      setSelectedClub(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error("Failed to get club:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update club
  const updateClub = useCallback(async (id, data) => {
    setLoading(true);
    try {
      const response = await clubAPI.updateClub(id, data);
      const updated = response.data.data;
      setClubs((prev) => prev.map((c) => (c._id === id ? updated : c)));
      setSelectedClub(updated);
      toast.success("Club updated successfully");
      return updated;
    } catch (error) {
      const message =
        error.response?.data?.error?.message || "Failed to update club";
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete club
  const deleteClub = useCallback(async (id) => {
    setLoading(true);
    try {
      await clubAPI.deleteClub(id);
      setClubs((prev) => prev.filter((c) => c._id !== id));
      setMyClubs((prev) => prev.filter((c) => c._id !== id));
      toast.success("Club deleted successfully");
    } catch (error) {
      const message =
        error.response?.data?.error?.message || "Failed to delete club";
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Join club
  const joinClub = useCallback(async (id) => {
    try {
      const response = await clubAPI.joinClub(id);
      const updated = response.data.data;
      setClubs((prev) => prev.map((c) => (c._id === id ? updated : c)));
      setSelectedClub(updated);
      toast.success("Joined club successfully");
      return updated;
    } catch (error) {
      const message =
        error.response?.data?.error?.message || "Failed to join club";
      toast.error(message);
      throw error;
    }
  }, []);

  // Leave club
  const leaveClub = useCallback(async (id) => {
    try {
      const response = await clubAPI.leaveClub(id);
      const updated = response.data.data;
      setClubs((prev) => prev.map((c) => (c._id === id ? updated : c)));
      setMyClubs((prev) => prev.filter((c) => c._id !== id));
      setSelectedClub(updated);
      toast.success("Left club successfully");
      return updated;
    } catch (error) {
      const message =
        error.response?.data?.error?.message || "Failed to leave club";
      toast.error(message);
      throw error;
    }
  }, []);

  // Get club members
  const getClubMembers = useCallback(async (id) => {
    try {
      const response = await clubAPI.getClubMembers(id);
      const membersData = response.data.data || [];
      const membersList = Array.isArray(membersData)
        ? membersData
        : membersData.members || [];
      return membersList;
    } catch (error) {
      console.error("Failed to get club members:", error);
      return [];
    }
  }, []);

  const searchClubs = useCallback(async (query, collegeId) => {
    if (!query || query.length < 2) {
      return [];
    }
    try {
      const response = await clubAPI.searchClubs(query, collegeId);
      return response.data.data || [];
    } catch (error) {
      console.error("Failed to search clubs:", error);
      return [];
    }
  }, []);

  const value = {
    clubs,
    selectedClub,
    myClubs,
    loading,
    pagination,
    listClubs,
    createClub,
    getClub,
    updateClub,
    deleteClub,
    joinClub,
    leaveClub,
    getClubMembers,
    searchClubs,
  };

  return <ClubContext.Provider value={value}>{children}</ClubContext.Provider>;
};

export const useClub = () => {
  const context = useContext(ClubContext);
  if (!context) {
    throw new Error("useClub must be used within ClubProvider");
  }
  return context;
};
