import { useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import { images } from "../../assets/images";
import "./Home.css";

export default function Home() {
  document.title = "Home | Hipoca";
  const user = useContext(UserContext);
  return (
    <div id="home-container">
      <div className="top">
        <h1>Flashcards made easy</h1>
        <div className="images">
          <img src={images.create} alt="" />
          <img src={images.review} alt="" />
          <img src={images.share} alt="" />
        </div>
        <p>
          Create, review, and share your flashcards with our free and
          easy-to-use application.
        </p>
        <a
          href={user ? "/dashboard" : "/sign_up"}
          aria-label={user ? "to dashboard" : "to sign up page"}
        >
          Get started
        </a>
      </div>
      <div className="middle"></div>
      <div className="bottom"></div>
    </div>
  );
}
