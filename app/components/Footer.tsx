
export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content flex-col md:flex-row gap-8">
                    <div className="footer-left">
                        <span className="footer-logo">BlinkDir</span>
                        <span className="footer-text">© 2026 BlinkDir. All rights reserved.</span>
                    </div>
                    <div className="footer-links">
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
                        {/* Add more links as needed */}
                    </div>
                </div>
            </div>
        </footer>
    );
}
