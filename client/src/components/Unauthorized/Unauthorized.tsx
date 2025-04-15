import { images } from "../../assets/images";
import "./Unauthorized.css";

export default function NotFound() {
  return (
    <div className="wrapper">
      <div className="content">
        <div id="unauthorized-container">
          <img src={images.unauthorized} alt="" />
          <p>
            You are not authorized to view this page. Click{" "}
            <span onClick={() => window.history.back()}>here</span> to go back.
          </p>
        </div>
      </div>
    </div>
  );
}
