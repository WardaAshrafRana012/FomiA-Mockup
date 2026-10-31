export default function FomiMark({ size = 30, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 32"
      fill="currentColor"
      aria-label="Fomi"
      {...props}
    >
      <path d="M4 3h17l-4 6H9v4h9l-4 6H9v10l-5-4V3Z" />
    </svg>
  );
}
