import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#F8F9FB] min-h-screen py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-6 text-xs sm:text-sm text-gray-600 leading-relaxed">
          <div className="border-b pb-4 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-dkart-blue">Legal Policy</span>
            <h1 className="text-2xl sm:text-3xl font-black text-dkart-charcoal">Privacy Policy - Dkart Store</h1>
            <p className="text-xs text-gray-400">Effective Date: January 1, 2026 • dkart.pk</p>
          </div>

          <p>
            At Dkart Store (operating at <strong>dkart.pk</strong>), we are committed to protecting the privacy and personal data of our customers in Pakistan. This Privacy Policy details how we collect, use, and safeguard your details during your shopping experience.
          </p>

          <h3 className="text-base font-bold text-dkart-charcoal pt-2">1. Information We Collect</h3>
          <p>
            When you place an order with Cash on Delivery or create an account, we collect necessary transactional information including your Full Name, Phone Number, WhatsApp Contact, Delivery Street Address, City, Province, and Email address.
          </p>

          <h3 className="text-base font-bold text-dkart-charcoal pt-2">2. How We Use Your Information</h3>
          <p>
            We use your data solely for logistics fulfillment: booking shipments with our courier partners (TCS, Leopard Express, PostEx), sending delivery status SMS updates, verifying Cash on Delivery orders, and providing after-sales support.
          </p>

          <h3 className="text-base font-bold text-dkart-charcoal pt-2">3. Data Security</h3>
          <p>
            All communications are encrypted using standard 256-bit SSL protocols. We do not sell, rent, or trade customer contact details to third-party marketing brokers.
          </p>

          <h3 className="text-base font-bold text-dkart-charcoal pt-2">4. Inquiries & Contact</h3>
          <p>
            For any questions regarding your personal information, contact our data protection team at <strong>privacy@dkart.pk</strong> or WhatsApp <strong>+92 300 1234567</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
