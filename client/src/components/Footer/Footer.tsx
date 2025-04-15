import { images } from "../../assets/images";
import "./Footer.css";

export default function Footer() {
  return (
    <footer id="footer-container">
      <img className="logo" src={images.logo} alt="" />
      <div className="links">
        <a
          href="https://facebook.com"
          target="_blank"
          aria-label="to facebook page"
        >
          <img src={images.facebook} alt="facebook logo" />
        </a>
        <a
          href="https://instagram.com"
          target="_blank"
          aria-label="to instagram page"
        >
          <img src={images.instagram} alt="instagram logo" />
        </a>
        <a
          href="https://youtube.com"
          target="_blank"
          aria-label="to youtube page"
        >
          <img src={images.youtube} alt="youtube logo" />
        </a>
        <a
          href="https://github.com"
          target="_blank"
          aria-label="to github page"
        >
          <img src={images.github} alt="github logo" />
        </a>
      </div>
      <p className="copyright">© 2025 Hipoca. All rights reserved.</p>
    </footer>
  );
}
