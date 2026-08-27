import React, { useState, useEffect, useRef } from "react";
import "./App.css"; 

const OTPInput = () => {
  const otpInputs = useRef([]);

  const handleKeyUp = (index, event) => {
    const { keyCode, target } = event;

    if (keyCode === 13 || target.value.length === 1) {
      if (otpInputs.current[index + 1]) {
        otpInputs.current[index + 1].focus();
      }
    }
  };

  return (
    <div className="otp-container">
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <input
            key={i}
            ref={(el) => (otpInputs.current[i] = el)}
            type="text"
            maxLength="1"
            className="otpinpts"
            onKeyUp={(event) => handleKeyUp(i, event)}
          />
        ))}
    </div>
  );
};

const Alert = ({ message, type, onClose }) => {
  return (
    <div className={`alert alert-${type} alert-dismissible`} role="alert">
      <div>{message}</div>
      <button type="button" className="btn-close" onClick={onClose}></button>
    </div>
  );
};

const AlertsDemo = () => {
  const [alert, setAlert] = useState(null);

  const showAlert = () => {
    setAlert({ message: "Sent Successfully!", type: "success" });
  };

  return (
    <div>
      <button id="liveAlertBtn" className="btn btn-primary" onClick={showAlert}>
        Trigger Alert
      </button>
      <div id="liveAlertPlaceholder">
        {alert && (
          <Alert
            message={alert.message}
            type={alert.type}
            onClose={() => setAlert(null)}
          />
        )}
      </div>
    </div>
  );
};

const MultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ["Step 1", "Step 2", "Step 3"];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="multi-step-form">
      <ul id="progressbar">
        {steps.map((step, index) => (
          <li key={index} className={index <= currentStep ? "active" : ""}>
            {step}
          </li>
        ))}
      </ul>
      <fieldset>
        <h2>{steps[currentStep]}</h2>
        <button className="previous" onClick={prevStep} disabled={currentStep === 0}>
          Previous
        </button>
        <button className="next" onClick={nextStep} disabled={currentStep === steps.length - 1}>
          Next
        </button>
      </fieldset>
    </div>
  );
};

const ResponsiveMenu = () => {
  const [isMobileMenuVisible, setMobileMenuVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 767;
      setMobileMenuVisible(!isMobile);
    };

    handleResize(); // Set initial state
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = () => {
    setMobileMenuVisible((prev) => !prev);
  };

  return (
    <div>
      <button className="mob_menu_bars" onClick={toggleMenu}>
        ☰
      </button>
      <div
        className={`sde_mnu ${isMobileMenuVisible ? "d-flex" : "d-none"}`}
      >
        {/* Menu content here */}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <div className="App">
      <h1>React Conversion</h1>
      <OTPInput />
      <AlertsDemo />
      <MultiStepForm />
      <ResponsiveMenu />
    </div>
  );
};

export default App;
