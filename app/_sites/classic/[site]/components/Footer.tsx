const Footer = ({ site }: any) => {
  return (
    <div className="bg-white py-8">
      <div className="mx-auto grid max-w-screen-xl grid-cols-4 gap-8">
        <div>
          <h3 className="mb-4 text-xl font-semibold md:text-2xl">
            {site?.name}
          </h3>
          <p>{site?.description}</p>
        </div>
        <div>
          <h3 className="mb-4 text-xl font-semibold md:text-2xl">Categories</h3>
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
