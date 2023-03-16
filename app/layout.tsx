import "../styles/sites.css";

interface LangObject {
  lang: string;
}

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "de" }, { lang: "nl" }];
}

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: LangObject;
}) {
  return (
    <html lang={params.lang}>
      <body>{children}</body>
    </html>
  );
}
