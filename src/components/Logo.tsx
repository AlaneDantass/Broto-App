import React from "react";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  mono?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ mono = false, className, ...props }) => {
  if (mono) {
    return (
      <svg
        viewBox="0 0 64 64"
        width="64"
        height="64"
        fill="currentColor"
        className={className}
        {...props}
      >
        <circle cx="32" cy="32" r="32" fill="currentColor" opacity=".1" />
        <path
          d="M20.5 55.5 C 26 53.5, 38 53.5, 43.5 55.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.6"
          strokeLinecap="round"
          opacity=".55"
        />
        <path
          d="M32.5 55 C 31.4 45, 29.6 37.5, 33 26.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="4.2"
          strokeLinecap="round"
        />
        <path d="M31.6 45 C 24.5 45.4, 19.8 41.4, 19 34.6 C 25.8 33.8, 30.8 38, 31.6 45 Z" />
        <path d="M32.6 37.4 C 41.6 37.2, 47.2 32, 47.6 24 C 39.4 24.6, 33 29.6, 32.6 37.4 Z" />
        <circle cx="33.4" cy="24.2" r="3.9" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 64 64"
      width="64"
      height="64"
      className={className}
      {...props}
    >
      <circle cx="32" cy="32" r="32" fill="var(--color-surface-container-low)" />
      <path
        d="M20.5 55.5 C 26 53.5, 38 53.5, 43.5 55.5"
        fill="none"
        stroke="#C6B3AF"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      <path
        d="M32.5 55 C 31.4 45, 29.6 37.5, 33 26.5"
        fill="none"
        stroke="#375B32"
        strokeWidth="4.2"
        strokeLinecap="round"
      />
      <path
        d="M31.6 45 C 24.5 45.4, 19.8 41.4, 19 34.6 C 25.8 33.8, 30.8 38, 31.6 45 Z"
        fill="#375B32"
      />
      <path
        d="M32.6 37.4 C 41.6 37.2, 47.2 32, 47.6 24 C 39.4 24.6, 33 29.6, 32.6 37.4 Z"
        fill="#669646"
      />
      <circle cx="33.4" cy="24.2" r="3.9" fill="#88365C" />
    </svg>
  );
};
