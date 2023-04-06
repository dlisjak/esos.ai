import { useUser } from "@/lib/queries";

const PricingTable = () => {
  const { user } = useUser();

  return (
    <>
      {user && !user?.isSubscribed && (
        <div className="mt-4 w-full rounded border bg-white pt-4 pb-8">
          <stripe-pricing-table
            pricing-table-id="prctbl_1Mts54LbJKr1G0zjRfQK9HJQ"
            publishable-key="pk_test_51MtqnZLbJKr1G0zjSLt19WwYboC8SBTgB2jm1jao1BzWmzG79K6lPxSHiFzY0AL8UJznfI9eDVEI44XCbSBob3Ry00UKM6HL8L"
            client-reference-id={user.id}
          ></stripe-pricing-table>
        </div>
      )}
    </>
  );
};

export default PricingTable;
