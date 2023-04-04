import Layout from "@/components/app/Layout";
import Container from "@/components/Layout/Container";
import Header from "@/components/Layout/Header";

import { useImages } from "@/lib/queries";
import Image from "next/image";
import ContainerLoader from "@/components/app/ContainerLoader";

export default function Images() {
  const { images, isLoading } = useImages();

  return (
    <Layout>
      <Header>
        <div className="flex items-center justify-between">
          <h1 className="text-4xl">Images</h1>
        </div>
      </Header>
      <Container dark>
        {isLoading ? (
          <ContainerLoader />
        ) : (
          <div className="grid gap-y-4">
            {images && images?.length > 0 ? (
              images?.map((image) => (
                <li className="flex flex-col space-y-2" key={image.id}>
                  <div className="relative flex items-end rounded bg-white p-4 drop-shadow-sm">
                    <div className="flex w-full overflow-hidden rounded">
                      <div className="relative h-[240px]">
                        <Image
                          alt={image?.alt || "Placeholder image"}
                          width={240}
                          height={120}
                          className="h-full object-cover"
                          src={image?.src || "/placeholder.png"}
                        />
                      </div>
                      <div className="relative flex flex-col items-start px-4">
                        <div className="flex items-center">
                          <h2 className="mb-1 text-xl font-semibold">
                            {image.alt}
                          </h2>
                        </div>
                        <p className="right-1 flex w-auto rounded bg-gray-100 px-1 text-sm line-clamp-1">
                          {image.src}
                        </p>
                        <h3 className="mb-1 text-lg font-semibold">
                          {image.id}
                        </h3>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <div className="text-center">
                <p className="my-4 text-2xl text-gray-600">No Images yet.</p>
              </div>
            )}
          </div>
        )}
      </Container>
    </Layout>
  );
}
