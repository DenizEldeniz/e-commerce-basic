import './Footer.css';

const Footer = () => {
    return (
        <footer className="app-footer">
            <div className="footer-content">
                <div className="social-links">
                    <a href="https://www.instagram.com/deldenizx/" className="social-icon" aria-label="Instagram">
                        <i className="bi bi-instagram" style={{ fontSize: '1.5rem' }}></i>
                    </a>

                    <a href="https://www.linkedin.com/in/denizeldeniz/" className="social-icon" aria-label="LinkedIn">
                        <i className="bi bi-linkedin" style={{ fontSize: '1.5rem' }}></i>
                    </a>

                    <a href="mailto:denizeldeniz07@gmail.com" className="social-icon" aria-label="Email">
                        <i className="bi bi-envelope-fill" style={{ fontSize: '1.5rem' }}></i>
                    </a>

                    <a href="https://github.com/DenizEldeniz" className="social-icon" aria-label="GitHub">
                        <i className="bi bi-github" style={{ fontSize: '1.5rem' }}></i>
                    </a>

                    <a href="https://www.youtube.com/watch?v=6POZlJAZsok&list=RD6POZlJAZsok&start_radio=1&pp=oAcB" className="social-icon" aria-label="Sushi">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6v13c0 2.2 4 4 9 4s9-1.8 9-4V6" />
                            <ellipse cx="12" cy="6" rx="9" ry="3" />
                            <ellipse cx="12" cy="6" rx="3" ry="1" fill="currentColor" />
                        </svg>
                    </a>
                </div>

                <div className="footer-text">
                    <p className="footer-author">by Deniz Eldeniz</p>
                    <p className="footer-copyright">&copy; {new Date().getFullYear()} All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
