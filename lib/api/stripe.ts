import { NextApiRequest, NextApiResponse } from "next";
import type { Session } from "next-auth";
import stripeApi from "../stripe";

/**
 * Get Session
 *
 * Fetches & returns a session available depending on
 * whether a `userId` query parameter is provided.
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 */
export async function processSuccess(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse<any>> {
  const { userId } = req.query;

  if (!session.user.id || !userId)
    return res.status(500).end("Server failed to get session user ID");

  try {
    const session = await stripeApi.checkout.sessions.retrieve(userId);

    if (session.mode !== "subscription")
      return res.status(200).end("Not a subscription");
    if (session.payment_status !== "paid")
      return res.status(200).end("Subscription not paid");
    if (session.status !== "complete")
      return res.status(200).end("Payment not complete");
    if (!session.client_reference_id)
      return res.status(200).end("Cannot find Client Reference Id");

    const subscription = getSubscriptionFromPrice(session.amount_total);

    const user = await prisma?.user.update({
      where: {
        id: session.client_reference_id,
      },
      data: {
        subscription,
        isSubscribed: true,
      },
    });

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

const getSubscriptionFromPrice = (amountTotal: number) => {
  if (amountTotal === 1295) {
    return "beginner";
  }
  if (amountTotal === 9995) {
    return "beginner";
  }
  if (amountTotal === 2495) {
    return "intermediate";
  }
  if (amountTotal === 24995) {
    return "intermediate";
  }
  if (amountTotal === 4995) {
    return "advanced";
  }
  if (amountTotal === 49995) {
    return "advanced";
  }
};
