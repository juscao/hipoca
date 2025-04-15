import { useState } from "react";
import { useNavigate } from "react-router";
import { signUp } from "../../services/authApi";
import { User } from "../../types/auth.types";
import "./SignUp.css";

export default function SignUp(props: { setUser: (user: User) => void }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirm: "",
  });

  const navigate = useNavigate();

  return (
    <div className="wrapper">
      <div className="content">
        <div id="sign-up-container">
          <div id="sign-up-top">
            <h1>Sign up for free</h1>
            <p>
              Already have an account yet? <a href="/sign_in">Sign in</a>
            </p>
          </div>
          <div id="sign-up-bottom">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (formData.password !== formData.confirm) {
                  alert("Unable to sign up. Please try again.");
                  return;
                }
                try {
                  const success = await signUp(
                    formData.username,
                    formData.password
                  );
                  if (success) {
                    props.setUser(success);
                    navigate("/dashboard");
                  } else {
                    alert("Unable to sign up. Please try again.");
                  }
                } catch (error) {
                  console.log(error);
                }
              }}
            >
              <label>
                Username:
                <input
                  name="username"
                  type="text"
                  value={formData.username}
                  required
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Password:
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  required
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Confirm password:
                <input
                  name="confirm"
                  type="password"
                  value={formData.confirm}
                  required
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      confirm: e.target.value,
                    }))
                  }
                />
              </label>
              <button type="submit">Sign up</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
