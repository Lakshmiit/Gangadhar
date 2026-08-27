import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { useNavigate } from "react-router-dom";
import HandyManCharacter from "./img/hm_char.png";
import HandyManLogo from "./img/Hm_Logo 1.png";
import Header from "./Header";
import Footer from "./Footer";
const UserIdLogin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userName: "",
    userPassword: "",
  });
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { userName, userPassword } = formData;
    if (!userName || !userPassword) {
      setError("Please fill all fields.");
      return;
    }

    try {
      setError("");
      setSubmitted(true);
      const response = await fetch(
        `https://localhost:7091/api/UserOnBoarding/VerifyUserLogin?username=${userName}&password=${userPassword}`,
        {
          method: "GET",
        },
      );

      if (!response.ok) {
        throw new Error("Invalid response from server");
      }

      const data = await response.json();

      console.log("API Response:", data);
    } catch (error) {
      console.error("Login error:", error);
      setError("Invalid username or password.");
      setSubmitted(false);
    }
  };

  return (
    <div className="userid-login-page">
      <Header />
      {/* Centered content */}
      <div className="userid-body">
        <div className="userid-card d-flex">
          <div className="userid-left d-flex align-items-center justify-content-center">
            <img
              src={HandyManCharacter}
              alt="Character"
              className="img-fluid userid-character-img"
            />
          </div>

          <div className="userid-right">
            <form
              className="d-flex gap-3 flex-column"
              onSubmit={handleSubmit}
              autoComplete="off"
            >
              <img src={HandyManLogo} alt="Logo" className="userid-form-logo" />
              <h4 className="userid-heading">Sign into your account</h4>

              <div>
                <input
                  type="text"
                  name="userName"
                  placeholder="User ID"
                  className="form-control userid-input"
                  value={formData.userName}
                  onChange={handleChange}
                  autoComplete="off"
                />
              </div>

              <div>
                <input
                  type="password"
                  name="userPassword"
                  placeholder="Password"
                  className="form-control userid-input"
                  value={formData.userPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>

              {error && <span className="text-danger">{error}</span>}

              <div>
                <button
                  type="submit"
                  className={`userid-login-btn ${submitted ? "disabled" : ""}`}
                  disabled={submitted}
                >
                  {submitted ? "Loading..." : "Login"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserIdLogin;
