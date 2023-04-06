import Head from "next/head";
import Image from "next/image";

const Home = () => {
  return (
    <>
      <Head>
        <title>Platforms on Vercel</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex h-screen flex-col bg-black">
        <div className="m-auto w-48">
          <Image
            width={512}
            height={512}
            src="/logo.png"
            alt="Platforms on Vercel"
          />
        </div>
      </div>
    </>
  );
};

export default Home;
