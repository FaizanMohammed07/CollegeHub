import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClub } from "../context/ClubContext";
import { useAuth } from "../context/AuthContext";
import { Button, Input, Alert, Card } from "../components/UI";
import { Container } from "../components/Layouts";
import { useForm } from "../hooks/useCustomHooks";
import toast from "react-hot-toast";

const categories = [
  "technical",
  "sports",
  "cultural",
  "academic",
  "social",
  "arts",
];

const validateClubForm = (values) => {
  const errors = {};
  if (!values.name) errors.name = "Club name is required";
  if (!values.description) errors.description = "Description is required";
  if (!values.category) errors.category = "Category is required";
  if (!values.slug) errors.slug = "URL slug is required";
  else if (!/^[a-z0-9-]+$/.test(values.slug))
    errors.slug =
      "Slug must contain only lowercase letters, numbers, and hyphens";
  return errors;
};

const CreateClubPage = () => {
  const navigate = useNavigate();
  const { createClub, loading } = useClub();
  const { user } = useAuth();
  const [error, setError] = useState(null);

  const { values, errors, handleChange, handleSubmit, setValues } = useForm(
    {
      name: "",
      slug: "",
      description: "",
      category: "",
      logoUrl: "",
      websiteUrl: "",
    },
    async (formData) => {
      setError(null);
      try {
        const newClub = await createClub(formData);
        navigate(`/clubs/${newClub._id}`);
      } catch (err) {
        setError(err.message || "Failed to create club");
      }
    },
    validateClubForm
  );

  // Auto-generate slug from name
  const handleNameChange = (e) => {
    handleChange(e);
    if (
      !values.slug ||
      values.slug === values.name.toLowerCase().replace(/\s+/g, "-")
    ) {
      setValues({
        ...values,
        name: e.target.value,
        slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
      });
    }
  };

  return (
    <Container className="py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create a New Club
        </h1>
        <p className="text-gray-600">
          Start a club and bring people together around your passion
        </p>
      </div>

      {error && <Alert type="error" message={error} className="mb-6" />}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Club Name */}
          <Input
            label="Club Name"
            name="name"
            value={values.name}
            onChange={handleNameChange}
            error={errors.name}
            placeholder="Tech Innovation Club"
            required
          />

          {/* URL Slug */}
          <Input
            label="URL Slug"
            name="slug"
            value={values.slug}
            onChange={handleChange}
            error={errors.slug}
            placeholder="tech-innovation-club"
            required
            disabled
          />

          {/* Category */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Category <span className="text-red-600">*</span>
            </label>
            <select
              name="category"
              value={values.category}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.category ? "border-red-500" : "border-gray-300"
              }`}
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Description <span className="text-red-600">*</span>
            </label>
            <textarea
              name="description"
              value={values.description}
              onChange={handleChange}
              error={errors.description}
              placeholder="Tell members what your club is about..."
              rows={6}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Logo URL */}
          <Input
            label="Logo URL"
            name="logoUrl"
            type="url"
            value={values.logoUrl}
            onChange={handleChange}
            placeholder="https://example.com/logo.jpg"
          />

          {/* Website URL */}
          <Input
            label="Website URL (Optional)"
            name="websiteUrl"
            type="url"
            value={values.websiteUrl}
            onChange={handleChange}
            placeholder="https://yourclub.com"
          />

          {/* Info Box */}
          <Alert
            type="info"
            title="Club Guidelines"
            message="Ensure your club follows all college policies. Club must have at least 5 members to be verified."
          />

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/clubs")}
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
              Create Club
            </Button>
          </div>
        </form>
      </Card>
    </Container>
  );
};

export default CreateClubPage;
