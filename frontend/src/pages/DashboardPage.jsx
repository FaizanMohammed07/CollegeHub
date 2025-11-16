import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";
import { useClub } from "../context/ClubContext";
import { useEvent } from "../context/EventContext";
import { Container } from "../components/Layouts";
import { Card, Badge, Skeleton } from "../components/UI";
import { Link } from "react-router-dom";

const DashboardPage = () => {
  const { user } = useAuth();
  const { profile, getProfile, loading: userLoading } = useUser();
  const { clubs, listClubs, loading: clubsLoading } = useClub();
  const { events, listEvents, loading: eventsLoading } = useEvent();

  useEffect(() => {
    getProfile();
    listClubs(1, 5);
    listEvents(1, 5);
  }, []);

  const isAdmin = ["club_admin", "college_admin", "super_admin"].includes(
    user?.role
  );

  return (
    <Container className="py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600">
          Here's what's happening in your college community
        </p>
      </div>

      {profile?.college && (
        <Card className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-gray-500">
                My College
              </p>
              <h2 className="text-2xl font-bold text-gray-900">
                {profile.college.name}
              </h2>
              {profile.college.address && (
                <p className="text-gray-600">{profile.college.address}</p>
              )}
            </div>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm text-gray-500">Active Clubs</p>
                <p className="text-2xl font-bold text-gray-900 text-center">
                  {clubs?.length || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Upcoming Events</p>
                <p className="text-2xl font-bold text-gray-900 text-center">
                  {events?.length || 0}
                </p>
              </div>
              <Link
                to="/search"
                className="text-blue-600 font-semibold hover:underline"
              >
                Explore Campus →
              </Link>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Featured Clubs */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Featured Clubs</h2>
            <Link to="/clubs" className="text-blue-600 hover:underline text-sm">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {clubsLoading ? (
              <Skeleton className="h-20 rounded" count={3} />
            ) : clubs && clubs.length > 0 ? (
              clubs.map((club) => (
                <Card
                  key={club._id}
                  className="cursor-pointer hover:border-blue-300"
                >
                  <Link to={`/clubs/${club._id}`} className="block">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {club.name}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {club.description}
                        </p>
                        <div className="mt-2 flex gap-2">
                          <Badge variant="primary">{club.category}</Badge>
                          <Badge variant="gray">
                            {club.members?.length || 0} members
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Link>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">No clubs yet</div>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Upcoming Events
            </h2>
            <Link
              to="/events"
              className="text-blue-600 hover:underline text-sm"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {eventsLoading ? (
              <Skeleton className="h-20 rounded" count={3} />
            ) : events && events.length > 0 ? (
              events.map((event) => (
                <Card
                  key={event._id}
                  className="cursor-pointer hover:border-blue-300"
                >
                  <Link to={`/events/${event._id}`} className="block">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {event.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {event.venue || "TBD"}
                        </p>
                        <div className="mt-2 text-sm text-gray-500">
                          📅 {new Date(event.startTime).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant="success">
                        {event.capacity - (event.registrations?.length || 0)}{" "}
                        spots
                      </Badge>
                    </div>
                  </Link>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No upcoming events
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default DashboardPage;
