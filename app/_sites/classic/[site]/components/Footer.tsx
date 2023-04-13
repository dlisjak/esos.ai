import Link from "next/link";

const Footer = ({ site, categories }: any) => {
  return (
    <div className="border-t bg-white py-8 px-4">
      <div className="mx-auto grid max-w-screen-xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div>
          <h3 className="mb-4 text-xl font-semibold md:text-2xl">
            {site?.name}
          </h3>
          <p>{site?.description}</p>
        </div>
        <div>
          <h3 className="mb-4 text-xl font-semibold md:text-2xl">Categories</h3>
          <ul>
            {categories.map((category: any) => (
              <li key={category.title}>
                <Link href={`/${category.slug}`}>{category.title}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-xl font-semibold md:text-2xl">Links</h3>
        </div>
        <div>
          <h3 className="mb-4 text-xl font-semibold md:text-2xl">Follow us</h3>
        </div>
      </div>
    </div>
  );
};

export default Footer;
