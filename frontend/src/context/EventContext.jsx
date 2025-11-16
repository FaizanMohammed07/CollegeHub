import React, { createContext, useContext, useState, useCallback } from "react";
import { eventAPI, registrationAPI } from "../services/endpoints";
import toast from "react-hot-toast";

const EventContext = createContext(null);

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  // List events
  const listEvents = useCallback(async (page = 1, limit = 10, filters = {}) => {
    setLoading(true);
    try {
      const response = await eventAPI.listEvents(page, limit, filters);
      const eventsData = response.data.data || [];
      const eventsList = Array.isArray(eventsData)
        ? eventsData
        : eventsData.events || [];
      setEvents(eventsList);
      setPagination({
        page,
        limit,
        total: response.data.pagination?.total || eventsList.length,
      });
      return {
        events: eventsList,
        total: response.data.pagination?.total || eventsList.length,
      };
    } catch (error) {
      console.error("Failed to list events:", error);
      setEvents([]);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create event
  const createEvent = useCallback(async (data) => {
    setLoading(true);
    try {
      const response = await eventAPI.createEvent(data);
      const newEvent = response.data.data;
      setEvents((prev) => [newEvent, ...prev]);
      toast.success("Event created successfully");
      return newEvent;
    } catch (error) {
      const message =
        error.response?.data?.error?.message || "Failed to create event";
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get event details
  const getEvent = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await eventAPI.getEvent(id);
      setSelectedEvent(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error("Failed to get event:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update event
  const updateEvent = useCallback(async (id, data) => {
    setLoading(true);
    try {
      const response = await eventAPI.updateEvent(id, data);
      const updated = response.data.data;
      setEvents((prev) => prev.map((e) => (e._id === id ? updated : e)));
      setSelectedEvent(updated);
      toast.success("Event updated successfully");
      return updated;
    } catch (error) {
      const message =
        error.response?.data?.error?.message || "Failed to update event";
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete event
  const deleteEvent = useCallback(async (id) => {
    setLoading(true);
    try {
      await eventAPI.deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e._id !== id));
      toast.success("Event deleted successfully");
    } catch (error) {
      const message =
        error.response?.data?.error?.message || "Failed to delete event";
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Register for event
  const registerForEvent = useCallback(async (id) => {
    try {
      const response = await eventAPI.registerForEvent(id);
      const updated = response.data.data;
      setEvents((prev) => prev.map((e) => (e._id === id ? updated : e)));
      setSelectedEvent(updated);
      setMyRegistrations((prev) => [
        ...prev,
        { eventId: id, status: "registered" },
      ]);
      toast.success("Registered for event successfully");
      return updated;
    } catch (error) {
      const message =
        error.response?.data?.error?.message || "Failed to register for event";
      toast.error(message);
      throw error;
    }
  }, []);

  // Cancel registration
  const cancelRegistration = useCallback(async (id) => {
    try {
      const response = await eventAPI.cancelRegistration(id);
      const updated = response.data.data;
      setEvents((prev) => prev.map((e) => (e._id === id ? updated : e)));
      setSelectedEvent(updated);
      setMyRegistrations((prev) => prev.filter((r) => r.eventId !== id));
      toast.success("Registration cancelled");
      return updated;
    } catch (error) {
      const message =
        error.response?.data?.error?.message || "Failed to cancel registration";
      toast.error(message);
      throw error;
    }
  }, []);

  // Check in
  const checkIn = useCallback(async (eventId, qrToken) => {
    try {
      const response = await eventAPI.checkIn(eventId, qrToken);
      toast.success("Checked in successfully");
      return response.data.data;
    } catch (error) {
      const message =
        error.response?.data?.error?.message || "Failed to check in";
      toast.error(message);
      throw error;
    }
  }, []);

  // Get my registrations
  const getMyRegistrations = useCallback(
    async (page = 1, limit = 10, status) => {
      setLoading(true);
      try {
        const response = await registrationAPI.getMyRegistrations(
          page,
          limit,
          status
        );
        const registrations = response.data?.data || [];
        setMyRegistrations(registrations);
        return registrations;
      } catch (error) {
        console.error("Failed to get registrations:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Search events
  const searchEvents = useCallback(async (query, filters = {}) => {
    setLoading(true);
    try {
      const response = await eventAPI.searchEvents(query, filters);
      return response.data.data;
    } catch (error) {
      console.error("Failed to search events:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    events,
    selectedEvent,
    myRegistrations,
    loading,
    pagination,
    listEvents,
    createEvent,
    getEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    cancelRegistration,
    checkIn,
    getMyRegistrations,
    searchEvents,
  };

  return (
    <EventContext.Provider value={value}>{children}</EventContext.Provider>
  );
};

export const useEvent = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEvent must be used within EventProvider");
  }
  return context;
};
