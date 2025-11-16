import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEvent } from "../context/EventContext";
import { useAuth } from "../context/AuthContext";
import { useGeolocation } from "../hooks/useCustomHooks";
import {
  Button,
  Card,
  Modal,
  Alert,
  Badge,
  Skeleton,
  Avatar,
} from "../components/UI";
import { Container } from "../components/Layouts";
import toast from "react-hot-toast";

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    selectedEvent,
    getEvent,
    loading,
    registerForEvent,
    cancelRegistration,
    checkIn,
  } = useEvent();
  const { user } = useAuth();
  const { location, getCurrentLocation } = useGeolocation();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [eta, setEta] = useState(null);

  useEffect(() => {
    if (id) getEvent(id);
  }, [id]);

  const isRegistered = selectedEvent?.registrations?.some(
    (r) => r.userId === user?._id
  );
  const spotsAvailable =
    selectedEvent?.capacity - (selectedEvent?.registrations?.length || 0);
  const isEventFull = spotsAvailable <= 0;

  const handleRegisterClick = () => {
    getCurrentLocation();
    setShowConfirmModal(true);
  };

  const handleRegister = async () => {
    if (!location) {
      toast.error("Unable to get your location. Please enable geolocation.");
      return;
    }

    setIsRegistering(true);
    try {
      await registerForEvent(id);
      setShowConfirmModal(false);
      toast.success("Successfully registered for event!");
    } catch (error) {
      console.error("Failed to register:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    try {
      await checkIn(id, "qr-token");
      setShowCheckInModal(false);
      toast.success("Checked in successfully!");
    } catch (error) {
      console.error("Failed to check in:", error);
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelRegistration(id);
      toast.success("Registration cancelled");
    } catch (error) {
      console.error("Failed to cancel:", error);
    }
  };

  if (loading)
    return (
      <Container className="py-8">
        <Skeleton className="h-96 rounded" />
      </Container>
    );

  if (!selectedEvent) {
    return (
      <Container className="py-8">
        <Alert type="error" title="Event not found" />
      </Container>
    );
  }

  const startDateRaw = selectedEvent.startAt || selectedEvent.startTime;
  const endDateRaw = selectedEvent.endAt || selectedEvent.endTime;
  const eventDate = startDateRaw ? new Date(startDateRaw) : new Date();
  const endDate = endDateRaw ? new Date(endDateRaw) : null;
  const isUpcoming = eventDate > new Date();
  const eventTitle = selectedEvent.title || selectedEvent.name;
  const venueName =
    selectedEvent.location?.name ||
    selectedEvent.venue ||
    "Venue to be announced";
  const venueAddress = selectedEvent.location?.address;
  const coords = selectedEvent.location?.coords?.coordinates;
  const latitude = Array.isArray(coords)
    ? coords[1]
    : selectedEvent.location?.coords?.lat;
  const longitude = Array.isArray(coords)
    ? coords[0]
    : selectedEvent.location?.coords?.lng;
  const mapEmbedUrl =
    latitude && longitude
      ? `https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`
      : null;
  const mapLink =
    latitude && longitude
      ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      : null;
  const clubId =
    typeof selectedEvent.clubId === "object"
      ? selectedEvent.clubId?._id
      : selectedEvent.clubId;

  return (
    <Container className="py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <div className="mb-4">
              <Badge variant={isUpcoming ? "success" : "gray"}>
                {isUpcoming ? "Upcoming" : "Ended"}
              </Badge>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {eventTitle}
            </h1>
            <div className="flex flex-wrap gap-4 text-gray-600">
              <span>📅 {eventDate.toLocaleDateString()}</span>
              <span>🕐 {eventDate.toLocaleTimeString()}</span>
              <span>📍 {venueName}</span>
              <span>
                👥 {selectedEvent.registrations?.length || 0} /{" "}
                {selectedEvent.capacity} registered
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          {isUpcoming && !isRegistered && (
            <Button
              variant="primary"
              onClick={handleRegisterClick}
              disabled={isEventFull}
            >
              {isEventFull ? "Event Full" : "Register Now"}
            </Button>
          )}
          {isRegistered && (
            <>
              <Button
                variant="success"
                onClick={() => setShowCheckInModal(true)}
              >
                Check In
              </Button>
              <Button variant="danger" onClick={handleCancel}>
                Cancel Registration
              </Button>
            </>
          )}
          <Button
            variant="outline"
            onClick={() => navigate(`/clubs/${clubId}`)}
          >
            View Club
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Description */}
          <Card className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              About This Event
            </h2>
            <p className="text-gray-600 whitespace-pre-wrap">
              {selectedEvent.description}
            </p>
          </Card>

          {/* Location & Time */}
          <Card className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Location & Time
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Start Time</p>
                <p className="font-semibold">{eventDate.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">End Time</p>
                <p className="font-semibold">
                  {endDate ? endDate.toLocaleString() : "TBD"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Venue</p>
                <p className="font-semibold">{venueName}</p>
                {venueAddress && (
                  <p className="text-xs text-gray-500">{venueAddress}</p>
                )}
              </div>
              {mapEmbedUrl && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Map</p>
                  <div className="w-full h-64 rounded-lg overflow-hidden border">
                    <iframe
                      title="Event location"
                      src={mapEmbedUrl}
                      className="w-full h-full"
                      loading="lazy"
                      allowFullScreen
                    />
                  </div>
                  {mapLink && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(mapLink, "_blank")}
                      className="justify-start"
                    >
                      Open in Google Maps →
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Attendees */}
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Attendees ({selectedEvent.registrations?.length || 0})
            </h2>
            <div className="space-y-3">
              {selectedEvent.registrations?.slice(0, 10).map((reg) => (
                <div
                  key={reg._id}
                  className="flex items-center gap-3 p-2 rounded hover:bg-gray-50"
                >
                  <Avatar
                    src={reg.userId?.profilePicUrl}
                    alt={reg.userId?.name}
                    className="w-8 h-8"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {reg.userId?.name}
                    </p>
                    {reg.status === "checked-in" && (
                      <Badge variant="success" size="sm">
                        Checked In
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          {/* Event Info */}
          <Card className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Event Details
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Capacity</p>
                <p className="font-semibold text-gray-900">
                  {selectedEvent.capacity} people
                </p>
              </div>
              <div>
                <p className="text-gray-600">Available Spots</p>
                <p
                  className={`font-semibold ${spotsAvailable <= 0 ? "text-red-600" : "text-green-600"}`}
                >
                  {Math.max(0, spotsAvailable)} spots
                </p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <Badge variant={isUpcoming ? "success" : "gray"}>
                  {isUpcoming ? "Active" : "Ended"}
                </Badge>
              </div>
              {selectedEvent.college?.name && (
                <div>
                  <p className="text-gray-600">College</p>
                  <p className="font-semibold text-gray-900">
                    {selectedEvent.college.name}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Registration Info */}
          {isRegistered && (
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Your Registration
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant="success">Registered</Badge>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Register Confirmation Modal */}
      {showConfirmModal && (
        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Confirm Registration"
        >
          <p className="text-gray-600 mb-4">
            You're about to register for <strong>{selectedEvent.name}</strong>
          </p>
          {location && (
            <p className="text-sm text-gray-500 mb-6">
              📍 Your location: {location.lat?.toFixed(4)},{" "}
              {location.lng?.toFixed(4)}
            </p>
          )}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleRegister}
              loading={isRegistering}
              className="flex-1"
            >
              Register
            </Button>
          </div>
        </Modal>
      )}

      {/* Check In Modal */}
      {showCheckInModal && (
        <Modal
          isOpen={showCheckInModal}
          onClose={() => setShowCheckInModal(false)}
          title="Check In"
        >
          <p className="text-gray-600 mb-6">
            Ready to check in for {selectedEvent.name}?
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowCheckInModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleCheckIn}
              loading={isCheckingIn}
              className="flex-1"
            >
              Check In
            </Button>
          </div>
        </Modal>
      )}
    </Container>
  );
};

export default EventDetailPage;
