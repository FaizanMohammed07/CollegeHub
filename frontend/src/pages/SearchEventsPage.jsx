import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useEvent } from "../context/EventContext";
import { useGeolocation } from "../hooks/useCustomHooks";
import { useDebounce } from "../hooks/useCustomHooks";
import { Container, EmptyState } from "../components/Layouts";
import { Button, Card, Badge, Input, Skeleton } from "../components/UI";
import { endpoints } from "../services/endpoints";

const SearchEventsPage = () => {
  const { loading } = useEvent();
  const { location, getLocation } = useGeolocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);

  // Filters
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDate, setFilterDate] = useState("all");
  const [filterDistance, setFilterDistance] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  const categories = [
    "Academic",
    "Sports",
    "Cultural",
    "Technical",
    "Social",
    "Entrepreneurship",
  ];

  // Load events on mount
  useEffect(() => {
    loadAllEvents();
    getLocation();
  }, []);

  // Filter events when search or filters change
  useEffect(() => {
    filterEvents(events);
  }, [
    debouncedSearch,
    filterCategory,
    filterDate,
    filterDistance,
    sortBy,
    location,
  ]);

  const loadAllEvents = async () => {
    try {
      setPageLoading(true);
      const response = await endpoints.eventAPI.listAllEvents(1, 100);

      if (response.data?.events) {
        setEvents(response.data.events);
      }
    } catch (err) {
      console.error("Error loading events:", err);
      toast.error("Failed to load events");
    } finally {
      setPageLoading(false);
    }
  };

  const filterEvents = (eventsList) => {
    let filtered = eventsList;

    // Text search
    if (debouncedSearch.trim()) {
      filtered = filtered.filter(
        (event) =>
          event.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          event.description
            ?.toLowerCase()
            .includes(debouncedSearch.toLowerCase()) ||
          event.club?.name
            ?.toLowerCase()
            .includes(debouncedSearch.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter((event) => event.category === filterCategory);
    }

    // Date filter
    const now = new Date();
    if (filterDate !== "all") {
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.startTime);

        if (filterDate === "today") {
          return eventDate.toDateString() === now.toDateString();
        } else if (filterDate === "week") {
          const nextWeek = new Date(now);
          nextWeek.setDate(nextWeek.getDate() + 7);
          return eventDate >= now && eventDate <= nextWeek;
        } else if (filterDate === "month") {
          const nextMonth = new Date(now);
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          return eventDate >= now && eventDate <= nextMonth;
        } else if (filterDate === "past") {
          return eventDate < now;
        }
        return true;
      });
    }

    // Distance filter (requires geolocation)
    if (filterDistance !== "all" && location) {
      filtered = filtered.filter((event) => {
        if (!event.coordinates) return true;

        const distance = calculateDistance(
          location.latitude,
          location.longitude,
          event.coordinates.latitude,
          event.coordinates.longitude
        );

        const maxDistance = parseInt(filterDistance);
        return distance <= maxDistance;
      });
    }

    // Sorting
    if (sortBy === "date") {
      filtered.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    } else if (sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "capacity") {
      filtered.sort((a, b) => {
        const spotsA = a.capacity - (a.registrations?.length || 0);
        const spotsB = b.capacity - (b.registrations?.length || 0);
        return spotsB - spotsA;
      });
    } else if (sortBy === "distance" && location) {
      filtered.sort((a, b) => {
        const distA = a.coordinates
          ? calculateDistance(
              location.latitude,
              location.longitude,
              a.coordinates.latitude,
              a.coordinates.longitude
            )
          : Infinity;
        const distB = b.coordinates
          ? calculateDistance(
              location.latitude,
              location.longitude,
              b.coordinates.latitude,
              b.coordinates.longitude
            )
          : Infinity;
        return distA - distB;
      });
    }

    setFilteredEvents(filtered);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);

    if (now < startTime) return "upcoming";
    if (now >= startTime && now <= endTime) return "ongoing";
    return "ended";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "upcoming":
        return <Badge variant="blue">📅 Upcoming</Badge>;
      case "ongoing":
        return <Badge variant="green">🔴 Live</Badge>;
      case "ended":
        return <Badge variant="gray">✓ Ended</Badge>;
      default:
        return null;
    }
  };

  return (
    <Container className="py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Search Events</h1>
        <p className="text-gray-600">Find events that match your interests</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        {/* Search Box */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search events by name, description, or club..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="🔍"
          />
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="past">Past Events</option>
            </select>
          </div>

          {/* Distance Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Distance {location && "📍"}
            </label>
            <select
              value={filterDistance}
              onChange={(e) => setFilterDistance(e.target.value)}
              disabled={!location}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="all">All Distances</option>
              <option value="1">Within 1 km</option>
              <option value="5">Within 5 km</option>
              <option value="10">Within 10 km</option>
              <option value="20">Within 20 km</option>
              <option value="50">Within 50 km</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Date (Earliest First)</option>
              <option value="name">Name (A-Z)</option>
              <option value="capacity">Available Spots</option>
              {location && (
                <option value="distance">Distance (Nearest First)</option>
              )}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Found <strong>{filteredEvents.length}</strong> event
          {filteredEvents.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Events List */}
      {pageLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28" count={5} />
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="space-y-4">
          {filteredEvents.map((event) => {
            const eventStatus = getEventStatus(event);
            const spotsAvailable =
              event.capacity - (event.registrations?.length || 0);
            const distance =
              location && event.coordinates
                ? calculateDistance(
                    location.latitude,
                    location.longitude,
                    event.coordinates.latitude,
                    event.coordinates.longitude
                  )
                : null;

            return (
              <Card
                key={event._id}
                className="hover:shadow-lg transition overflow-hidden"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Event Image Placeholder */}
                  {event.image && (
                    <div className="w-full md:w-48 h-40 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <img
                        src={event.image}
                        alt={event.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {!event.image && (
                    <div className="w-full md:w-48 h-40 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-4xl">📅</span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {event.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            🏢 {event.club?.name || "Unknown Club"}
                          </p>
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 my-3 text-sm">
                        <div className="flex items-center gap-1">
                          <span>📅</span>
                          <span className="text-gray-900 font-medium">
                            {new Date(event.startTime).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>🕐</span>
                          <span className="text-gray-900 font-medium">
                            {new Date(event.startTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>📍</span>
                          <span className="text-gray-900 font-medium">
                            {event.venue || "TBD"}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {event.description}
                      </p>
                    </div>

                    {/* Badges and Actions */}
                    <div className="mt-4">
                      <div className="flex gap-2 flex-wrap mb-3">
                        {getStatusBadge(eventStatus)}
                        <Badge variant="blue">{event.category}</Badge>

                        {spotsAvailable > 0 ? (
                          <Badge variant="green">
                            🎫 {spotsAvailable} spot
                            {spotsAvailable !== 1 ? "s" : ""} left
                          </Badge>
                        ) : (
                          <Badge variant="red">❌ Event Full</Badge>
                        )}

                        {event.isPaid && (
                          <Badge variant="yellow">💰 Paid</Badge>
                        )}

                        {distance && (
                          <Badge variant="purple">
                            📍 {distance.toFixed(1)} km away
                          </Badge>
                        )}
                      </div>

                      <Link to={`/events/${event._id}`}>
                        <Button variant="primary" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon="🔍"
          title="No Events Found"
          description="Try adjusting your search filters or check back later"
          action={
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterCategory("all");
                setFilterDate("all");
                setFilterDistance("all");
                setSortBy("date");
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all filters
            </button>
          }
        />
      )}
    </Container>
  );
};

export default SearchEventsPage;
