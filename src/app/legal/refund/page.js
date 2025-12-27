export const metadata = {
    title: "Refund & Access Directives",
    description: "Protocols for asset recovery and compensation.",
};

export default function RefundPage() {
    return (
        <>
            <h1>Refund & Access Directives</h1>
            <p className="lead">Protocols regarding asset returns and compensatory credits.</p>

            <h2>1. The 'No Contamination' Rule</h2>
            <p>
                Due to strict bio-hazard controls required for interplanetary transport, items that have been unsealed and exposed to the Earth atmosphere (worn/used) typically cannot be returned to the general supply. However, we offer a 14-day window for defects or sizing issues.
            </p>

            <h2>2. Eligibility for Returns</h2>
            <p>
                To be eligible for a return, your item must be unused, unwashed, and in the same condition that you received it. It must also be in the original vacuum-seal packaging.
            </p>

            <h2>3. Refund Process</h2>
            <p>
                Once your return is received and inspected (quarantined), we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund.
                If you are approved, then your refund will be processed, and a credit will automatically be applied to your credit card or original method of payment, within a certain amount of days.
            </p>

            <h2>4. Exchanges</h2>
            <p>
                We only replace items if they are defective or damaged (e.g., vacuum seal breach, fabric tear). If you need to exchange it for the same item, initiate a secure comms uplink to our support frequency.
            </p>

            <h2>5. Hull Insurance</h2>
            <p>
                If you purchased "Hull Insurance" at checkout, you are eligible for immediate replacement of lost or damaged goods during transit without investigation delay.
            </p>
        </>
    );
}
