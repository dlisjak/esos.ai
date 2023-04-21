import Navigation from "@/components/Navigation";
import MarkdownIt from "markdown-it";

const TERMS_OF_SERVICE = `
# Terms of Service

## Introduction
Welcome to ESOS AI - AI Auto Blogs, a blog content management system that uses AI technology (GPT-3.5 & GPT-4) to help creators and bloggers enhance their blogging capabilities. By accessing and using our platform, you agree to abide by these Terms of Service, which govern your use of our website and services.

## Account Registration
To use our platform, you must create an account using either Google OAuth or Github OAuth. By creating an account, you agree to provide accurate and up-to-date information. You are responsible for maintaining the confidentiality of your account and any activities that occur under your account. We reserve the right to terminate accounts that violate our terms.

## Age Restrictions
By using our platform, you represent that you are at least 18 years old or have the legal capacity to enter into a binding agreement in your jurisdiction. If you are under 18, you may use our platform only with the involvement of a parent or legal guardian.

## Subscription Plans and Payments
We offer three subscription plans: Beginner Package, Intermediate Package, and Advanced Package. Each plan includes a 7-day free trial, after which you will be billed according to the selected plan. We also offer in-app purchases for content generation and translation credits. All payments are non-refundable, except as explicitly stated in these terms.

## User-Generated Content
By using our platform, you may create, upload, and share content, including blog posts and images. You retain all rights to the content you create and are solely responsible for its legality, reliability, and appropriateness. By submitting content to our platform, you grant us a non-exclusive, royalty-free, worldwide license to use, store, display, and distribute the content in connection with providing the services.

## Prohibited Actions
You may not engage in any malicious actions, such as abusing bugs, hacking, or other activities that may harm our platform or its users. Any violations of these terms may result in the termination of your account and blacklisting of your IP address.

## Intellectual Property Rights
All content provided by users remains the property of the user. We do not claim any ownership rights over user-generated content.

## Support Services
We provide support services through our support page at Support. While we strive to provide excellent customer service, we cannot guarantee that all issues will be resolved.

## Data Collection and Privacy
We collect basic user information (as stated in point 3 above) and usage analytics to improve our services. This data is anonymized and protected through Google Analytics. For more information, please refer to our Privacy Policy.

## Changes to Terms of Service
We reserve the right to modify or update these terms at any time, and it is your responsibility to review them periodically. Your continued use of our platform after any changes to these terms constitutes your acceptance of the new terms.

## Service Downtime and Interruptions
We are not responsible for any service downtime or interruptions caused by factors beyond our control. However, we will make every effort to resolve issues as quickly as possible. In the event of a major service breakdown lasting more than 2-3 days, we may offer users compensation in the form of content generation and translation credits or discounts on their next billing cycle.

**By using ESOS AI - AI Auto Blogs, you agree to these Terms of Service. If you have any questions or concerns, please contact us at** [Support](/support).
`;

const TermsOfService = () => {
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
            dangerouslySetInnerHTML={{ __html: md.render(TERMS_OF_SERVICE) }}
          />
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
