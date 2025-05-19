"use client";

export default function PrivacyPolicy() {
    return (
        <div className="max-w-3xl mx-auto px-6 py-12 prose prose-lg dark:prose-invert my-25">
            <h2>Privacy Policy</h2>
            <p><strong>Effective Date:</strong> May 11, 2025</p>

            <h2>1. Introduction</h2>
            <p>
                PeerShare ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect,
                use, and safeguard your information when you use PeerShare, a peer-to-peer file sharing and communication platform.
                By accessing or using PeerShare, you agree to this Privacy Policy.
            </p>

            <h2>2. Scope & Applicability</h2>
            <p>
                This policy applies to all users of PeerShare, regardless of location, and outlines our practices for collecting,
                using, and disclosing data when you interact with our platform.
            </p>

            <h2>3. Information We Collect</h2>
            <ul>
                <li><strong>No File Content or Personal Data:</strong> We do not collect or store the actual content of the files you share.</li>
                <li><strong>Metadata Collection:</strong> We may temporarily process file names, sizes, and connection information (such as IP addresses) to enable peer-to-peer connections. This data is never stored on our servers and is discarded immediately after your session ends.</li>
                {/* <li><strong>Session Data:</strong> We may log brief connection details (IP addresses, timestamps) for security and diagnostic purposes. These logs are anonymized and deleted within 30 days.</li> */}
            </ul>

            <h2>4. How We Use Your Information</h2>
            <ul>
                <li>To establish peer-to-peer connections for file transfers and communication.</li>
                <li>To display metadata (e.g., file name and size) during a transfer session.</li>
                <li>To facilitate live chat and video communication within a session.</li>
                <li>For security, troubleshooting, and platform improvement purposes.</li>
            </ul>

            <h2>5. Legal Basis for Processing</h2>
            <ol>
                <li><strong>Contractual necessity:</strong> To perform and maintain the peer-to-peer file sharing service you request.</li>
                <li><strong>Legitimate interests:</strong> To troubleshoot issues, ensure platform security, and improve service reliability.</li>
                <li><strong>Compliance with legal obligations:</strong> To comply with applicable legal or regulatory requirements, if necessary.</li>
            </ol>

            <h2>6. Data Retention & Storage</h2>
            <ul>
                <li><strong>No Persistent Storage:</strong> PeerShare does not store any user data, files, or metadata on our servers. All session data is deleted when the browser tab or session ends.</li>
                {/* <li><strong>Logs & Diagnostics:</strong> Minimal logs retained for security and diagnostics are anonymized and automatically deleted within 30 days.</li> */}
            </ul>

            <h2>7. Security</h2>
            <ul>
                <li><strong>End-to-End Encryption:</strong> All data transfers (files, chat, video) are encrypted using WebRTC’s DTLS and SRTP protocols. Only the sender and receiver can decrypt the data.</li>
                <li><strong>Secure Infrastructure:</strong> We do not use centralized storage for user data, reducing the risk of data breaches. Our signaling servers only facilitate connection setup and do not retain user data.</li>
            </ul>

            <h2>8. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have rights including:</p>
            <ul>
                <li><strong>Access & Correction:</strong> You can request access to or correction of your personal data, if any.</li>
                <li><strong>Data Deletion:</strong> You may request us to delete any data we may have retained.</li>
                <li><strong>Withdraw Consent:</strong> If processing is based on your consent, you can withdraw it at any time.</li>
            </ul>
            <p>To exercise any of these rights, contact us using the details below. We will respond within the applicable legal timeframes.</p>

            <h2>9. Third-Party Services</h2>
            <ul>
                <li>We rely on public WebRTC signaling servers for peer discovery. However, we do not control or log any data exchanged during signaling.</li>
                <li>We do not integrate analytics, advertising, or tracking services, and we do not share user data with third parties except where required by law.</li>
            </ul>

            <h2>10. Children’s Privacy</h2>
            <p>
                PeerShare is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have unintentionally collected such data, please contact us to have it removed.
            </p>

            <h2>11. Legal Compliance</h2>
            <p>
                While we do not collect personal data or file content, we may be required to cooperate with law enforcement or other authorities if requested, under applicable laws. We will provide user data only when legally compelled.
            </p>

            <h2>12. Changes to This Privacy Policy</h2>
            <p>
                We may update this policy to reflect changes in laws, our services, or user feedback. Any changes will be posted on this page with a new "Effective Date." Continued use of PeerShare after changes constitutes acceptance of the updated policy.
            </p>

            <h2>13. Contact Us</h2>
            <p>
                If you have any questions or requests regarding this Privacy Policy, please contact us at:
            </p>
            <p>
                <strong>PeerShare Support</strong><br />
                Email: <a href="mailto:peershare.contact@gmail.com" className="text-primary underline">Peershare</a>
            </p>
        </div>
    );
}
