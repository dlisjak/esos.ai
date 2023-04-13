import React from "react";
import Image from "next/image";

const HeaderSectionImage = (props: any) => {
  const { src, alt, priority } = props;

  return (
    <Image
      src={src}
      alt={alt}
      layout="responsive"
      quality={80}
      priority={priority}
      {...props}
    />
  );
};

export default HeaderSectionImage;
