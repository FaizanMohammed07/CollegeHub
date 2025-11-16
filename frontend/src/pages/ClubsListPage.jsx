import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useClub } from '../context/ClubContext';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Input, Skeleton, Badge, Modal, Alert } from '../components/UI';
import { Container } from '../components/Layouts';
import { useDebounce } from '../hooks/useCustomHooks';
import toast from 'react-hot-toast';

const ClubsListPage = () => {
  const navigate = useNavigate();
  const { clubs, loading, listClubs, joinClub, pagination } = useClub();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [selectedClub, setSelectedClub] = useState(null);
  const [isJoiningClub, setIsJoiningClub] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 500);

  const categories = ['technical', 'sports', 'cultural', 'academic', 'social', 'arts'];

  useEffect(() => {
    listClubs(1, 12, category);
  }, [category]);

  const handleJoinClub = async (clubId) => {
    setIsJoiningClub(true);
    try {
      await joinClub(clubId);
      setSelectedClub(null);
    } catch (error) {
      console.error('Failed to join club:', error);
    } finally {
      setIsJoiningClub(false);
    }
  };

  const isAdmin = ['club_admin', 'college_admin', 'super_admin'].includes(user?.role);

  return (
    <Container className="py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Explore Clubs</h1>
          <p className="text-gray-600">Join clubs and connect with your peers</p>
        </div>
        {isAdmin && (
          <Link to="/clubs/create">
            <Button variant="success">+ Create Club</Button>
          </Link>
        )}
      </div>

      {/* Search & Filters */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Search clubs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
        <div className="text-sm text-gray-600 self-center">
          {pagination.total} clubs found
        </div>
      </div>

      {/* Clubs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded" count={6} />
        </div>
      ) : clubs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <Card key={club._id} className="flex flex-col h-full cursor-pointer hover:border-blue-400">
              {club.logoUrl && (
                <img
                  src={club.logoUrl}
                  alt={club.name}
                  className="w-full h-40 object-cover rounded-t-lg -m-6 mb-4"
                />
              )}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{club.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{club.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="primary">{club.category}</Badge>
                  <Badge variant="gray">{club.members?.length || 0} members</Badge>
                </div>
              </div>

              <div className="flex gap-2 mt-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => navigate(`/clubs/${club._id}`)}
                >
                  View
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  onClick={() => setSelectedClub(club)}
                >
                  Join
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Alert type="info" title="No clubs found" message="Try adjusting your search filters" />
      )}

      {/* Join Confirmation Modal */}
      {selectedClub && (
        <Modal
          isOpen={!!selectedClub}
          onClose={() => setSelectedClub(null)}
          title={`Join ${selectedClub.name}?`}
        >
          <p className="text-gray-600 mb-6">{selectedClub.description}</p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setSelectedClub(null)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => handleJoinClub(selectedClub._id)}
              loading={isJoiningClub}
              className="flex-1"
            >
              Join Club
            </Button>
          </div>
        </Modal>
      )}
    </Container>
  );
};

export default ClubsListPage;
