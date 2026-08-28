import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

export default function VendorLogin() {
  const navigate = useNavigate();

  const [login, setLogin] = useState({
    userName: "",
    password: "",
  });

  const [vendorId, setVendorId] = useState("");

  const handleChange = (e) => {
    setLogin({
      ...login,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!login.userName.trim() || !login.password.trim()) {
      alert("Please enter Username and Password");
      return;
    }

    try {
      const response = await fetch(
        `https://lmartapiv1-fxcyd2b4btacgsav.westus2-01.azurewebsites.net/api/VendorRegistration/GetVendorDetailsByUserNameAndPassword?userName=${encodeURIComponent(
          login.userName.trim(),
        )}&password=${encodeURIComponent(login.password.trim())}`,
      );
      if (!response.ok) {
        alert("Invalid Username or Password");
        return;
      }
      const data = await response.json();
      setVendorId(data.vendorId);

      const vendorIds = data[0].vendorId;

      console.log("login ...............", data[0].vendorId);

      console.log("login vendorIdssss...............", vendorIds);

      localStorage.setItem("vendorId", data.vendorId);
      localStorage.setItem("storeName", data.storeName);
      localStorage.setItem("vendorName", data.fullName);

      const vendorId = localStorage.getItem("vendorId");

      console.log(vendorId);

      // setVendorId(data.vendorId);

      // console.log(data);

      alert("Login Successful");

      //onsole.log("vendor Id .............", vendorId);

      navigate(`/VendorAdminPage/${vendorIds}`);
    } catch (err) {
      console.error(err);
      alert("Invalid Creadentials, Please enter valid Credentials.");
    }
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleLogin}>
        <h2>Vendor Login</h2>

        <div className="login-group">
          <label>User Name</label>

          <input
            type="text"
            name="userName"
            value={login.userName}
            onChange={handleChange}
            placeholder="Enter Username"
          />
        </div>

        <div className="login-group">
          <label>Password</label>

          <input
            type="password"
            name="password"
            value={login.password}
            onChange={handleChange}
            placeholder="Enter Password"
          />
        </div>

        <button className="login-btn" type="submit">
          <span onClick={() => handleLogin}>LoginPage</span>
        </button>

        <p className="register-text">
          New User?{" "}
          <span onClick={() => navigate("/VendorRegistration")}>Register</span>
        </p>
      </form>
    </div>
  );
}
