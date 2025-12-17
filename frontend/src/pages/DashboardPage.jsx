import React, { useEffect, useMemo, useState } from "react";
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

  const announcementBlocks = useMemo(
    () => [
      {
        title: "Spring Innovation Week",
        description:
          "Virtual reality prototyping lab now open in Block C for applied research",
        detail:
          "Conducted by the Tech Council — curated for student innovators.",
      },
      {
        title: "Career Connect Series",
        description:
          "Mentorship hours with global alumni and hiring partners this Friday.",
        detail:
          "Reserve your seat; capacity capped at 50 students per session.",
      },
      {
        title: "Art & Culture Circuit",
        description:
          "Campus mural challenge—submit team entries by Jan 10 for cash prizes.",
        detail:
          "Presented by the Culture Board; materials sponsored for winning crews.",
      },
    ],
    []
  );

  const [activeAnnouncement, setActiveAnnouncement] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveAnnouncement((prev) =>
        prev + 1 >= announcementBlocks.length ? 0 : prev + 1
      );
    }, 6000);
    return () => clearInterval(id);
  }, [announcementBlocks.length]);

  return (
    <Container className="py-8">
      <div className="mb-12">
        <div className="relative overflow-hidden rounded-[32px] border border-white/20 bg-gradient-to-br from-slate-950 via-indigo-900 to-sky-900 p-8 text-white shadow-2xl">
          <div className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_55%)]" />
          <div className="relative">
            <p className="text-sm uppercase tracking-[0.5em] text-sky-200 mb-4">
              Admin Broadcast
            </p>
            <h1 className="text-4xl lg:text-5xl font-black leading-tight mb-4">
              Campus Premium Feed
            </h1>
            <p className="text-lg text-white/80 max-w-2xl">
              Curated by your college leadership, this carousel brings the
              big-stage announcements, partnerships, and recognitions to the
              forefront before you dive into clubs and events.
            </p>
            <div className="relative mt-10">
              <div className="flex overflow-hidden">
                {announcementBlocks.map((item, index) => (
                  <div
                    key={item.title}
                    className={`min-w-full transition-transform duration-500 ease-out ${
                      index === activeAnnouncement
                        ? "translate-x-0"
                        : index < activeAnnouncement
                          ? "-translate-x-full"
                          : "translate-x-full"
                    } flex-shrink-0`}
                  >
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.4em] text-sky-100">
                        Featured Alert
                      </p>
                      <h3 className="text-3xl font-semibold">{item.title}</h3>
                      <p className="text-white/80 text-base">
                        {item.description}
                      </p>
                      <p className="text-sm text-white/60">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                {announcementBlocks.map((_, index) => (
                  <button
                    key={index}
                    aria-label={`Navigate to ${announcementBlocks[index].title}`}
                    onClick={() => setActiveAnnouncement(index)}
                    className={`h-2 w-12 rounded-full transition ${
                      index === activeAnnouncement ? "bg-white" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
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
