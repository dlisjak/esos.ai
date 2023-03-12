import Layout from "@/components/app/Layout";

import Header from "@/components/Layout/Header";
import Container from "@/components/Layout/Container";
import AddNewButton from "@/components/app/AddNewButton";
import { useUser } from "@/lib/queries";
import ContainerLoader from "@/components/app/ContainerLoader";
import Link from "next/link";
import { StatusIndicator } from "@/components/app/PostCard";

export default function Account() {
  const { user, isLoading } = useUser();

  return (
    <Layout>
      <Header>
        <div className="flex items-center justify-between">
          <h1 className="text-4xl">Account</h1>
          <div className="flex space-x-4">
            <AddNewButton onClick={() => null}>
              Add Credits <span className="ml-2">＋</span>
            </AddNewButton>
          </div>
        </div>
      </Header>
      <Container dark>
        {isLoading ? (
          <ContainerLoader />
        ) : (
          user && (
            <div className="flex flex-col gap-y-4 gap-x-4">
              <div className="flex gap-y-4 gap-x-4">
                <div className="w-full rounded border bg-white p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-2xl">Overview</h2>
                  </div>
                  <ul className="space-y-0 divide-y overflow-hidden rounded border">
                    <li className="relative flex items-center justify-between bg-white pl-4">
                      <div className="w-1/2">
                        <h3 className="ml-4 w-1/2 text-xl font-semibold line-clamp-1">
                          Name
                        </h3>
                        <StatusIndicator
                          className="top-3"
                          published={!!user.name}
                        />
                      </div>
                      <div className="flex h-full w-1/2 flex-col items-end">
                        <input
                          className="w-full rounded border-l p-2 pl-4"
                          value={user?.name || ""}
                          placeholder="Name"
                          readOnly
                        />
                      </div>
                    </li>
                    <li className="relative flex items-center justify-between bg-white pl-4">
                      <div className="w-1/2">
                        <h3 className="ml-4 text-xl font-semibold line-clamp-1">
                          Email
                        </h3>
                        <StatusIndicator
                          className="top-3"
                          published={!!user.emailVerified}
                        />
                      </div>
                      <div className="flex h-full w-1/2 flex-col items-end">
                        <input
                          className="w-full rounded border-l p-2 pl-4"
                          placeholder="Email"
                          value={user?.email || ""}
                          readOnly
                        />
                      </div>
                    </li>
                    <li className="relative flex items-center justify-between bg-white pl-4">
                      <div className="w-1/2">
                        <h3 className="ml-4 text-xl font-semibold line-clamp-1">
                          Credits
                        </h3>
                        <StatusIndicator
                          className="top-3"
                          published={!!user.credits}
                        />
                      </div>
                      <div className="flex h-full w-1/2 flex-col items-end">
                        <input
                          className="w-full rounded border-l p-2 pl-4"
                          value={user?.credits || ""}
                          placeholder="0"
                          readOnly
                        />
                      </div>
                    </li>
                  </ul>
                  <button className="ml-auto mt-2 flex whitespace-nowrap rounded border bg-white px-3 py-1 tracking-wide text-black duration-200 hover:border-black">
                    Save
                  </button>
                </div>
                <div className="w-full rounded border bg-white p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-2xl">Quick Links</h2>
                  </div>
                  <ul className="space-y-0 divide-y overflow-hidden rounded border">
                    <li className="relative flex items-center justify-between bg-white py-2 pr-2 pl-4">
                      <h3 className="text-xl font-semibold line-clamp-1">
                        Sites
                      </h3>
                      <div className="flex h-full flex-col items-end">
                        <div className="ml-2 flex h-full items-end justify-between space-x-2">
                          <Link
                            className="flex whitespace-nowrap rounded border bg-white px-3 py-1 tracking-wide text-black duration-200 hover:border-black"
                            href="/"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </li>
                    <li className="relative flex items-center justify-between bg-white py-2 pr-2 pl-4">
                      <h3 className="text-xl font-semibold line-clamp-1">
                        Prompts
                      </h3>
                      <div className="flex h-full flex-col items-end">
                        <div className="ml-2 flex h-full items-end justify-between space-x-2">
                          <Link
                            className="flex whitespace-nowrap rounded border bg-white px-3 py-1 tracking-wide text-black duration-200 hover:border-black"
                            href="/prompts"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )
        )}
      </Container>
    </Layout>
  );
}
