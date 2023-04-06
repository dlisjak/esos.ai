import { useRouter } from "next/router";
import { toast } from "react-hot-toast";

import ContainerLoader from "@/components/app/ContainerLoader";
import Container from "@/components/Layout/Container";
import Header from "@/components/Layout/Header";
import Layout from "@/components/app/Layout";

import { useStripeSession } from "@/lib/queries";

export default function Subscribed({ userId }: any) {
  const router = useRouter();
  const { user } = useStripeSession(userId);

  if (user?.subscription) {
    toast.success("Subcription Active!");
    router.push("/");
  }

  return (
    <Layout>
      <Header>
        <div className="flex w-full items-center justify-center text-center">
          <h1 className="text-4xl">Succesfully Subscribed!</h1>
        </div>
      </Header>
      <Container dark>
        <div>
          <h2 className="py-4 text-center text-xl">
            We are getting you set up. You will be redirected shortly.
          </h2>
        </div>
        <ContainerLoader />
      </Container>
    </Layout>
  );
}

export async function getServerSideProps({ query }: any) {
  const { userId } = query;

  if (!userId) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      userId,
    },
  };
}
