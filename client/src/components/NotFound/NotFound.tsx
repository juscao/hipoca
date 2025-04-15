import { images } from "../../assets/images";
import "./NotFound.css";

export default function NotFound() {
  return (
    <div className="wrapper">
      <div className="content">
        <div id="not-found-container">
          <img src={images.not_found} alt="" />
          <p>
            The page you are looking for could not be found. Click{" "}
            <span onClick={() => window.history.back()}>here</span> to go back.
          </p>
        </div>
      </div>
    </div>
  );
}
