export const metadata = {
    title: "Data Privacy Protocols",
    description: "Secure data handling and signal encryption standards.",
};

export default function PrivacyPage() {
    return (
        <>
            <h1>Data Privacy Protocols</h1>
            <p className="lead">Last Updated: Sol 492 (2025 Earth Standard Time)</p>

            <h2>1. Signal Interception & Data Collection</h2>
            <p>
                When you visit The 546 Project (the "Site"), we automatically collect certain telemetry regarding your device, including your web browser, IP address, and time zone. This is referred to as "Device Information."
            </p>
            <p>
                Additionally, as you navigate our supply manifest, we collect information about the individual web pages or products that you view, what websites or search terms referred you to the Site, and information about how you interact with the Site. We refer to this automatically-collected information as "Navigation Telemetry."
            </p>

            <h2>2. Order Information</h2>
            <p>
                When you attempt to make a requisition through the Site, we collect certain information from you, including your name, billing address, shipping coordinates, payment information (including credit card numbers via secure Razorpay channels), email address, and phone number. We refer to this information as "Order Information."
            </p>

            <h2>3. How We Use Your Data</h2>
            <p>We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations).</p>
            <ul>
                <li>Communicate with you regarding mission updates.</li>
                <li>Screen our orders for potential risk or fraud.</li>
                <li>When in line with the preferences you have shared with us, provide you with information or advertising relating to our products or services.</li>
            </ul>

            <h2>4. Data Sharing</h2>
            <p>
                We share your Personal Information with third parties to help us use your Personal Information, as described above. We use Supabase for our backend database and Razorpay for payment processing.
            </p>

            <h2>5. Your Rights</h2>
            <p>
                If you are a European or Martian resident, you have the right to access personal information we hold about you and to ask that your personal information be corrected, updated, or deleted. If you would like to exercise this right, please contact us through the secure comms channel.
            </p>

            <h2>6. Encryption</h2>
            <p>
                All data transmissions are encrypted via SSL (Secure Socket Layer) technology. We do not store credit card details on our servers; they are processed securely by Razorpay.
            </p>
        </>
    );
}
