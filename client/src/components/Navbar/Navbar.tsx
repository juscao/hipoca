import { useState, useContext, useEffect, useRef } from "react";
import { logout } from "../../services/authApi";
import { images } from "../../assets/images";
import { UserContext } from "../../contexts/UserContext";
import "./Navbar.css";

export default function Navbar() {
  const [showHamburger, setShowHamburger] = useState(false);

  const user = useContext(UserContext);

  const hamburgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target as Node) &&
        showHamburger
      ) {
        setShowHamburger(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showHamburger]);

  return (
    <div id="navbar-container">
      <div id="navbar-content">
        <div id="navbar-logo">
          <a href="/" aria-label="to homepage">
            <img src={images.logo} alt="" />
            Hipoca
          </a>
        </div>
        <div id="navbar-buttons">
          {user && (
            <a
              href={user ? "/dashboard" : "/sign_in"}
              aria-label={user ? "Dashboard" : "Sign in to access dashboard"}
            >
              Dashboard
            </a>
          )}
          <a
            href={user ? "/study" : "/sign_in"}
            aria-label={user ? "Dashboard" : "Sign in to study"}
          >
            Study
          </a>
          <a
            href={user ? "/create" : "/sign_in"}
            aria-label={user ? "Dashboard" : "Sign in to create"}
          >
            Create
          </a>
          <a
            href={user ? "/explore" : "/sign_in"}
            aria-label={user ? "Dashboard" : "Sign in to explore"}
          >
            Explore
          </a>
          {!user && <a href="/sign_in">Sign in</a>}
          {user ? (
            <button
              id="logout-button"
              onClick={async () => {
                try {
                  const success = await logout();
                  if (success) {
                    window.location.href = "/sign_in";
                  } else {
                    alert("Unable to log out. Please try again.");
                  }
                } catch (error) {
                  console.log(error);
                }
              }}
            >
              Log out
            </button>
          ) : (
            <a id="sign-up-button" href="/sign_up">
              Sign up
            </a>
          )}
        </div>
        <button
          id="navbar-hamburger"
          type="button"
          onClick={() => setShowHamburger(() => !showHamburger)}
          ref={hamburgerRef}
        >
          <img
            src={images.hamburger}
            style={
              showHamburger ? { backgroundColor: "rgb(247, 249, 252)" } : {}
            }
            alt="menu"
          />
          {showHamburger && (
            <div className="hamburger-list">
              {user && (
                <a
                  href={user ? "/dashboard" : "/sign_in"}
                  aria-label={
                    user ? "Dashboard" : "Sign in to access dashboard"
                  }
                >
                  Dashboard
                </a>
              )}
              <a
                href={user ? "/study" : "/sign_in"}
                aria-label={user ? "Dashboard" : "Sign in to study"}
              >
                Study
              </a>
              <a
                href={user ? "/create" : "/sign_in"}
                aria-label={user ? "Dashboard" : "Sign in to create"}
              >
                Create
              </a>
              <a
                href={user ? "/explore" : "/sign_in"}
                aria-label={user ? "Dashboard" : "Sign in to explore"}
              >
                Explore
              </a>
              {!user && <a href="/sign_in">Sign in</a>}
              {user ? (
                <button
                  className="logout-button-hamburger"
                  onClick={async () => {
                    try {
                      const success = await logout();
                      if (success) {
                        window.location.href = "/sign_in";
                      } else {
                        alert("Unable to log out. Please try again.");
                      }
                    } catch (error) {
                      console.log(error);
                    }
                  }}
                >
                  Log out
                </button>
              ) : (
                <a id="sign-up-button" href="/sign_up">
                  Sign up
                </a>
              )}
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
