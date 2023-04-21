import Navigation from "@/components/Navigation";
import MarkdownIt from "markdown-it";

const PRIVACY_POLICYT = `
# Privacy Policy

## Introduction
At ESOS AI - AI Auto Blogs, we are committed to protecting the privacy of our users. This Privacy Policy outlines the types of information we collect, how we use it, and the steps we take to protect your privacy when using our platform.

## Information We Collect
When you create an account on our platform, we collect the following information:
- Google OAuth users: Email address, first name, and last name.
- Github OAuth users: Github username.

We also use Google Analytics to collect anonymized usage data, which helps us understand how users interact with our platform and make improvements to our services.

## How We Use Your Information
We use the information collected from you for the following purposes:
- To provide and maintain our platform and services.
- To communicate with you about your account, support inquiries, and platform updates.
- To monitor and analyze usage and trends to improve our platform and services.
- To detect, prevent, and address technical issues and security threats.

## Data Storage and Security
We are committed to protecting your personal information. We implement reasonable and appropriate security measures to protect your data from unauthorized access, disclosure, alteration, or destruction. However, no method of data transmission or storage is 100% secure, and we cannot guarantee the absolute security of your information.

## Sharing Your Information
We do not sell, rent, or share your personal information with third parties, except as required by law or with your consent. We may share anonymized usage data with third parties for analytics purposes.

## Your Rights and Choices
You have the right to access, update, or delete your personal information at any time. To exercise these rights, please contact us at Support. Please note that we may require you to verify your identity before responding to your request.

## Changes to This Privacy Policy
We reserve the right to update or modify this Privacy Policy at any time. We will notify you of any significant changes by posting a notice on our platform. Your continued use of our platform after any changes to this Privacy Policy constitutes your acceptance of the new terms.

## Contact Us
**If you have any questions, concerns, or requests regarding your personal information or this [Privacy Policy](/privacy-policy), please contact us at** [Support](/support).
`;

const PrivacyPolicy = () => {
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
            dangerouslySetInnerHTML={{ __html: md.render(PRIVACY_POLICYT) }}
          />
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
