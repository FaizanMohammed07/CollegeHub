import React from "react";
import clsx from "clsx";

const DEFAULT_AVATAR =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'><rect width='150' height='150' rx='75' fill='%23E0E7FF'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-size='56' font-family='Arial, sans-serif' fill='%234256B6'>?</text></svg>";

/**
 * Button Component
 */
export const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  className = "",
  ...props
}) => {
  const baseStyles =
    "font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400",
    secondary:
      "bg-gray-200 text-gray-900 hover:bg-gray-300 disabled:bg-gray-100",
    danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400",
    success: "bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
    ghost: "text-blue-600 hover:bg-blue-50",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="animate-spin">⏳</span>}
      {children}
    </button>
  );
};

/**
 * Card Component
 */
export const Card = ({ children, className = "", ...props }) => {
  return (
    <div
      className={clsx(
        "bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Input Component
 */
export const Input = ({
  label,
  error,
  type = "text",
  required = false,
  disabled = false,
  className = "",
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        disabled={disabled}
        className={clsx(
          "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
          error ? "border-red-500" : "border-gray-300",
          disabled && "bg-gray-100 cursor-not-allowed",
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

/**
 * Modal Component
 */
export const Modal = ({ isOpen, onClose, title, children, className = "" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={clsx(
          "bg-white rounded-lg shadow-xl max-w-md w-full mx-4",
          className
        )}
      >
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

/**
 * Alert Component
 */
export const Alert = ({ type = "info", title, message, className = "" }) => {
  const types = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  };

  return (
    <div className={clsx("border rounded-lg p-4", types[type], className)}>
      {title && <h3 className="font-semibold mb-1">{title}</h3>}
      {message && <p className="text-sm">{message}</p>}
    </div>
  );
};

/**
 * Loading Skeleton Component
 */
export const Skeleton = ({ className = "", count = 1 }) => {
  return (
    <>
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={clsx("bg-gray-200 animate-pulse rounded", className)}
          />
        ))}
    </>
  );
};

/**
 * Badge Component
 */
export const Badge = ({ children, variant = "primary", className = "" }) => {
  const variants = {
    primary: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    danger: "bg-red-100 text-red-800",
    warning: "bg-yellow-100 text-yellow-800",
    gray: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={clsx(
        "px-3 py-1 rounded-full text-xs font-semibold",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

/**
 * Spinner Component
 */
export const Spinner = ({ size = "md", className = "" }) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={clsx("flex items-center justify-center", className)}>
      <div
        className={clsx(
          "border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin",
          sizes[size]
        )}
      />
    </div>
  );
};

/**
 * Avatar Component
 */
export const Avatar = ({ src, alt, size = "md", className = "" }) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  return (
    <img
      src={src || DEFAULT_AVATAR}
      alt={alt}
      className={clsx("rounded-full object-cover", sizes[size], className)}
    />
  );
};
