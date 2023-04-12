import Head from "next/head";
import Image from "next/image";

import LOGO from "../../public/logo_icon.svg";
import HEADER from "../../public/ABSTRACT_22.jpeg";
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
import PricingTable from "@/components/app/PricingTable";
import Link from "next/link";

const Home = () => {
  return (
    <>
      <Head>
        <title>Platforms on Vercel</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="relative top-0 left-0 right-0 z-50 flex bg-black py-2 text-white">
        <div className="container mx-auto flex justify-between px-4 font-bold">
          <Image src={LOGO} alt="Logo" width={60} height={60} />
          <ul className="ml-auto hidden items-center space-x-4 md:flex">
            <li className="hover:underline">
              <Link href="https://app.aiautoblogs.com" target="_blank">
                Free 7 Day Trial
              </Link>
            </li>
            <li className="hover:underline">
              <Link href="#Why-Us">Why us</Link>
            </li>
            <li className="hover:underline">
              <Link href="#Features">Features</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="relative flex h-auto max-h-screen flex-col bg-white">
        <div className="relative h-full overflow-hidden">
          <Image
            src={HEADER}
            alt="Atlas holding up the world"
            width={3840}
            height={2160}
          />
          <div className="container absolute top-0 bottom-0 left-0 right-0 m-auto flex flex-col justify-center px-4 text-white">
            <p className="Copperplate underline md:text-2xl">
              Create highest-quality blogs in minutes
            </p>
            <h1 className="text-xl md:text-5xl">
              BLOG SMARTER, NOT HARDER,
              <br />
              with <span className="underline">AI AUTO BLOGS</span>
            </h1>
          </div>
        </div>
      </div>
      <div className="flex flex-col bg-white py-8 px-4">
        <Link
          className="mx-auto my-4 text-center underline md:text-2xl"
          href="https://app.aiautoblogs.com"
          target="_blank"
        >
          Click here & Claim a free 7 day trial for the Beginner Package. No
          risk!
        </Link>
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
              <h2 className="text-4xl underline">Why Us?</h2>
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
              <p className="mt-4 text-center md:text-2xl">
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
              <p className="mt-4 text-center md:text-2xl">
                With these features, <b>AI Auto Blogs</b> offers a{" "}
                <b>complete solution</b> for creating <b>high-quality</b> blog
                content <b>quickly and easily</b>. <br />
                <b>Try it out today</b> and see the difference for yourself.
              </p>
            </div>
          </div>
        </div>
        <div className="container mx-auto mt-8 flex w-full">
          <Link
            className="mx-auto mt-4 text-center underline md:text-2xl"
            href="https://app.aiautoblogs.com"
            target="_blank"
          >
            Click here & Claim a free 7 day trial for the Beginner Package. No
            risk!
          </Link>
        </div>
      </div>
    </>
  );
};

export default Home;
