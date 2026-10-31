import "./globals.css";
export const metadata = {
  icons: { icon: "/favicon.svg" },
  title: "Fomi — Your imagination, made real",
  description:
    "A local creative workspace. Explore, create, and edit with an honest simulated generation demo.",
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
