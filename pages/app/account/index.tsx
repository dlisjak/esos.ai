import Link from "next/link";

import ContainerLoader from "@/components/app/ContainerLoader";
import { StatusIndicator } from "@/components/app/PostCard";
import AddNewButton from "@/components/app/AddNewButton";
import PricingTable from "@/components/app/PricingTable";
import Container from "@/components/Layout/Container";
import Header from "@/components/Layout/Header";
import Layout from "@/components/app/Layout";

import { useUser } from "@/lib/queries";
import { useEffect, useState } from "react";
import { HttpMethod } from "@/types";
import { toast } from "react-hot-toast";
import LoadingDots from "@/components/app/loading-dots";

export default function Account() {
  const { user, isLoading, mutateUser } = useUser();
  const [hideKeyType, setHideKeyType] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [data, setData] = useState({
    name: "",
    email: "",
    credits: 0,
    isSubscribed: false,
    subscription: "",
    openAIKey: "",
  });

  useEffect(() => {
    setData({
      name: user?.name || "",
      email: user?.email || "",
      credits: user?.credits || 0,
      isSubscribed: user?.isSubscribed || false,
      subscription: user?.subscription || "",
      openAIKey: user?.openAIKey || "",
    });
  }, [user]);

  const handleAddCredits = () => {};

  const updateUserInformation = async () => {
    setUpdating(true);

    try {
      const response = await fetch(`/api/user`, {
        method: HttpMethod.PUT,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          openAIKey: data.openAIKey,
        }),
      });

      if (response.ok) {
        toast.success("Successfuly Updated user!");
        mutateUser();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Layout>
      <Header>
        <div className="flex items-center justify-between">
          <h1 className="text-4xl">Account</h1>
          <div className="flex space-x-4">
            <AddNewButton onClick={handleAddCredits}>
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
                          published={!!data.name}
                        />
                      </div>
                      <div className="flex h-full w-1/2 flex-col items-end">
                        <input
                          className="w-full rounded border-l p-2 pl-4"
                          value={data?.name || ""}
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
                          published={!!data.email}
                        />
                      </div>
                      <div className="flex h-full w-1/2 flex-col items-end">
                        <input
                          className="w-full rounded border-l p-2 pl-4"
                          placeholder="Email"
                          value={data?.email || ""}
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
                          published={!!data.credits}
                        />
                      </div>
                      <div className="flex h-full w-1/2 flex-col items-end">
                        <input
                          className="w-full rounded border-l p-2 pl-4"
                          value={data?.credits || ""}
                          placeholder="0"
                          readOnly
                        />
                      </div>
                    </li>
                    <li className="relative flex items-center justify-between bg-white pl-4">
                      <div className="w-1/2">
                        <h3 className="ml-4 text-xl font-semibold line-clamp-1">
                          Subscription
                        </h3>
                        <StatusIndicator
                          className="top-3"
                          published={!!data.isSubscribed}
                        />
                      </div>
                      <div className="flex h-full w-1/2 flex-col items-end">
                        <input
                          className="w-full rounded border-l p-2 pl-4 capitalize"
                          value={data?.subscription || "No active Subscription"}
                          placeholder="0"
                          readOnly
                        />
                      </div>
                    </li>
                    <li className="relative flex items-center justify-between bg-white pl-4">
                      <div className="flex w-1/2 items-center justify-between">
                        <h3 className="ml-4 text-xl font-semibold line-clamp-1">
                          OpenAI Key
                        </h3>
                        <StatusIndicator
                          className="top-3"
                          published={!!data.openAIKey}
                        />
                        <div className="flex items-center p-2">
                          <label>Hide:</label>
                          <input
                            className="left-0 rounded"
                            type="checkbox"
                            checked={hideKeyType}
                            onChange={() => setHideKeyType(!hideKeyType)}
                          />
                        </div>
                      </div>
                      <div className="relative flex h-full w-1/2 flex-col items-end">
                        <input
                          type={hideKeyType ? "password" : "text"}
                          className="w-full rounded border-l p-2 pl-4"
                          placeholder="Using System GPT-4 API Key"
                          value={data?.openAIKey}
                          onChange={(e) =>
                            setData({ ...data, openAIKey: e.target.value })
                          }
                        />
                      </div>
                    </li>
                  </ul>
                  <button
                    className="mt-4 ml-auto rounded border p-2"
                    onClick={updateUserInformation}
                    disabled={updating}
                  >
                    {updating ? <LoadingDots /> : "Save"}
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
        <PricingTable />
      </Container>
    </Layout>
  );
}
