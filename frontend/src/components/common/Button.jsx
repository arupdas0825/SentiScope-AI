import React from "react";

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  loading = false,
  icon: Icon,
  ...props
}) {
  const base = "inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer gap-2";

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover shadow-sm",
    secondary: "bg-surface-muted text-text hover:bg-border/70 border border-border",
    outline: "border border-border text-text hover:bg-surface-muted",
    danger: "bg-negative text-white hover:bg-danger shadow-sm",
    ghost: "text-text-muted hover:text-text hover:bg-surface-muted",
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
}

