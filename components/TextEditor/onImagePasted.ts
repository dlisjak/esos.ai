import type { SetStateAction } from "react";
// import { fileUpload } from '../../../../../libs/firebase/storage';
import insertToTextArea from "./insertToTextArea";

const onImagePasted = async (
  dataTransfer: DataTransfer,
  sessionUser: string,
  subdomain: string,
  siteId: string,
  uploadToS3: any,
  setMarkdown: (value: SetStateAction<string | undefined>) => void
) => {
  const files: File[] = [];
  for (let index = 0; index < dataTransfer.items.length; index += 1) {
    const file = dataTransfer.files.item(index);

    if (file) {
      files.push(file);
    }
  }

  await Promise.all(
    files.map(async (file) => {
      const path = `${sessionUser}/${subdomain}/${file.name}`;
      const { url } = await uploadToS3(file, {
        endpoint: {
          request: {
            body: {
              path,
            },
          },
        },
      });

      const res = await fetch(`/api/imageAlt?imageUrl=${url}`);
      const alt = await res.json();

      const insertedMarkdown = insertToTextArea(`![${alt}](${url})`);
      if (!insertedMarkdown) {
        return;
      }
      setMarkdown(insertedMarkdown);
    })
  );
};

export default onImagePasted;
