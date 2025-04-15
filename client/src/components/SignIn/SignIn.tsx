import { useState } from "react";
import { useNavigate } from "react-router";
import { signIn } from "../../services/authApi";
import "./SignIn.css";
import { User } from "../../types/auth.types";

export default function SignIn(props: { setUser: (user: User) => void }) {
  const [formData, setFormData] = useState({ username: "", password: "" });

  const navigate = useNavigate();
  return (
    <div className="wrapper">
      <div className="content">
        <div id="sign-in-container">
          <div id="sign-in-top">
            <h1>Sign in to your account</h1>
            <p>
              Don't have an account yet? <a href="/sign_up">Sign up</a>
            </p>
          </div>
          <div id="sign-in-bottom">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const success = await signIn(
                    formData.username,
                    formData.password
                  );
                  if (success) {
                    props.setUser(success);
                    navigate("/dashboard");
                  } else {
                    alert("Unable to sign in. Please try again.");
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
              <button type="submit">Sign in</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
