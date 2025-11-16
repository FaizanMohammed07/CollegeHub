import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvent } from '../context/EventContext';
import { useClub } from '../context/ClubContext';
import { clubAPI } from '../services/endpoints';
import { Button, Input, Card, Alert } from '../components/UI';
import { Container } from '../components/Layouts';
import { useForm } from '../hooks/useCustomHooks';
import toast from 'react-hot-toast';

const validateEventForm = (values) => {
  const errors = {};
  if (!values.name) errors.name = 'Event name is required';
  if (!values.description) errors.description = 'Description is required';
  if (!values.clubId) errors.clubId = 'Club is required';
  if (!values.startTime) errors.startTime = 'Start time is required';
  if (!values.endTime) errors.endTime = 'End time is required';
  if (!values.venue) errors.venue = 'Venue is required';
  if (!values.capacity) errors.capacity = 'Capacity is required';
  else if (values.capacity < 1) errors.capacity = 'Capacity must be at least 1';
  return errors;
};

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { createEvent, loading } = useEvent();
  const { clubs, listClubs } = useClub();
  const [error, setError] = useState(null);

  useEffect(() => {
    listClubs(1, 100); // Load all clubs
  }, []);

  const { values, errors, handleChange, handleSubmit, setValues } = useForm(
    {
      name: '',
      description: '',
      clubId: '',
      startTime: '',
      endTime: '',
      venue: '',
      capacity: '50',
      isPaid: false,
    },
    async (formData) => {
      setError(null);
      try {
        // Format dates
        const eventData = {
          ...formData,
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
          capacity: parseInt(formData.capacity),
        };

        const newEvent = await createEvent(eventData);
        navigate(`/events/${newEvent._id}`);
      } catch (err) {
        setError(err.message || 'Failed to create event');
      }
    },
    validateEventForm
  );

  return (
    <Container className="py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create an Event</h1>
        <p className="text-gray-600">Organize a memorable event for your club members</p>
      </div>

      {error && <Alert type="error" message={error} className="mb-6" />}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Club */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Club <span className="text-red-600">*</span>
            </label>
            <select
              name="clubId"
              value={values.clubId}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.clubId ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select a club</option>
              {clubs.map((club) => (
                <option key={club._id} value={club._id}>
                  {club.name}
                </option>
              ))}
            </select>
            {errors.clubId && <p className="text-sm text-red-600">{errors.clubId}</p>}
          </div>

          {/* Event Name */}
          <Input
            label="Event Name"
            name="name"
            value={values.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Web Development Workshop"
            required
          />

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Description <span className="text-red-600">*</span>
            </label>
            <textarea
              name="description"
              value={values.description}
              onChange={handleChange}
              placeholder="Describe your event..."
              rows={6}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
          </div>

          {/* Venue */}
          <Input
            label="Venue"
            name="venue"
            value={values.venue}
            onChange={handleChange}
            error={errors.venue}
            placeholder="Main Hall, Room 101"
            required
          />

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Start Time"
              name="startTime"
              type="datetime-local"
              value={values.startTime}
              onChange={handleChange}
              error={errors.startTime}
              required
            />
            <Input
              label="End Time"
              name="endTime"
              type="datetime-local"
              value={values.endTime}
              onChange={handleChange}
              error={errors.endTime}
              required
            />
          </div>

          {/* Capacity */}
          <Input
            label="Capacity"
            name="capacity"
            type="number"
            value={values.capacity}
            onChange={handleChange}
            error={errors.capacity}
            placeholder="50"
            min="1"
            required
          />

          {/* Paid Event */}
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isPaid"
              checked={values.isPaid}
              onChange={handleChange}
              className="rounded"
            />
            <span className="ml-2 text-sm text-gray-600">This is a paid event</span>
          </label>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/events')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
              className="flex-1"
            >
              Create Event
            </Button>
          </div>
        </form>
      </Card>
    </Container>
  );
};

export default CreateEventPage;
