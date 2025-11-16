import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useEvent } from "../context/EventContext";
import { useAuth } from "../context/AuthContext";
import { Container, EmptyState } from "../components/Layouts";
import { Button, Card, Badge, Modal, Input, Skeleton } from "../components/UI";
import { endpoints } from "../services/endpoints";

const MyRegistrationsPage = () => {
  const { user } = useAuth();
  const { loading } = useEvent();
  const [registrations, setRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [canceling, setCanceling] = useState(false);

  const normalizeStatus = (value = "") =>
    value?.toLowerCase().replace(/-/g, "_") || "";

  const modalEvent =
    selectedRegistration?.event || selectedRegistration?.eventId || null;
  const modalEventName = modalEvent
    ? modalEvent.name || modalEvent.title || "this event"
    : "this event";

  // Load user registrations
  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    try {
      setPageLoading(true);
      const response = await endpoints.registrationAPI.getMyRegistrations();
      const payload = response.data?.data;
      const list = payload?.registrations || payload || [];

      setRegistrations(list);
      filterRegistrations(list, searchTerm, filterStatus);
    } catch (err) {
      console.error("Error loading registrations:", err);
      toast.error("Failed to load registrations");
    } finally {
      setPageLoading(false);
    }
  };

  // Filter registrations based on search and status
  const filterRegistrations = (data, search, status) => {
    let filtered = Array.isArray(data) ? [...data] : [];

    if (status !== "all") {
      filtered = filtered.filter(
        (reg) => normalizeStatus(reg.status) === normalizeStatus(status)
      );
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      filtered = filtered.filter((reg) => {
        const event = reg.event || reg.eventId || {};
        const eventName = (event.name || event.title || "").toLowerCase();
        const clubName = (
          event.club?.name ||
          event.clubId?.name ||
          ""
        ).toLowerCase();
        return (
          (eventName && eventName.includes(term)) ||
          (clubName && clubName.includes(term))
        );
      });
    }

    setFilteredRegistrations(filtered);
  };

  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterRegistrations(registrations, term, filterStatus);
  };

  // Handle status filter
  const handleStatusFilter = (status) => {
    setFilterStatus(status);
    filterRegistrations(registrations, searchTerm, status);
  };

  // Cancel registration
  const handleCancelRegistration = async () => {
    if (!selectedRegistration) return;

    setCanceling(true);
    try {
      await endpoints.registrationAPI.cancelRegistration(
        selectedRegistration._id,
        cancellationReason
      );

      toast.success("Registration cancelled successfully");
      setShowCancelModal(false);
      setCancellationReason("");
      loadRegistrations();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to cancel registration"
      );
    } finally {
      setCanceling(false);
    }
  };

  const getEventStatus = (event = {}) => {
    const now = new Date();
    const startTime = new Date(event.startAt || event.startTime || now);
    const endTime = new Date(event.endAt || event.endTime || startTime);

    if (now < startTime) return "upcoming";
    if (now >= startTime && now <= endTime) return "ongoing";
    return "ended";
  };

  const getEventStatusBadge = (status) => {
    switch (status) {
      case "upcoming":
        return <Badge variant="blue">📅 Upcoming</Badge>;
      case "ongoing":
        return <Badge variant="green">🔴 Ongoing</Badge>;
      case "ended":
        return <Badge variant="gray">✓ Ended</Badge>;
      default:
        return <Badge variant="gray">Unknown</Badge>;
    }
  };

  const getRegistrationStatusBadge = (status) => {
    const normalized = normalizeStatus(status);
    switch (normalized) {
      case "registered":
        return <Badge variant="green">✓ Registered</Badge>;
      case "cancelled":
        return <Badge variant="red">✗ Cancelled</Badge>;
      case "checked_in":
      case "checked-in":
        return <Badge variant="green">✓ Checked In</Badge>;
      case "no_show":
      case "no-show":
        return <Badge variant="yellow">⚠ No Show</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  return (
    <Container className="py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          My Event Registrations
        </h1>
        <p className="text-gray-600">
          Manage your event registrations and track your attendance
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-1">Total Registered</p>
            <p className="text-2xl font-bold text-gray-900">
              {
                registrations.filter(
                  (r) => normalizeStatus(r.status) === "registered"
                ).length
              }
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-1">Checked In</p>
            <p className="text-2xl font-bold text-gray-900">
              {
                registrations.filter(
                  (r) => normalizeStatus(r.status) === "checked_in"
                ).length
              }
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-1">Waitlisted</p>
            <p className="text-2xl font-bold text-gray-900">
              {
                registrations.filter(
                  (r) => normalizeStatus(r.status) === "waitlist"
                ).length
              }
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-1">Cancelled</p>
            <p className="text-2xl font-bold text-gray-900">
              {
                registrations.filter(
                  (r) => normalizeStatus(r.status) === "cancelled"
                ).length
              }
            </p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <Input
          type="text"
          placeholder="Search events by name or club..."
          value={searchTerm}
          onChange={handleSearch}
          icon="🔍"
        />

        <div className="flex gap-2 flex-wrap">
          {["all", "registered", "checked_in", "cancelled", "no_show"].map(
            (status) => (
              <button
                key={status}
                onClick={() => handleStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {status === "all"
                  ? "All"
                  : status.replace("_", " ").toUpperCase()}
              </button>
            )
          )}
        </div>
      </div>

      {/* Registrations List */}
      {pageLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24" count={5} />
        </div>
      ) : filteredRegistrations.length > 0 ? (
        <div className="space-y-4">
          {filteredRegistrations.map((registration) => {
            const event = registration.event || registration.eventId || {};
            const eventStatus = getEventStatus(event);
            const eventName = event.name || event.title || "Untitled Event";
            const clubName = event.club?.name || event.clubId?.name;
            const venue = event.venue || event.location?.name || "TBD";
            const startDate = event.startAt || event.startTime;
            const fallbackEventId =
              typeof registration.eventId === "string"
                ? registration.eventId
                : registration.eventId && registration.eventId._id;
            const eventLink = `/events/${event._id || fallbackEventId || ""}`;

            return (
              <Card
                key={registration._id}
                className="hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {eventName}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          🏢 {clubName || "Unknown Club"}
                        </p>
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 my-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">📅 Date:</span>
                        <span className="font-medium text-gray-900">
                          {startDate
                            ? new Date(startDate).toLocaleDateString()
                            : "TBD"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">🕐 Time:</span>
                        <span className="font-medium text-gray-900">
                          {startDate
                            ? new Date(startDate).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "TBD"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">📍 Venue:</span>
                        <span className="font-medium text-gray-900">
                          {venue}
                        </span>
                      </div>
                    </div>

                    {/* Registration Details */}
                    <div className="flex gap-2 flex-wrap mt-3">
                      {getRegistrationStatusBadge(registration.status)}
                      {getEventStatusBadge(eventStatus)}

                      {registration.checkedInAt && (
                        <Badge variant="green">
                          ✓ Checked in{" "}
                          {new Date(
                            registration.checkedInAt
                          ).toLocaleDateString()}
                        </Badge>
                      )}

                      {event.isPaid && (
                        <Badge variant="blue">💰 Paid Event</Badge>
                      )}
                    </div>

                    {/* Registered At */}
                    {registration.createdAt && (
                      <p className="text-xs text-gray-500 mt-3">
                        Registered on{" "}
                        {new Date(registration.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-col gap-2">
                    <Link to={eventLink} className="inline-block">
                      <Button variant="outline" size="sm">
                        View Event
                      </Button>
                    </Link>

                    {registration.status !== "cancelled" &&
                      eventStatus === "upcoming" && (
                        <button
                          onClick={() => {
                            setSelectedRegistration(registration);
                            setShowCancelModal(true);
                          }}
                          className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium text-sm"
                        >
                          Cancel
                        </button>
                      )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon="ticket"
          title="No Registrations"
          description={
            registrations.length === 0
              ? "You haven't registered for any events yet. Browse events and join one!"
              : "No registrations match your filters."
          }
          action={
            registrations.length === 0 ? (
              <Link to="/events">
                <Button variant="primary">Browse Events</Button>
              </Link>
            ) : null
          }
        />
      )}

      {/* Cancel Registration Modal */}
      {showCancelModal && selectedRegistration && (
        <Modal
          title="Cancel Registration"
          onClose={() => {
            setShowCancelModal(false);
            setCancellationReason("");
          }}
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to cancel your registration for{" "}
              <strong>{modalEventName}</strong>?
            </p>

            <textarea
              placeholder="Reason for cancellation (optional)"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancellationReason("");
                }}
              >
                Keep Registration
              </Button>
              <Button
                variant="danger"
                loading={canceling}
                onClick={handleCancelRegistration}
              >
                {canceling ? "Cancelling..." : "Cancel Registration"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </Container>
  );
};

export default MyRegistrationsPage;
