import { useUser } from "@/lib/queries";

const PricingTable = () => {
  const { user } = useUser();

  return (
    <>
      {user && !user?.isSubscribed && (
        <div className="mt-4 w-full rounded border bg-white pt-4 pb-8">
          {process.env.NODE_ENV === "production" ? (
            <stripe-pricing-table
              pricing-table-id="prctbl_1MwlU9LbJKr1G0zjLYt0XOSQ"
              publishable-key="pk_live_51MtqnZLbJKr1G0zjxY8t2acKvufmLSWBhtmGYiWtAT7zEykibqOFxeIL4g0dkHaBsILUw4GwUalJLbrG7apa1ley00ojB1wxw0"
              client-reference-id={user.id}
            ></stripe-pricing-table>
          ) : (
            <stripe-pricing-table
              pricing-table-id="prctbl_1Mts54LbJKr1G0zjRfQK9HJQ"
              publishable-key="pk_test_51MtqnZLbJKr1G0zjSLt19WwYboC8SBTgB2jm1jao1BzWmzG79K6lPxSHiFzY0AL8UJznfI9eDVEI44XCbSBob3Ry00UKM6HL8L"
              client-reference-id={user.id}
            ></stripe-pricing-table>
          )}
        </div>
      )}
    </>
  );
};

export default PricingTable;
