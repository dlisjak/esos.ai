import "../../../../../styles/sites.css";

interface LangObject {
  lang: string;
}

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "de" }, { lang: "nl" }];
}

export default function RootLayout({
  children,
  params: { lang },
}: {
  children: React.ReactNode;
  params: LangObject;
}) {
  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  );
}
