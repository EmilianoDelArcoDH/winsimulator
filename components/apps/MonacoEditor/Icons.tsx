import { memo } from "react";

export const SaveIcon = memo(() => (
  <svg
    aria-hidden="true"
    fill="currentColor"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      clipRule="evenodd"
      d="M12.9 1 15 3.1V14l-1 1H2l-1-1V2l1-1h10.9ZM2.5 2.5v11h11V3.72L12.28 2.5H11V6H4V2.5H2.5Zm3 0v2h4v-2h-4ZM4 9h8v3.5H4V9Z"
      fillRule="evenodd"
    />
  </svg>
));

export const ErrorIcon = memo(() => (
  <svg
    className="error"
    fill="currentColor"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      clipRule="evenodd"
      d="M8 1.25A6.75 6.75 0 1 1 8 14.75 6.75 6.75 0 0 1 8 1.25Zm0 1.5a5.25 5.25 0 1 0 0 10.5 5.25 5.25 0 0 0 0-10.5Zm2.78 3.03L8.56 8l2.22 2.22-1.06 1.06L7.5 9.06l-2.22 2.22-1.06-1.06L6.44 8 4.22 5.78l1.06-1.06L7.5 6.94l2.22-2.22 1.06 1.06Z"
      fillRule="evenodd"
    />
  </svg>
));

export const InfoIcon = memo(() => (
  <svg
    className="info"
    fill="currentColor"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      clipRule="evenodd"
      d="M8 1.25A6.75 6.75 0 1 1 8 14.75 6.75 6.75 0 0 1 8 1.25Zm0 1.5a5.25 5.25 0 1 0 0 10.5 5.25 5.25 0 0 0 0-10.5ZM7.25 7h1.5v4h-1.5V7Zm0-2.5h1.5V6h-1.5V4.5Z"
      fillRule="evenodd"
    />
  </svg>
));

export const WarningIcon = memo(() => (
  <svg
    className="warning"
    fill="currentColor"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      clipRule="evenodd"
      d="M8 1.25 15 14H1L8 1.25ZM3.53 12.5h8.94L8 4.36 3.53 12.5ZM7.25 6h1.5v3.75h-1.5V6Zm0 4.75h1.5v1.5h-1.5v-1.5Z"
      fillRule="evenodd"
    />
  </svg>
));
