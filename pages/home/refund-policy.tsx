import Navigation from "@/components/Navigation";
import MarkdownIt from "markdown-it";

const REFUND_POLICY = `
**Refund and Return Policy of ESOS AI**

**Overview:**
At ESOS AI, we are committed to ensuring satisfaction with our AI Auto Blogs, a digital subscription-based software as a service. We understand the importance of flexibility and transparency in our refund and return policy.

**Refund Policy:**
- **Eligibility for Refund:** Customers are eligible for a full refund within 7 days of their initial purchase, provided they have not violated any terms of service.
- **Free Trial:** We offer a free trial period for new subscribers. If a subscriber chooses to cancel their subscription before the end of the 7-day trial period, they will not be charged.

**Return Policy:**
- As ESOS AI offers digital products, there are no physical returns. However, customers can cancel their subscriptions within the specified trial period.

**Process for Requesting Refund:**
- To initiate a refund, customers must contact us via Facebook message at [our Facebook Group](https://www.facebook.com/groups/aiautoblogs). Our team will guide you through the process and ensure a hassle-free experience.
- Refunds will be processed to the original method of payment used at the time of purchase.

**Limitations:**
- After the 7-day period, subscriptions are non-refundable.
- We reserve the right to refuse a refund if we detect any abuse of our services or violation of our terms.

**Customer Support:**
- For any queries or support regarding refunds or subscriptions, please contact us through our Facebook Group.

**Policy Changes:**
- ESOS AI reserves the right to modify this refund and return policy at any time, so please review it frequently.
`;

const RefundPolicy = () => {
  const md = new MarkdownIt({
    linkify: true,
    typographer: true,
  });

  return (
    <div className="landing">
      <Navigation />
      <div className="flex w-full bg-white py-8">
        <div className="container mx-auto bg-white p-4">
          <div
            className="prose mx-auto pt-4 lg:prose-lg prose-a:text-blue-600 hover:prose-a:text-blue-500"
            dangerouslySetInnerHTML={{ __html: md.render(REFUND_POLICY) }}
          />
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
