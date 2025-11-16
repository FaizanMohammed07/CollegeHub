import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEvent } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import { useGeolocation } from '../hooks/useCustomHooks';
import { Button, Card, Input, Skeleton, Badge, Alert } from '../components/UI';
import { Container } from '../components/Layouts';
import { useDebounce } from '../hooks/useCustomHooks';

const EventsListPage = () => {
  const navigate = useNavigate();
  const { events, loading, listEvents, pagination } = useEvent();
  const { user } = useAuth();
  const { location, getCurrentLocation } = useGeolocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('published');
  const [maxDistance, setMaxDistance] = useState(5000);
  const [showOnlyNearby, setShowOnlyNearby] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    const filters = { status: filterStatus };
    if (showOnlyNearby && location) {
      filters.lat = location.lat;
      filters.lng = location.lng;
      filters.maxDistance = maxDistance;
    }
    listEvents(1, 12, filters);
  }, [filterStatus, showOnlyNearby, maxDistance, location]);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const isAdmin = ['club_admin', 'college_admin', 'super_admin'].includes(user?.role);

  return (
    <Container className="py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Discover Events</h1>
          <p className="text-gray-600">Find and register for events happening on campus</p>
        </div>
        {isAdmin && (
          <Link to="/events/create">
            <Button variant="success">+ Create Event</Button>
          </Link>
        )}
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Events</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={maxDistance}
            onChange={(e) => setMaxDistance(Number(e.target.value))}
          >
            <option value={1000}>1 km</option>
            <option value={5000}>5 km</option>
            <option value={10000}>10 km</option>
            <option value={20000}>20 km</option>
          </select>

          <label className="flex items-center p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={showOnlyNearby}
              onChange={(e) => setShowOnlyNearby(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="ml-2 text-sm">Nearby Events</span>
          </label>
        </div>

        {showOnlyNearby && location && (
          <p className="text-sm text-gray-600">
            📍 Showing events within {maxDistance / 1000}km of your location
          </p>
        )}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-72 rounded" count={6} />
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const eventDate = new Date(event.startTime);
            const isUpcoming = eventDate > new Date();
            const spotsLeft = event.capacity - (event.registrations?.length || 0);

            return (
              <Card key={event._id} className="flex flex-col h-full hover:shadow-lg hover:border-blue-300 cursor-pointer">
                {/* Date Badge */}
                <div className="absolute top-4 right-4">
                  <Badge variant={isUpcoming ? 'success' : 'gray'}>
                    {isUpcoming ? 'Upcoming' : 'Ended'}
                  </Badge>
                </div>

                {/* Event Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{event.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>{eventDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🕐</span>
                      <span>{eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span>{event.venue || 'TBD'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>👥</span>
                      <span>
                        {spotsLeft <= 0 ? (
                          <span className="text-red-600 font-semibold">Full</span>
                        ) : (
                          <span>{spotsLeft} spots left</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* View Button */}
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(`/events/${event._id}`)}
                >
                  View Details
                </Button>
              </Card>
            );
          })}
        </div>
      ) : (
        <Alert type="info" title="No events found" message="Try adjusting your search filters" />
      )}

      {/* Pagination Info */}
      <div className="mt-8 text-center text-gray-600">
        Showing {events.length} of {pagination.total} events
      </div>
    </Container>
  );
};

export default EventsListPage;
