import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useClub } from "../context/ClubContext";
import { useAuth } from "../context/AuthContext";
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

const ClubDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    selectedClub,
    getClub,
    loading,
    leaveClub,
    updateClub,
    getClubMembers,
    joinClub,
  } = useClub();
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);

  useEffect(() => {
    if (id) {
      getClub(id);
      loadMembers();
    }
  }, [id]);

  const loadMembers = async () => {
    try {
      const data = await getClubMembers(id);
      setMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load members:", error);
      setMembers([]);
    }
  };

  const handleJoinClub = async () => {
    try {
      setJoinLoading(true);
      await joinClub(id);
      toast.success("Join request sent");
      await loadMembers();
    } catch (error) {
      console.error("Failed to join club:", error);
    } finally {
      setJoinLoading(false);
    }
  };

  const handleLeaveClub = async () => {
    try {
      await leaveClub(id);
      setShowLeaveModal(false);
      navigate("/clubs");
    } catch (error) {
      console.error("Failed to leave club:", error);
    }
  };

  const handleUpdateClub = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await updateClub(id, editData);
      setIsEditing(false);
      toast.success("Club updated successfully");
    } catch (error) {
      console.error("Failed to update club:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading)
    return (
      <Container className="py-8">
        <Skeleton className="h-96 rounded" />
      </Container>
    );

  if (!selectedClub) {
    return (
      <Container className="py-8">
        <Alert
          type="error"
          title="Club not found"
          message="The club you're looking for doesn't exist."
        />
      </Container>
    );
  }

  const normalizedMemberIds = (selectedClub.members || []).map((member) => {
    if (typeof member === "string") return member;
    if (member?._id) return member._id.toString();
    if (member?.userId) return member.userId.toString();
    return "";
  });
  const isCreator = selectedClub.creatorId === user?._id;
  const isMember = normalizedMemberIds.includes(user?._id);
  const isClubAdmin = (selectedClub.admins || []).some((admin) => {
    if (typeof admin === "string") return admin === user?._id;
    if (admin?._id) return admin._id.toString() === user?._id;
    return false;
  });
  const isAdmin =
    isClubAdmin || ["club_admin", "college_admin"].includes(user?.role);
  const totalMembers =
    selectedClub.stats?.members ??
    selectedClub.membersCount ??
    normalizedMemberIds.filter(Boolean).length;
  const socialLinks = selectedClub.socialLinks
    ? Object.entries(selectedClub.socialLinks).filter(([, value]) =>
        Boolean(value)
      )
    : [];
  const clubEvents = selectedClub.events || [];
  const college = selectedClub.college || selectedClub.collegeId;

  return (
    <Container className="py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            {selectedClub.logoUrl && (
              <img
                src={selectedClub.logoUrl}
                alt={selectedClub.name}
                className="w-32 h-32 object-cover rounded-lg mb-4"
              />
            )}
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {selectedClub.name}
            </h1>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="primary">{selectedClub.category}</Badge>
              <Badge variant="gray">{totalMembers} members</Badge>
              {selectedClub.verified && (
                <Badge variant="success">Verified</Badge>
              )}
            </div>
          </div>

          {isCreator || isAdmin ? (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit Club
            </Button>
          ) : null}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!isMember && (
            <Button
              variant="primary"
              onClick={handleJoinClub}
              loading={joinLoading}
            >
              Join Club
            </Button>
          )}
          {isMember && (
            <Button variant="danger" onClick={() => setShowLeaveModal(true)}>
              Leave Club
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Description */}
          <Card className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
            <p className="text-gray-600 whitespace-pre-wrap">
              {selectedClub.description}
            </p>
          </Card>

          {/* Website & Social Links */}
          {selectedClub.websiteUrl || socialLinks.length > 0 ? (
            <Card className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Connect</h2>
              <div className="space-y-3">
                {selectedClub.websiteUrl && (
                  <a
                    href={selectedClub.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline block"
                  >
                    🌐 Visit Website
                  </a>
                )}
                {socialLinks.map(([platform, link]) => (
                  <a
                    key={platform}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline block"
                  >
                    🔗 {platform}
                  </a>
                ))}
              </div>
            </Card>
          ) : null}

          {/* Events Section */}
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Upcoming Events
            </h2>
            {clubEvents.length > 0 ? (
              <div className="space-y-3">
                {clubEvents.map((event) => (
                  <div key={event._id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {event.title || event.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          📅{" "}
                          {new Date(
                            event.startAt || event.startTime
                          ).toLocaleDateString()}{" "}
                          ·{" "}
                          {event.location?.name ||
                            event.location?.address ||
                            "Venue TBA"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/events/${event._id}`)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No upcoming events</p>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          {college && (
            <Card className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">College</h2>
              <p className="font-semibold text-gray-900">{college.name}</p>
              {college.address && (
                <p className="text-sm text-gray-600 mt-1">{college.address}</p>
              )}
              {college.domain && (
                <p className="text-sm text-gray-500 mt-1">{college.domain}</p>
              )}
            </Card>
          )}

          {/* Members */}
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Members ({members?.length || 0})
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {members &&
                members.length > 0 &&
                members.slice(0, 10).map((member) => (
                  <div key={member._id} className="flex items-center gap-3">
                    <Avatar
                      src={member.profilePicUrl}
                      alt={member.name}
                      className="w-8 h-8"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-sm text-gray-900 truncate">
                        {member.name}
                      </p>
                      {member.role === "admin" && (
                        <Badge variant="primary" size="sm">
                          Admin
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
            </div>
            {members && members.length > 10 && (
              <Button variant="outline" size="sm" className="w-full mt-4">
                View All ({members.length})
              </Button>
            )}
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <Modal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          title="Edit Club"
        >
          <form onSubmit={handleUpdateClub} className="space-y-4">
            <input
              type="text"
              placeholder="Club Name"
              value={editData.name || selectedClub.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <textarea
              placeholder="Description"
              value={editData.description || selectedClub.description}
              onChange={(e) =>
                setEditData({ ...editData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg h-24"
            />
            <input
              type="url"
              placeholder="Logo URL"
              value={editData.logoUrl || selectedClub.logoUrl || ""}
              onChange={(e) =>
                setEditData({ ...editData, logoUrl: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setIsEditing(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                loading={isUpdating}
                className="flex-1"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Leave Club Modal */}
      {showLeaveModal && (
        <Modal
          isOpen={showLeaveModal}
          onClose={() => setShowLeaveModal(false)}
          title="Leave Club"
        >
          <p className="text-gray-600 mb-6">
            Are you sure you want to leave {selectedClub.name}? You can rejoin
            anytime.
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowLeaveModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleLeaveClub}
              className="flex-1"
            >
              Leave Club
            </Button>
          </div>
        </Modal>
      )}
    </Container>
  );
};

export default ClubDetailPage;
