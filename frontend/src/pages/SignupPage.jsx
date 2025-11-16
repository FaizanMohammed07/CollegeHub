import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, Input, Alert, Badge } from "../components/UI";
import { useForm, useDebounce } from "../hooks/useCustomHooks";
import { searchAPI } from "../services/endpoints";
import toast from "react-hot-toast";

const validateForm = (values) => {
  const errors = {};

  if (!values.name) errors.name = "Name is required";
  else if (values.name.length < 2)
    errors.name = "Name must be at least 2 characters";

  if (!values.email) errors.email = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(values.email))
    errors.email = "Email is invalid";

  if (!values.password) errors.password = "Password is required";
  else if (values.password.length < 8)
    errors.password = "Password must be at least 8 characters";
  else if (
    !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(values.password)
  ) {
    errors.password =
      "Password must contain uppercase, lowercase, number, and special character";
  }

  if (!values.confirmPassword)
    errors.confirmPassword = "Please confirm your password";
  else if (values.password !== values.confirmPassword)
    errors.confirmPassword = "Passwords do not match";

  if (!values.collegeId) errors.collegeId = "Please select your college";

  return errors;
};

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup, loading } = useAuth();
  const [error, setError] = useState(null);

  const { values, errors, handleChange, handleSubmit, setValues } = useForm(
    { name: "", email: "", password: "", confirmPassword: "", collegeId: "" },
    async (formData) => {
      setError(null);
      try {
        const { confirmPassword, ...signupData } = formData;
        await signup(signupData);
        navigate("/dashboard");
      } catch (err) {
        setError(err.response?.data?.error?.message || "Signup failed");
      }
    },
    validateForm
  );
  const [collegeQuery, setCollegeQuery] = useState("");
  const [collegeOptions, setCollegeOptions] = useState([]);
  const [collegeLoading, setCollegeLoading] = useState(false);
  const debouncedCollegeQuery = useDebounce(collegeQuery, 400);

  useEffect(() => {
    const fetchColleges = async () => {
      if (!debouncedCollegeQuery || debouncedCollegeQuery.length < 2) {
        setCollegeOptions([]);
        return;
      }

      setCollegeLoading(true);
      try {
        const response = await searchAPI.searchAll(
          debouncedCollegeQuery,
          "colleges",
          5
        );
        setCollegeOptions(response.data?.data?.colleges || []);
      } catch (fetchError) {
        toast.error("Failed to search colleges");
      } finally {
        setCollegeLoading(false);
      }
    };

    fetchColleges();
  }, [debouncedCollegeQuery]);

  const handleCollegeSelect = (college) => {
    setValues((prev) => ({ ...prev, collegeId: college._id }));
    setCollegeQuery(college.name);
    setCollegeOptions([]);
  };

  const clearCollege = () => {
    setValues((prev) => ({ ...prev, collegeId: "" }));
    setCollegeQuery("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-900">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Account
            </h1>
            <p className="text-gray-600">Join College Hub today</p>
          </div>

          {error && <Alert type="error" message={error} className="mb-6" />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              name="name"
              value={values.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="John Doe"
              required
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="you@example.com"
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="••••••••"
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={values.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="••••••••"
              required
            />

            <div className="space-y-2">
              <Input
                label="College"
                name="collegeSearch"
                value={collegeQuery}
                onChange={(e) => setCollegeQuery(e.target.value)}
                placeholder="Search your college name"
                error={errors.collegeId}
              />
              {values.collegeId && (
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="success">Selected</Badge>
                  <span className="text-gray-700">{collegeQuery}</span>
                  <button
                    type="button"
                    onClick={clearCollege}
                    className="text-blue-600 text-sm"
                  >
                    Change
                  </button>
                </div>
              )}
              {!values.collegeId && (
                <p className="text-xs text-gray-500">
                  Start typing to search and select your college
                </p>
              )}
              {collegeLoading && (
                <p className="text-sm text-gray-500">Searching colleges…</p>
              )}
              {!collegeLoading && collegeOptions.length > 0 && (
                <div className="border border-gray-200 rounded-lg divide-y max-h-40 overflow-y-auto">
                  {collegeOptions.map((college) => (
                    <button
                      type="button"
                      key={college._id}
                      onClick={() => handleCollegeSelect(college)}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50"
                    >
                      <p className="font-medium text-gray-900">
                        {college.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {college.address || "Address not available"}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <label className="flex items-center">
              <input type="checkbox" required className="rounded" />
              <span className="ml-2 text-sm text-gray-600">
                I agree to the{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Terms of Service
                </a>
              </span>
            </label>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              loading={loading}
            >
              Create Account
            </Button>
          </form>

          <p className="text-center mt-6 text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
