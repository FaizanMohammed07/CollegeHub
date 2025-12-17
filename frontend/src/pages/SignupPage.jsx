import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, Input, Alert } from "../components/UI";
import { useForm } from "../hooks/useCustomHooks";

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

  if (!values.collegeName)
    errors.collegeName = "Please enter your college name";

  return errors;
};

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup, loading } = useAuth();
  const [error, setError] = useState(null);

  const { values, errors, handleChange, handleSubmit } = useForm(
    {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      collegeName: "",
    },
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

            <Input
              label="College"
              name="collegeName"
              value={values.collegeName}
              onChange={handleChange}
              placeholder="Enter your college name"
              error={errors.collegeName}
            />

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
