import "../../../styles/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("modern");
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
