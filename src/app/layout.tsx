import "@/styles/globals.css";
import type { Metadata } from "next";

console.log("[APP] CloudBeats layout loaded");

export const metadata: Metadata = {
  title: "CloudBeats — Cloud Music Manager",
  description: "Stream and manage your music from Google Drive, Dropbox, and OneDrive",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-surface text-on-surface antialiased">
        {children}
      </body>
    </html>
  );
}
