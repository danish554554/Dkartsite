import React from 'react';

export default function TermsPage() {
  return (
    <div className="bg-[#F8F9FB] min-h-screen py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-6 text-xs sm:text-sm text-gray-600 leading-relaxed">
          <div className="border-b pb-4 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-dkart-blue">Legal Policy</span>
            <h1 className="text-2xl sm:text-3xl font-black text-dkart-charcoal">Terms and Conditions of Service</h1>
            <p className="text-xs text-gray-400">Governing dkart.pk in the Islamic Republic of Pakistan</p>
          </div>

          <p>
            Welcome to Dkart (<strong>dkart.pk</strong>). By accessing our website, browsing our product catalog, or placing an order, you agree to be bound by the following terms and conditions.
          </p>

          <h3 className="text-base font-bold text-dkart-charcoal pt-2">1. Orders & Pricing</h3>
          <p>
            All prices listed on Dkart are in Pakistani Rupees (PKR / Rs.) and include applicable retail taxes. We reserve the right to decline or cancel orders in cases of pricing typographical errors or product stock unavailability.
          </p>

          <h3 className="text-base font-bold text-dkart-charcoal pt-2">2. Cash on Delivery (COD)</h3>
          <p>
            By choosing Cash on Delivery, you agree to receive the parcel and pay the full invoice amount to the courier representative upon arrival. Refusal of legitimate verified orders upon arrival without valid defect reasons may result in account blacklisting.
          </p>

          <h3 className="text-base font-bold text-dkart-charcoal pt-2">3. Product Warranties & Replacements</h3>
          <p>
            Products are backed by Dkart's 7-Day Replacement Guarantee covering manufacturing faults. Physical abuse, water damage outside specified IP ratings, or unauthorized electrical modifications void warranty coverage.
          </p>
        </div>
      </div>
    </div>
  );
}
