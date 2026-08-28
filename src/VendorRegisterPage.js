// import React, { useState, useRef, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import VisibilityIcon from "@mui/icons-material/Visibility";
// import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
// import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// const MAX_FILE_SIZE_MB = 5;

// const fileToBase64 = (file) =>
//   new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onload = () => resolve(reader.result.split(",")[1]);
//     reader.onerror = () => reject(new Error("Could not read file."));
//     reader.readAsDataURL(file);
//   });

// const DocumentUpload = ({
//   label,
//   hint,
//   file,
//   preview,
//   onChange,
//   onRemove,
//   inputRef,
// }) => (
//   <div className="vr-upload">
//     <label className="vr-upload-label">{label}</label>
//     <input
//       ref={inputRef}
//       type="file"
//       accept="image/*"
//       className="vr-upload-input"
//       onChange={onChange}
//     />
//     {!file ? (
//       <div className="vr-upload-box" onClick={() => inputRef.current?.click()}>
//         <svg
//           width="26"
//           height="26"
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth="1.6"
//         >
//           <path
//             d="M12 16V4M12 4l-4 4M12 4l4 4"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//           />
//           <path
//             d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//           />
//         </svg>
//         <span className="vr-upload-title">Upload {label}</span>
//         <span className="vr-upload-hint">{hint}</span>
//       </div>
//     ) : (
//       <div className="vr-upload-box vr-upload-filled">
//         <img src={preview} alt={label} className="vr-upload-thumb" />
//         <div className="vr-upload-meta">
//           <span className="vr-upload-check">
//             <svg
//               width="16"
//               height="16"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2.4"
//             >
//               <path
//                 d="M5 13l4 4L19 7"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               />
//             </svg>
//             Attached
//           </span>
//           <span className="vr-upload-filename">{file.name}</span>
//           <div className="vr-upload-actions">
//             <button
//               type="button"
//               className="vr-link"
//               onClick={() => inputRef.current?.click()}
//             >
//               Replace
//             </button>
//             <button
//               type="button"
//               className="vr-link vr-link-danger"
//               onClick={onRemove}
//             >
//               Remove
//             </button>
//           </div>
//         </div>
//       </div>
//     )}
//   </div>
// );

// const VendorRegisterPage = () => {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     fullName: "",
//     storeName: "",
//     address: "",
//     mobileNumber: "",
//     userName: "",
//     password: "",
//     confirmPassword: "",
//     registrationCertificate: "",
//   });
//   const [userId, setUserId] = useState("");
//   useEffect(() => {
//     const savedMobileNumber = localStorage.getItem(
//       "vendorRegistrationMobileNumber",
//     );
//     if (savedMobileNumber) {
//       setFormData((prev) => ({
//         ...prev,
//         mobileNumber: savedMobileNumber,
//       }));
//     }
//   }, []);

//   useEffect(() => {
//     const savedUserId = localStorage.getItem("vendorRegistrationUserId");

//     if (savedUserId) {
//       setUserId(savedUserId);
//       console.log("Vendor registration userId loaded:", savedUserId);
//     }
//   }, []);

//   useEffect(() => {
//     console.log(userId);
//   }, [userId]);

//   const [aadharFile, setAadharFile] = useState(null);
//   const [aadharPreview, setAadharPreview] = useState(null);
//   const [aadharBase64, setAadharBase64] = useState("");

//   const [gstFile, setGstFile] = useState(null);
//   const [gstPreview, setGstPreview] = useState(null);
//   const [gstBase64, setGstBase64] = useState("");

//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");

//   const aadharInputRef = useRef(null);
//   const gstInputRef = useRef(null);

//   const handleChange = (field) => (e) => {
//     setFormData((prev) => ({ ...prev, [field]: e.target.value }));
//   };

//   const handleFileSelect = async (e, kind) => {
//     setError("");
//     const file = e.target.files?.[0];
//     if (!file) return;

//     if (!file.type.startsWith("image/")) {
//       setError("Only image files (JPG, PNG, etc.) are accepted for documents.");
//       e.target.value = "";
//       return;
//     }
//     if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
//       setError(
//         `File is too large. Please upload an image under ${MAX_FILE_SIZE_MB}MB.`,
//       );
//       e.target.value = "";
//       return;
//     }

//     try {
//       const base64 = await fileToBase64(file);
//       const previewUrl = URL.createObjectURL(file);
//       if (kind === "aadhar") {
//         setAadharFile(file);
//         setAadharPreview(previewUrl);
//         setAadharBase64(base64);
//       } else {
//         setGstFile(file);
//         setGstPreview(previewUrl);
//         setGstBase64(base64);
//       }
//     } catch {
//       setError(
//         "Could not process the selected file. Please try another image.",
//       );
//     }
//   };

//   const removeFile = (kind) => {
//     if (kind === "aadhar") {
//       setAadharFile(null);
//       setAadharPreview(null);
//       setAadharBase64("");
//       if (aadharInputRef.current) aadharInputRef.current.value = "";
//     } else {
//       setGstFile(null);
//       setGstPreview(null);
//       setGstBase64("");
//       if (gstInputRef.current) gstInputRef.current.value = "";
//     }
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     setError("");
//     setMessage("");

//     const {
//       fullName,
//       storeName,
//       address,
//       mobileNumber,
//       userName,
//       password,
//       confirmPassword,
//     } = formData;

//     if (
//       !fullName.trim() ||
//       !storeName.trim() ||
//       !address.trim() ||
//       !mobileNumber.trim() ||
//       !userName.trim() ||
//       !password.trim() ||
//       !confirmPassword.trim()
//     ) {
//       setError("Please fill in all required fields.");
//       return;
//     }
//     if (password !== confirmPassword) {
//       setError("Passwords do not match.");
//       return;
//     }
//     if (!aadharBase64) {
//       setError("Please upload your Aadhar card image.");
//       return;
//     }
//     if (!gstBase64) {
//       setError("Please upload your GST certificate image.");
//       return;
//     }
//     const savedUserId = localStorage.getItem("vendorRegistrationUserId");
//     const payload = {
//       id: "string",
//       date: new Date().toISOString(),
//       vendorId: savedUserId,
//       fullName: fullName.trim(),
//       address: address.trim(),
//       storeName: storeName.trim(),
//       registrationCertificate: "",
//       gst: gstBase64,
//       aadharCard: aadharBase64,
//       mobileNumber: mobileNumber.trim(),
//       userName: userName.trim(),
//       password: password.trim(),
//     };

//     setLoading(true);
//     try {
//       const response = await fetch(
//         "https://lmartapiv1-fxcyd2b4btacgsav.westus2-01.azurewebsites.net/api/VendorRegistration/UploadVendorDetails",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payload),
//         },
//       );

//       if (!response.ok) {
//         const text = await response.text().catch(() => "");
//         throw new Error(text || "Registration failed. Please try again.");
//       }

//       setMessage("Registration successful. Redirecting to login...");
//       setTimeout(() => navigate("/vendor/login"), 1200);
//     } catch (err) {
//       setError(err.message || "Unable to register vendor. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="vr-page">
//       <div className="vr-form-wrap">
//         <div className="vr-card">
//           <div className="vr-header">
//             <ArrowBackIcon
//               className="vr-back-icon"
//               onClick={() => navigate(`/profilePage/customer/${userId}`)}
//             />

//             <h3 className="vr-card-title">Vendor Registration</h3>
//           </div>

//           {error && <div className="vr-alert vr-alert-error">{error}</div>}
//           {message && (
//             <div className="vr-alert vr-alert-success">{message}</div>
//           )}

//           <form onSubmit={handleSubmit}>
//             <div className="vr-field">
//               <label className="vr-label">Full Name</label>
//               <input
//                 type="text"
//                 className="vr-input"
//                 value={formData.fullName}
//                 onChange={handleChange("fullName")}
//                 placeholder="Contact person's full name"
//                 required
//               />
//             </div>

//             <div className="vr-field">
//               <label className="vr-label">Business / Vendor Name</label>
//               <input
//                 type="text"
//                 className="vr-input"
//                 value={formData.storeName}
//                 onChange={handleChange("storeName")}
//                 placeholder="Store or business name"
//                 required
//               />
//             </div>

//             <div className="vr-field">
//               <label className="vr-label">Address</label>
//               <textarea
//                 className="vr-textarea"
//                 value={formData.address}
//                 onChange={handleChange("address")}
//                 placeholder="Business address"
//                 required
//               />
//             </div>

//             <div className="vr-row">
//               <div className="vr-field">
//                 <label className="vr-label">Mobile Number</label>
//                 <input
//                   type="tel"
//                   className="vr-input"
//                   value={formData.mobileNumber}
//                   placeholder="10-digit mobile number"
//                   readOnly
//                   required
//                 />
//               </div>
//               <div className="vr-field">
//                 <label className="vr-label">Username</label>
//                 <input
//                   type="text"
//                   className="vr-input"
//                   value={formData.userName}
//                   onChange={handleChange("userName")}
//                   placeholder="Choose a username"
//                   required
//                 />
//               </div>
//             </div>

//             <div className="vr-row">
//               <div className="vr-field">
//                 <label className="vr-label">Password</label>
//                 <div className="vr-password-wrap">
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     className="vr-input"
//                     value={formData.password}
//                     onChange={handleChange("password")}
//                     placeholder="Create password"
//                     required
//                     style={{ paddingRight: 36 }}
//                   />
//                   <button
//                     type="button"
//                     className="vr-eye-btn"
//                     onClick={() => setShowPassword((s) => !s)}
//                     tabIndex={-1}
//                   >
//                     {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
//                   </button>
//                 </div>
//               </div>
//               <div className="vr-field">
//                 <label className="vr-label">Confirm Password</label>
//                 <div className="vr-password-wrap">
//                   <input
//                     type={showConfirm ? "text" : "password"}
//                     className="vr-input"
//                     value={formData.confirmPassword}
//                     onChange={handleChange("confirmPassword")}
//                     placeholder="Repeat password"
//                     required
//                     style={{ paddingRight: 36 }}
//                   />
//                   <button
//                     type="button"
//                     className="vr-eye-btn"
//                     onClick={() => setShowConfirm((s) => !s)}
//                     tabIndex={-1}
//                   >
//                     {showConfirm ? <VisibilityIcon /> : <VisibilityOffIcon />}
//                   </button>
//                 </div>
//               </div>
//             </div>

//             <div className="vr-uploads">
//               <DocumentUpload
//                 label="Aadhar Card"
//                 hint="One image, up to 5MB"
//                 file={aadharFile}
//                 preview={aadharPreview}
//                 onChange={(e) => handleFileSelect(e, "aadhar")}
//                 onRemove={() => removeFile("aadhar")}
//                 inputRef={aadharInputRef}
//               />
//               <DocumentUpload
//                 label="GST Certificate"
//                 hint="One image, up to 5MB"
//                 file={gstFile}
//                 preview={gstPreview}
//                 onChange={(e) => handleFileSelect(e, "gst")}
//                 onRemove={() => removeFile("gst")}
//                 inputRef={gstInputRef}
//               />
//             </div>

//             <button type="submit" className="vr-submit" disabled={loading}>
//               {loading && <span className="vr-spinner" />}
//               {loading ? "Submitting..." : "Register"}
//             </button>
//           </form>

//           <div className="vr-footer">
//             Already registered? <a href="/vendor/login">Login here</a>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VendorRegisterPage;

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const MAX_FILE_SIZE_MB = 5;

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsDataURL(file);
  });

const DocumentUpload = ({
  label,
  hint,
  file,
  preview,
  onChange,
  onRemove,
  inputRef,
}) => (
  <div className="vr-upload">
    <label className="vr-upload-label">{label}</label>
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      className="vr-upload-input"
      onChange={onChange}
    />
    {!file ? (
      <div className="vr-upload-box" onClick={() => inputRef.current?.click()}>
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <path
            d="M12 16V4M12 4l-4 4M12 4l4 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="vr-upload-title">Upload {label}</span>
        <span className="vr-upload-hint">{hint}</span>
      </div>
    ) : (
      <div className="vr-upload-box vr-upload-filled">
        <img src={preview} alt={label} className="vr-upload-thumb" />
        <div className="vr-upload-meta">
          <span className="vr-upload-check">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
            >
              <path
                d="M5 13l4 4L19 7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Attached
          </span>
          <span className="vr-upload-filename">{file.name}</span>
          <div className="vr-upload-actions">
            <button
              type="button"
              className="vr-link"
              onClick={() => inputRef.current?.click()}
            >
              Replace
            </button>
            <button
              type="button"
              className="vr-link vr-link-danger"
              onClick={onRemove}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);

const VendorRegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    storeName: "",
    address: "",
    mobileNumber: "",
    userName: "",
    password: "",
    confirmPassword: "",
    registrationCertificate: "",
  });
  const [userId, setUserId] = useState("");

  // ---- State / District / Zipcodes ----
  const [stateId, setStateId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [stateList, setStateList] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [pincodeOptions, setPincodeOptions] = useState([]);
  const [selectedZipcodes, setSelectedZipcodes] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingPincodes, setLoadingPincodes] = useState(false);

  useEffect(() => {
    const savedMobileNumber = localStorage.getItem(
      "vendorRegistrationMobileNumber",
    );
    if (savedMobileNumber) {
      setFormData((prev) => ({
        ...prev,
        mobileNumber: savedMobileNumber,
      }));
    }
  }, []);

  useEffect(() => {
    const savedUserId = localStorage.getItem("vendorRegistrationUserId");

    if (savedUserId) {
      setUserId(savedUserId);
      console.log("Vendor registration userId loaded:", savedUserId);
    }
  }, []);

  useEffect(() => {
    console.log(userId);
  }, [userId]);

  // Fetch all states on mount
  useEffect(() => {
    axios
      .get(
        "https://lmartapiv1-fxcyd2b4btacgsav.westus2-01.azurewebsites.net/api/MasterData/getStates",
      )
      .then((response) => setStateList(response.data))
      .catch((error) => console.error("Error fetching states:", error));
  }, []);

  // Fetch districts whenever the selected state changes
  useEffect(() => {
    if (stateId) {
      setLoadingDistricts(true);
      axios
        .get(
          `https://lmartapiv1-fxcyd2b4btacgsav.westus2-01.azurewebsites.net/api/MasterData/getDistricts/${stateId}`,
        )
        .then((response) => setDistrictList(response.data || []))
        .catch((error) => {
          console.error("Error fetching districts:", error);
          setDistrictList([]);
        })
        .finally(() => setLoadingDistricts(false));
    } else {
      setDistrictList([]);
    }
  }, [stateId]);

  // Fetch pincodes whenever the selected district changes
  useEffect(() => {
    if (districtId) {
      setLoadingPincodes(true);
      axios
        .get(
          `https://lmartapiv1-fxcyd2b4btacgsav.westus2-01.azurewebsites.net/api/MasterData/getPincodes/${districtId}`,
        )
        .then((response) => setPincodeOptions(response.data || []))
        .catch((error) => {
          console.error("Error fetching pincodes:", error);
          setPincodeOptions([]);
        })
        .finally(() => setLoadingPincodes(false));
    } else {
      setPincodeOptions([]);
    }
  }, [districtId]);

  const handleStateChange = (e) => {
    const selectedId = e.target.value;
    setStateId(selectedId);
    setDistrictId("");
    setPincodeOptions([]);
    setSelectedZipcodes([]);
  };

  const handleDistrictChange = (e) => {
    const selectedId = e.target.value;
    setDistrictId(selectedId);
    setSelectedZipcodes([]);
  };

  const handleZipcodeToggle = (pin) => {
    setSelectedZipcodes((prev) =>
      prev.includes(pin) ? prev.filter((p) => p !== pin) : [...prev, pin],
    );
  };

  const handleSelectAllZipcodes = () => {
    if (selectedZipcodes.length === pincodeOptions.length) {
      setSelectedZipcodes([]);
    } else {
      setSelectedZipcodes([...pincodeOptions]);
    }
  };

  const getSelectedStateName = () => {
    const match = stateList.find((s) => String(s.StateId) === String(stateId));
    return match ? match.StateName : "";
  };

  const getSelectedDistrictName = () => {
    const match = districtList.find(
      (d) => String(d.districtId) === String(districtId),
    );
    return match ? match.districtName : "";
  };

  const [aadharFile, setAadharFile] = useState(null);
  const [aadharPreview, setAadharPreview] = useState(null);
  const [aadharBase64, setAadharBase64] = useState("");

  const [gstFile, setGstFile] = useState(null);
  const [gstPreview, setGstPreview] = useState(null);
  const [gstBase64, setGstBase64] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const aadharInputRef = useRef(null);
  const gstInputRef = useRef(null);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleFileSelect = async (e, kind) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Only image files (JPG, PNG, etc.) are accepted for documents.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(
        `File is too large. Please upload an image under ${MAX_FILE_SIZE_MB}MB.`,
      );
      e.target.value = "";
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      const previewUrl = URL.createObjectURL(file);
      if (kind === "aadhar") {
        setAadharFile(file);
        setAadharPreview(previewUrl);
        setAadharBase64(base64);
      } else {
        setGstFile(file);
        setGstPreview(previewUrl);
        setGstBase64(base64);
      }
    } catch {
      setError(
        "Could not process the selected file. Please try another image.",
      );
    }
  };

  const removeFile = (kind) => {
    if (kind === "aadhar") {
      setAadharFile(null);
      setAadharPreview(null);
      setAadharBase64("");
      if (aadharInputRef.current) aadharInputRef.current.value = "";
    } else {
      setGstFile(null);
      setGstPreview(null);
      setGstBase64("");
      if (gstInputRef.current) gstInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const {
      fullName,
      storeName,
      address,
      mobileNumber,
      userName,
      password,
      confirmPassword,
    } = formData;

    if (
      !fullName.trim() ||
      !storeName.trim() ||
      !address.trim() ||
      !mobileNumber.trim() ||
      !userName.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!stateId) {
      setError("Please select a state.");
      return;
    }
    if (!districtId) {
      setError("Please select a district.");
      return;
    }
    if (selectedZipcodes.length === 0) {
      setError("Please select at least one zipcode you can serve.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!aadharBase64) {
      setError("Please upload your Aadhar card image.");
      return;
    }
    if (!gstBase64) {
      setError("Please upload your GST certificate image.");
      return;
    }
    const savedUserId = localStorage.getItem("vendorRegistrationUserId");
    const payload = {
      id: "string",
      date: new Date().toISOString(),
      vendorId: savedUserId,
      fullName: fullName.trim(),
      address: address.trim(),
      storeName: storeName.trim(),
      registrationCertificate: "",
      gst: gstBase64,
      aadharCard: aadharBase64,
      state: getSelectedStateName(),
      district: getSelectedDistrictName(),
      zipcodes: selectedZipcodes,
      mobileNumber: mobileNumber.trim(),
      userName: userName.trim(),
      password: password.trim(),
    };

    setLoading(true);
    try {
      const response = await fetch(
        "https://lmartapiv1-fxcyd2b4btacgsav.westus2-01.azurewebsites.net/api/VendorRegistration/UploadVendorDetails",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || "Registration failed. Please try again.");
      }

      setMessage("Registration successful. Redirecting to login...");
      setTimeout(() => navigate("/vendor/login"), 1200);
    } catch (err) {
      setError(err.message || "Unable to register vendor. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vr-page">
      <div className="vr-form-wrap">
        <div className="vr-card">
          <div className="vr-header">
            <ArrowBackIcon
              className="vr-back-icon"
              onClick={() => navigate(`/profilePage/customer/${userId}`)}
            />

            <h3 className="vr-card-title">Vendor Registration</h3>
          </div>

          {error && <div className="vr-alert vr-alert-error">{error}</div>}
          {message && (
            <div className="vr-alert vr-alert-success">{message}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="vr-field">
              <label className="vr-label">Full Name</label>
              <input
                type="text"
                className="vr-input"
                value={formData.fullName}
                onChange={handleChange("fullName")}
                placeholder="Contact person's full name"
                required
              />
            </div>

            <div className="vr-field">
              <label className="vr-label">Business / Vendor Name</label>
              <input
                type="text"
                className="vr-input"
                value={formData.storeName}
                onChange={handleChange("storeName")}
                placeholder="Store or business name"
                required
              />
            </div>

            <div className="vr-field">
              <label className="vr-label">Address</label>
              <textarea
                className="vr-textarea"
                value={formData.address}
                onChange={handleChange("address")}
                placeholder="Business address"
                required
              />
            </div>

            <div className="vr-row">
              <div className="vr-field">
                <label className="vr-label">State</label>
                <select
                  className="vr-input"
                  value={stateId}
                  onChange={handleStateChange}
                  required
                >
                  <option value="">Select State</option>
                  {stateList.map((s) => (
                    <option key={s.StateId} value={s.StateId}>
                      {s.StateName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="vr-field">
                <label className="vr-label">District</label>
                <select
                  className="vr-input"
                  value={districtId}
                  onChange={handleDistrictChange}
                  disabled={!stateId || loadingDistricts}
                  required
                >
                  <option value="">
                    {loadingDistricts ? "Loading..." : "Select District"}
                  </option>
                  {districtList.map((d) => (
                    <option key={d.districtId} value={d.districtId}>
                      {d.districtName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="vr-field">
              <label className="vr-label">
                Serviceable Zipcodes{" "}
                {selectedZipcodes.length > 0 && (
                  <span className="vr-zip-count">
                    ({selectedZipcodes.length} selected)
                  </span>
                )}
              </label>

              {!districtId ? (
                <p className="vr-zip-hint">
                  Select a district to see available zipcodes.
                </p>
              ) : loadingPincodes ? (
                <p className="vr-zip-hint">Loading zipcodes...</p>
              ) : pincodeOptions.length === 0 ? (
                <p className="vr-zip-hint">
                  No zipcodes found for this district.
                </p>
              ) : (
                <>
                  <button
                    type="button"
                    className="vr-link"
                    onClick={handleSelectAllZipcodes}
                  >
                    {selectedZipcodes.length === pincodeOptions.length
                      ? "Clear all"
                      : "Select all"}
                  </button>
                  <div className="vr-zip-grid">
                    {pincodeOptions.map((pin) => (
                      <label key={pin} className="vr-zip-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedZipcodes.includes(pin)}
                          onChange={() => handleZipcodeToggle(pin)}
                        />
                        <span>{pin}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="vr-row">
              <div className="vr-field">
                <label className="vr-label">Mobile Number</label>
                <input
                  type="tel"
                  className="vr-input"
                  value={formData.mobileNumber}
                  placeholder="10-digit mobile number"
                  readOnly
                  required
                />
              </div>
              <div className="vr-field">
                <label className="vr-label">Username</label>
                <input
                  type="text"
                  className="vr-input"
                  value={formData.userName}
                  onChange={handleChange("userName")}
                  placeholder="Choose a username"
                  required
                />
              </div>
            </div>

            <div className="vr-row">
              <div className="vr-field">
                <label className="vr-label">Password</label>
                <div className="vr-password-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="vr-input"
                    value={formData.password}
                    onChange={handleChange("password")}
                    placeholder="Create password"
                    required
                    style={{ paddingRight: 36 }}
                  />
                  <button
                    type="button"
                    className="vr-eye-btn"
                    onClick={() => setShowPassword((s) => !s)}
                    tabIndex={-1}
                  >
                    {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </button>
                </div>
              </div>
              <div className="vr-field">
                <label className="vr-label">Confirm Password</label>
                <div className="vr-password-wrap">
                  <input
                    type={showConfirm ? "text" : "password"}
                    className="vr-input"
                    value={formData.confirmPassword}
                    onChange={handleChange("confirmPassword")}
                    placeholder="Repeat password"
                    required
                    style={{ paddingRight: 36 }}
                  />
                  <button
                    type="button"
                    className="vr-eye-btn"
                    onClick={() => setShowConfirm((s) => !s)}
                    tabIndex={-1}
                  >
                    {showConfirm ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </button>
                </div>
              </div>
            </div>

            <div className="vr-uploads">
              <DocumentUpload
                label="Aadhar Card"
                hint="One image, up to 5MB"
                file={aadharFile}
                preview={aadharPreview}
                onChange={(e) => handleFileSelect(e, "aadhar")}
                onRemove={() => removeFile("aadhar")}
                inputRef={aadharInputRef}
              />
              <DocumentUpload
                label="GST Certificate"
                hint="One image, up to 5MB"
                file={gstFile}
                preview={gstPreview}
                onChange={(e) => handleFileSelect(e, "gst")}
                onRemove={() => removeFile("gst")}
                inputRef={gstInputRef}
              />
            </div>

            <button type="submit" className="vr-submit" disabled={loading}>
              {loading && <span className="vr-spinner" />}
              {loading ? "Submitting..." : "Register"}
            </button>
          </form>

          <div className="vr-footer">
            Already registered? <a href="/vendor/login">Login here</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorRegisterPage;
