export default function NavigationIcon({ name, size = 18 }) {
  const paths = {
    Home: "M2 10 12 2l10 8v12h-7v-8H9v8H2V10Z",
    Gallery:
      "M3 2h18v20H3V2Zm3 3v14h12V5H6Zm1 12 4-6 3 3 3-4v7H7Zm2-7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
    Video: "M2 5h13v14H2V5Zm15 4 6-4v14l-6-4V9Z",
    Edit: "m4 3 4 1 12 14-2 3L5 8 4 3Zm13-1 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z",
    Projects: "M2 5h8l3 3h9v14H2V5Z",
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.Gallery} fillRule="evenodd" />
    </svg>
  );
}
