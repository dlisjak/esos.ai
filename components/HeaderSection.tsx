import HeaderSectionImage from "./Image";

const HeaderSection = ({
  id,
  image,
  alt,
  title,
  subtitle,
  buttons,
  priority = false,
  left = false,
}: any) => (
  <div
    id={id}
    className={`container relative mx-auto flex h-screen w-full bg-black ${
      left ? "-left" : ""
    }`}
  >
    {left && (
      <div className="headerImageContainer pointer-events-none relative flex items-center">
        <HeaderSectionImage
          src={image}
          alt={alt}
          placeholder="blur"
          priority={priority}
        />
      </div>
    )}
    <div className="container top-0 right-0 left-0 mx-auto mt-4 flex h-auto items-center sm:px-4">
      <div
        className={`headerText ${
          left ? "ml-auto text-right" : "mr-auto text-left"
        }`}
      >
        {subtitle}
        {title}
        <div className="buttons flex flex-wrap">{buttons}</div>
      </div>
    </div>
    {!left && (
      <div className="headerImageContainer pointer-events-none relative flex items-center">
        <HeaderSectionImage
          src={image}
          alt={alt}
          placeholder="blur"
          priority={priority}
        />
      </div>
    )}
  </div>
);

export default HeaderSection;
