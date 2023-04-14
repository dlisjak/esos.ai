import { useUser } from "@/lib/queries";

const PricingTable = () => {
  const { user } = useUser();

  return (
    <>
      {user && !user?.isSubscribed && (
        <div className="mt-4 w-full rounded border bg-white pt-4 pb-8">
          <stripe-pricing-table
            pricing-table-id="prctbl_1MwlU9LbJKr1G0zjLYt0XOSQ"
            publishable-key="pk_live_51MtqnZLbJKr1G0zjxY8t2acKvufmLSWBhtmGYiWtAT7zEykibqOFxeIL4g0dkHaBsILUw4GwUalJLbrG7apa1ley00ojB1wxw0"
            client-reference-id={user.id}
          ></stripe-pricing-table>
        </div>
      )}
    </>
  );
};

export default PricingTable;
