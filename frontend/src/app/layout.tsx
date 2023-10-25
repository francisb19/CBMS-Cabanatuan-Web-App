import { ReduxProvider } from "@/components/redux/provider";
import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CBMS Login",
  description: "CBMS Login",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
