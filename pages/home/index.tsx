import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

import LION from "../../public/LION.jpeg";
import CITY from "../../public/CITY_AERIAL_OFFICE.jpeg";

import HOSTING_ICON from "../../public/icons/icons8-hosting-64.png";
import COPYWRITING_ICON from "../../public/icons/icons8-copywriting-64.png";
import TRANSLATE_ICON from "../../public/icons/icons8-translate-64.png";
import ARCHIVE_ICON from "../../public/icons/icons8-archive-64.png";
import LOCK_ICON from "../../public/icons/icons8-lock-64.png";
import SUPPORT_ICON from "../../public/icons/icons8-technical-64.png";
import UPDATES_ICON from "../../public/icons/icons8-business-64.png";
import CUSTOMISATION_ICON from "../../public/icons/icons8-design-64.png";
import SPEED_ICON from "../../public/icons/icons8-performance-64.png";
import KEY_ICON from "../../public/icons/icons8-key-64.png";
import AD_ICON from "../../public/icons/icons8-ads-64.png";
import SITEMAP_ICON from "../../public/icons/icons8-map-64.png";

import "../../styles/home.css";
import HeaderSection from "@/components/HeaderSection";
import Navigation from "@/components/Navigation";

const Home = () => {
  return (
    <div className="landing mt-12">
      <Head>
        <title>AI Auto Blogs</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navigation />
      <div className="section bg-black pb-8">
        <HeaderSection
          id="Header"
          image={LION}
          alt="Majest calm lion looking towards you"
          title={
            <h2 className="text-gradient -lion mb-4 mt-2 px-2 text-3xl sm:text-3xl md:text-5xl lg:px-0">
              Become the King
              <br />
              Of The Web
            </h2>
          }
          subtitle={
            <h1 className="text-gradient -lion relative left-0.5 text-base underline underline-offset-1 sm:text-xl 2xl:mb-2">
              AI Powered Blogs
            </h1>
          }
          buttons={
            <>
              <Link
                className="button mr-4"
                href={
                  process.env.NEXT_PUBLIC_APP_URL ||
                  "https://app.aiautoblogs.com"
                }
                target="_blank"
              >
                Try For Free
              </Link>
              <Link className="button" href="/#Features">
                Features
              </Link>
            </>
          }
          priority
        />
      </div>
      <div className="flex flex-col bg-white py-8 px-4">
        <div id="Why-Us" className="container mx-auto">
          <div className="mx-auto flex items-center">
            <div className="hidden min-w-[450px] md:block">
              <Image
                src={CITY}
                alt="Aerial image of a city"
                width={450}
                height={675}
              />
            </div>
            <div className="md:ml-8">
              <h2 className="text-center text-4xl underline md:text-start">
                Why Us?
              </h2>
              <div className="py-4 font-light">
                <p className="mb-4 md:text-xl">
                  At <b>AI Auto Blogs</b>, we understand that creating{" "}
                  <b>high-quality blog content</b> can be{" "}
                  <b>time-consuming and challenging</b>. That’s why we’ve
                  developed an innovative platform that uses{" "}
                  <b>AI technology</b> to generate <b>unique and engaging</b>{" "}
                  blog content in a <b>matter of seconds</b>.
                </p>
                <p className="mb-4 md:text-xl">
                  With <b>AI Auto Blogs</b>, you can streamline your content
                  creation process, <b>save time</b>, and increase your online
                  presence.
                </p>
                <p className="mb-4 md:text-xl">
                  Plus, our <b>dedicated customer support</b> team is always
                  available to answer any questions and provide assistance.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div id="Features" className="container mx-auto mt-8 w-full">
          <div className="mx-auto flex items-center">
            <div className="flex flex-col items-center md:ml-8">
              <h2 className="text-4xl underline">Features</h2>
              <p className="mt-4 text-center">
                <b>AI Auto Blogs</b> offers a <b>variety of features</b> to help
                you <b>create high-quality blog content quickly and easily</b>:
              </p>
              <div className="mt-4 grid w-full grid-cols-1 gap-y-8 gap-x-5 py-4 font-light sm:grid-cols-2 lg:grid-cols-4">
                <div className="col-span-1 flex flex-col items-center">
                  <Image
                    src={HOSTING_ICON}
                    alt="Hosting icon"
                    width={64}
                    height={64}
                  />
                  <h3 className="mt-2 text-center text-2xl font-bold">
                    Hassle-Free Hosting
                  </h3>
                  <p className="mt-2 text-center">
                    With AI Auto Blogs, you don’t have to worry about hosting or
                    server maintenance. We take care of everything, so you can
                    focus on creating great content
                  </p>
                </div>
                <div className="col-span-1 flex flex-col items-center">
                  <Image
                    src={COPYWRITING_ICON}
                    alt="Hosting icon"
                    width={64}
                    height={64}
                  />
                  <h3 className="mt-2 text-center text-2xl font-bold">
                    Content Generation with GPT-4
                  </h3>
                  <p className="mt-2 text-center">
                    Our platform uses advanced AI technology, including GPT-4,
                    to generate unique and engaging blog content in a matter of
                    seconds
                  </p>
                </div>
                <div className="col-span-1 flex flex-col items-center">
                  <Image
                    src={TRANSLATE_ICON}
                    alt="Hosting icon"
                    width={64}
                    height={64}
                  />
                  <h3 className="mt-2 text-center text-2xl font-bold">
                    1-Click Translation
                  </h3>
                  <p className="mt-2 text-center">
                    With our built-in translation feature, you can easily
                    translate your content into multiple languages with just one
                    click
                  </p>
                </div>
                <div className="col-span-1 flex flex-col items-center">
                  <Image
                    src={ARCHIVE_ICON}
                    alt="Hosting icon"
                    width={64}
                    height={64}
                  />
                  <h3 className="mt-2 text-center text-2xl font-bold">
                    Starter Prompts
                  </h3>
                  <p className="mt-2 text-center">
                    Our platform provides a variety of starter prompts to help
                    you generate ideas and get started with your blog content
                  </p>
                </div>
                <div className="col-span-1 flex flex-col items-center">
                  <Image
                    src={LOCK_ICON}
                    alt="Hosting icon"
                    width={64}
                    height={64}
                  />
                  <h3 className="mt-2 text-center text-2xl font-bold">
                    Automatic SSL
                  </h3>
                  <p className="mt-2 text-center">
                    We automatically provide SSL encryption for your website,
                    ensuring that your visitors’ data is always secure
                  </p>
                </div>
                <div className="col-span-1 flex flex-col items-center">
                  <Image
                    src={SUPPORT_ICON}
                    alt="Hosting icon"
                    width={64}
                    height={64}
                  />
                  <h3 className="mt-2 text-center text-2xl font-bold">
                    24/7 Support
                  </h3>
                  <p className="mt-2 text-center">
                    Our dedicated support team is available 24/7 to answer any
                    questions and provide assistance,
                  </p>
                </div>
                <div className="col-span-1 flex flex-col items-center">
                  <Image
                    src={UPDATES_ICON}
                    alt="Hosting icon"
                    width={64}
                    height={64}
                  />
                  <h3 className="mt-2 text-center text-2xl font-bold">
                    Weekly Updates
                  </h3>
                  <p className="mt-2 text-center">
                    We regularly update our platform to ensure that you have
                    access to the latest features and technology
                  </p>
                </div>
                <div className="col-span-1 flex flex-col items-center">
                  <Image
                    src={CUSTOMISATION_ICON}
                    alt="Hosting icon"
                    width={64}
                    height={64}
                  />
                  <h3 className="mt-2 text-center text-2xl font-bold">
                    Customization
                  </h3>
                  <p className="mt-2 text-center">
                    Our platform offers a variety of customization options,
                    including fonts, colors, and themes, so you can style your
                    blog to align with your brand
                  </p>
                </div>
                <div className="col-span-1 flex flex-col items-center">
                  <Image
                    src={SPEED_ICON}
                    alt="Hosting icon"
                    width={64}
                    height={64}
                  />
                  <h3 className="mt-2 text-center text-2xl font-bold">
                    Fully Optimised
                  </h3>
                  <p className="mt-2 text-center">
                    Automatically optimised codebase with page speed insights
                    reaching 100/100 in Lighthouse and GTMetrix tests
                  </p>
                </div>
                <div className="col-span-1 flex flex-col items-center">
                  <Image
                    src={KEY_ICON}
                    alt="Hosting icon"
                    width={64}
                    height={64}
                  />
                  <h3 className="mt-2 text-center text-2xl font-bold">
                    Bring your own OpenAI Key
                  </h3>
                  <p className="mt-2 text-center">
                    If you have your own API Key from OpenAI, you can use it and
                    have full control over the requests you make to generate
                    content
                  </p>
                </div>
                <div className="col-span-1 flex flex-col items-center">
                  <Image
                    src={AD_ICON}
                    alt="Hosting icon"
                    width={64}
                    height={64}
                  />
                  <h3 className="mt-2 text-center text-2xl font-bold">
                    Customizable Ad Placements
                  </h3>
                  <p className="mt-2 text-center">
                    Choose where to select your ads. We support a number of ad
                    networks
                  </p>
                </div>
                <div className="col-span-1 flex flex-col items-center">
                  <Image
                    src={SITEMAP_ICON}
                    alt="Hosting icon"
                    width={64}
                    height={64}
                  />
                  <h3 className="mt-2 text-center text-2xl font-bold">
                    Sitemap Generation
                  </h3>
                  <p className="mt-2 text-center">
                    When creating a new post or category, our engine will
                    automatically update your sitemap, so the content Google
                    sees will always be up to date
                  </p>
                </div>
              </div>
              <p className="mt-4 text-center">
                With these features, <b>AI Auto Blogs</b> offers a{" "}
                <b>complete solution</b> for creating <b>high-quality</b> blog
                content <b>quickly and easily</b>. <br />
                <b>Try it out today</b> and see the difference for yourself.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
