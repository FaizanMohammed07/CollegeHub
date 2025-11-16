import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Input, Button, Alert } from '../components/UI';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new one.');
    }
  }, [token]);

  const validatePassword = (pwd) => {
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);
    const isLongEnough = pwd.length >= 8;

    return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isLongEnough;
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { level: 0, label: 'None', color: 'bg-gray-200' };
    
    const checks = [
      /[A-Z]/.test(pwd),
      /[a-z]/.test(pwd),
      /[0-9]/.test(pwd),
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
      pwd.length >= 8,
      pwd.length >= 12,
    ];

    const strength = checks.filter(Boolean).length;

    if (strength <= 2) return { level: 1, label: 'Weak', color: 'bg-red-500' };
    if (strength <= 4) return { level: 2, label: 'Fair', color: 'bg-yellow-500' };
    return { level: 3, label: 'Strong', color: 'bg-green-500' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters and include uppercase, lowercase, number, and special character');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!token) {
      setError('Invalid reset link. Please request a new one.');
      return;
    }

    setLoading(true);
    try {
      const response = await resetPassword(token, password);

      if (response.success) {
        setSuccess(true);
        toast.success('Password reset successfully');
        
        // Auto-redirect after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.message || 'Failed to reset password. The link may have expired.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
      toast.error('Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(password);

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset</h2>
          <p className="text-gray-600 mb-6">
            Your password has been reset successfully!
          </p>

          <Link
            to="/login"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/login" className="inline-block mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">CH</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-600">
            Create a new strong password for your account.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            type="error"
            title="Error"
            message={error}
          />
        )}

        {!token && (
          <Alert
            type="error"
            title="Invalid Link"
            message="The reset link is invalid or has expired. Please request a new one."
          />
        )}

        {/* Form */}
        {token && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password Field */}
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                label="New Password"
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10 text-gray-600 hover:text-gray-900"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">Password Strength</label>
                  <span className={`text-sm font-medium ${strength.color.replace('bg-', 'text-')}`}>
                    {strength.label}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${strength.color} h-2 rounded-full transition-all duration-300`}
                    style={{
                      width: `${(strength.level / 3) * 100}%`,
                    }}
                  />
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Password must include:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-600'}>
                      ✓ Uppercase letter
                    </li>
                    <li className={/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-600'}>
                      ✓ Lowercase letter
                    </li>
                    <li className={/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-600'}>
                      ✓ Number
                    </li>
                    <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'text-green-600' : 'text-gray-600'}>
                      ✓ Special character
                    </li>
                    <li className={password.length >= 8 ? 'text-green-600' : 'text-gray-600'}>
                      ✓ At least 8 characters
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Confirm Password Field */}
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirm Password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-10 text-gray-600 hover:text-gray-900"
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            {/* Match Indicator */}
            {confirmPassword && (
              <div className="text-sm">
                {password === confirmPassword ? (
                  <span className="text-green-600 font-medium">✓ Passwords match</span>
                ) : (
                  <span className="text-red-600 font-medium">✗ Passwords don't match</span>
                )}
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              loading={loading}
              disabled={loading || !password || !confirmPassword || !validatePassword(password)}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-6 text-center space-y-3">
          <p className="text-gray-600">
            Remember your password?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
          <p className="text-gray-600">
            Need another reset link?{' '}
            <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium">
              Request one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
