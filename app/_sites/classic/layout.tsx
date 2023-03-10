import "../../../styles/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("classic");
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
