// import React, { useEffect, useState, useRef  } from 'react';
// // import { Formik, Form, Field, ErrorMessage } from 'formik';
// // import * as Yup from 'yup';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import './App.css';
// import HandyMan from './img/Hm_Logo 1.png';
// import { useLocation, useNavigate, useParams } from 'react-router-dom';
// import { ArrowBack } from '@mui/icons-material';
// import { v4 as uuidv4 } from 'uuid';

// const TechnicianRegistration = () => {
//     const Navigate = useNavigate();
//     const location = useLocation();
//     const {userType} = useParams();
//     const mobile = location.state?.mobile || localStorage.getItem('mobile');
//     const enteredOtp = location.state?.enteredOtp || localStorage.getItem('enteredOtp');
//     const [technicianType, setTechnicianType] = useState('Individual');
//     const [technicianFullName, setTechnicianFullName] = useState('');
//     const [aadharNumber, setAadharNumber] = useState('');
//     const [errors] = useState({});
//     const [userName, setUserName] = useState('');
//     const [password, setPassword] = useState('');
//     const [address, setAddress] = useState('');
//     const [landmark, setLandMark] = useState('');
//     const [pincode, setPincode] = useState('');
//     // const [mobileNumber, setMobileNumber] = useState('');
//     // const [mobileOtp, setMobileOtp] = useState('');
//     const [isMobileVerified, setIsMobileVerified] = useState(false);
//     const [timer, setTimer] = useState('');
//     // const [email, setEmail] = useState('');
//     // const [emailOtp, setEmailOtp] = useState('');
//     // const [isEmailVerified, setIsEmailVerified] = useState(false);
//     // const [emailTimer, setEmailTimer] = useState('');
//     // const [altMobile, setAltMobile] = useState('');
//     // const [panNumber, setPanNumber] = useState('');
//     const [fileName, setFileName] = useState('');
//   const [technicianPhoto, setTechnicianPhoto] = useState(null);
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [selectedCategories, setSelectedCategories] = useState([]);
//   const [states, setStates] = useState([]);
//   const [selectedStateId] = useState('');
//   const [districts, setDistricts] = useState([]);
//   const dropdownRef = useRef(null);
//   const categories = ["Plumbing and Sanitary", "Electrical", "Painting", "Interior",
//      "Carpentry", "Pest Control","Electronics Appliance Repairs", "Tiles Repairs",
//      "Civil Works", "Water Proofing Works"];

//   useEffect(() => {
//     console.log(technicianPhoto);
//   }, [technicianPhoto]);
//   const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

//   const toggleCategory = (cat) => {
//     setSelectedCategories((prev) =>
//       prev.includes(cat)
//         ? prev.filter((c) => c !== cat)
//         : [...prev, cat]
//     );
//     setIsDropdownOpen(false);
//   };

// //   const getPasswordStrength = (password) => {
// //   if (!password) return '';
// //   const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{6,}$/;
// //   return strong.test(password) ? 'Strong' : password.length >= 6 ? 'Medium' : 'Weak';
// // };

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(event.target)
//       ) {
//         setIsDropdownOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     setTechnicianPhoto(file);
//     setFileName(file ? file.name : '');
//   };

//   const handleUploadClick = () => {
//     document.getElementById('fileInput').click();
//   };

//     // const generateOtpEmail = () => {
//     //     setEmailTimer('OTP sent to your email. Timer started...');
//     //   };

//     //   const validateOtpEmail = () => {
//     //     if (emailOtp.length === 6) {
//     //       setIsEmailVerified(true);
//     //     }
//     //   };

//     const generateOtpSMS = () => {
//         setTimer('OTP sent. Timer started...');
//       };

//       const validateOtpSMS = () => {
//         if (enteredOtp.length === 6) {
//           setIsMobileVerified(true);
//         }
//       };

//     const handleNameChange = (e) => {
//       const value = e.target.value;
//       if (/^[a-zA-Z ]*$/.test(value)) {
//         setTechnicianFullName(value);
//       }
//     };

//     const handleAadharChange = (e) => {
//       const value = e.target.value;
//       if (/^\d{0,12}$/.test(value)) {
//         setAadharNumber(value);
//       }
//     };

//       useEffect(() => {
//     const fetchStates = async () => {
//       try {
//         const res = await fetch('https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/MasterData/getStates');
//         const data = await res.json();
//         setStates(data);
//       } catch (err) {
//         console.error("Error fetching states:", err);
//       }
//     };
//  fetchStates();
//   }, []);

//   useEffect(() => {
//     const fetchDistricts = async () => {
//       if (!selectedStateId) return;
//       try {
//         const res = await fetch(`https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/MasterData/getDistricts?stateId=${selectedStateId}`);
//         const data = await res.json();
//         setDistricts(data);
//       } catch (err) {
//         console.error("Error fetching districts:", err);
//       }
//     };

//     fetchDistricts();
//   }, [selectedStateId]);

//     //   const handleStateChange = (e) => {
//     //     const state = e.target.value;
//     //     setSelectedState(state);

//     //     const foundState = statesData.find(s => s.state === state);
//     //     setDistricts(foundState ? foundState.districts : []);
//     //   };

//   const handleUserOnBoardingandTechnician = async (e) => {
//      e.preventDefault();

//     const payload1 = {
//           UserId: "string",
//           id: uuidv4(),
//           UserName : userName,
//           UserPassword : password,
//           MobileNo : mobile,
//           EmailId : "",
//           IsMobileNumberValidate : true,
//           IsEmailValidate : false,
//           ProfileType :  "technician",
//         };

//     try {
//       const response1 = await fetch(`https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/UserOnBoarding/UserUpload`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(payload1),
//       });

//       if (!response1.ok) {
//         throw new Error('Failed to Upload User Data.');
//       }
//       const userData = await response1.json();
//       const userId = userData.userId;

//      const payload2 = {
//           id: "",
//           Date: new Date(),
//           State: states,
//           Status: "Approved",
//           UserId: userId,
//           Address: address,
//           StateId: "1",
//           ZipCode: pincode,
//           Category: selectedCategories,
//           District: districts,
//           IsActive: true,
//           IsPending: false,
//           DistrictId: "101",
//           IsApproved: true,
//           IsRejected: false,
//           PhoneNumber : mobile,
//           AadharNumber: aadharNumber,
//           TechnicianPhotoId: fileName,
//           TechnicianFullName: technicianFullName,
//           TechnicianId : "",
//           NumberOfTechnicians  : "",
//           PhoneVerificationCode: enteredOtp,
//           EmailAddress : "",
//           EmailVerificationCode : "",
//           AlternativePhoneNumber: "",
//           GSTNumber: "",
//           Landmark: landmark,
//         };

//           const response2 = await fetch(`https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/Technician/TechnicianUpload`, {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(payload2),
//           });

//           if (!response2.ok) {
//             throw new Error('Failed to Upload User Data.');
//           }
//         //   const customerData = await response2.json();
//           alert('Technician registered successfully!');
//         //   const data = await response2.json();
//         //   alert(data);
//         //   setUserId(data.userId);
//           Navigate(`/profilePage/${userType}/${userId}`);
//         } catch (error) {
//           console.error('Registration Error:', error);
//           window.alert('Failed to Registration. Please try again later.');
//         }
//       };

//     // const handleUserOnBoardingandTechnician = async () => {
//     //     // e.preventDefault();

//     //     const payload1 = {
//     //       UserId: "string",
//     //       id: uuidv4(),
//     //       UserName : userName,
//     //       UserPassword : password,
//     //       MobileNo : mobile,
//     //       EmailId : "",
//     //       IsMobileNumberValidate : true,
//     //       IsEmailValidate : false,
//     //       ProfileType : "technician",
//     //     };

//     //     try {
//     //       const response1 = await fetch(`https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/UserOnBoarding/UserUpload`, {
//     //         method: 'POST',
//     //         headers: {
//     //           'Content-Type': 'application/json',
//     //         },
//     //         body: JSON.stringify(payload1),
//     //       });

//     //       if (!response1.ok) {
//     //         throw new Error('Failed to Upload User Data.');
//     //       }
//     //       const userData = await response1.json();
//     //       const userId = userData.userId;

//     //     const payload2 = {
//     //       id: "",
//     //       Date: new Date(),
//     //       State: states,
//     //       Status: "Open",
//     //       UserId: userId,
//     //       Address: address,
//     //       StateId: selectedStateId,
//     //       ZipCode: pincode,
//     //       Category: categories,
//     //       District: districts,
//     //       IsActive: "",
//     //       IsPending: "",
//     //       DistrictId: "districtId",
//     //       IsApproved: "True",
//     //       IsRejected: "",
//     //       PhoneNumber : mobile,
//     //       AadharNumber: aadharNumber,
//     //       TechnicianPhotoId: fileName,
//     //       TechnicianFullName: technicianFullName,
//     //       TechnicianId : "",
//     //       NumberOfTechnicians  : "",
//     //       PhoneVerificationCode: enteredOtp,
//     //       EmailAddress : "",
//     //       EmailVerificationCode : "",
//     //       AlternativePhoneNumber: "",
//     //       GSTNumber: "",
//     //       Landmark: landmark,
//     //     };

//     //       const response2 = await fetch(`https://apiqa-b5cyfzbhhah5adc9.westus2-01.azurewebsites.net/api/Technician/TechnicianUpload`, {
//     //         method: 'POST',
//     //         headers: {
//     //           'Content-Type': 'application/json',
//     //         },
//     //         body: JSON.stringify(payload2),
//     //       });

//     //       if (!response2.ok) {
//     //         throw new Error('Failed to Upload User Data.');
//     //       }
//     //     //   const customerData = await response2.json();
//     //       alert('Technician registered successfully!');
//     //     //   const data = await response2.json();
//     //     //   alert(data);
//     //     //   setUserId(data.userId);
//     //       Navigate(`/profilePage/${userType}/${564}`);
//     //     } catch (error) {
//     //       console.error('Registration Error:', error);
//     //       window.alert('Failed to Registration. Please try again later.');
//     //     }
//     //   };

//     // const handleSubmit = (e) => {
//     //   e.preventDefault();
//     //   const newErrors = {};

//     //   if (!technicianFullName.trim()) {
//     //     newErrors.technicianFullName = 'Full name is required.';
//     //   }

//     //   if (!aadharNumber.trim() || aadharNumber.length !== 12) {
//     //     newErrors.aadharNumber = 'Aadhar number must be 12 digits.';
//     //   }

//     //   setErrors(newErrors);

//     //   if (Object.keys(newErrors).length === 0) {
//     //     console.log({ technicianFullName, aadharNumber });
//     //   }
//     // };

// //   const redirectToPage = (page) => {
// //     navigate(`/${page}`);
// //   };
//     return (
//         <>
// <header class="header">
//         <img class="h-100" src={HandyMan} alt="Handy Man Logo" />
//     </header>
//     <main class="container py-3" role="main">
//         <div class="row mt-4">
//             <div class="col">
//             <div className="d-flex justify-content-center mb-3 pos_rel w-75 m-auto">
//             <div className="reg_bk gap-1"
//             //  onClick={() => redirectToPage('Register')}
//              style={{ cursor: 'pointer' }}>
//                 <span className="material-symbols-outlined">
//                 <ArrowBack />
//                 </span>
//                 Back
//             </div>
//             <div className="ur_bgimg tech_reg"></div>
//             </div>
//                 <h3 class="mb-3 text-center">Technician Profile Registration Form</h3>
//                 <div class="bg-white rounded-3 p-3 bx_sdw w-75 m-auto">
//                     <form class="d-flex gap-3 flex-column" id="formID" method="post" enctype="multipart/form-data">
//                     <div className="row d-flex gap_sm_3">
//                         <div className="col d-flex flex-row gap-3">
//                             <div>Technician</div>

//                             <div className="form-check">
//                             <input
//                                 className="form-check-input border-dark"
//                                 type="radio"
//                                 name="technicianType"
//                                 id="individual"
//                                 value="Individual"
//                                 checked={technicianType === 'Individual'}
//                                 onChange={(e) => setTechnicianType(e.target.value)}
//                             />
//                             <label className="form-check-label" htmlFor="individual">
//                                 Individual
//                             </label>
//                             </div>

//                             <div className="form-check">
//                             <input
//                                 className="form-check-input border-dark"
//                                 type="radio"
//                                 name="technicianType"
//                                 id="agency"
//                                 value="Agency"
//                                 checked={technicianType === 'Agency'}
//                                 onChange={(e) => setTechnicianType(e.target.value)}
//                             />
//                             <label className="form-check-label" htmlFor="agency">
//                                 Agency
//                             </label>
//                             </div>
//                         </div>
//                         </div>
//                         <div className="row">
//                             <div className="col-md-6">
//                             <div className="form-group">
//                                 <label htmlFor="technicianFullName">
//                                 Technician Full Name <span className="req_star">*</span>
//                                 </label>
//                                 <input
//                                 type="text"
//                                 className="form-control"
//                                 value={technicianFullName}
//                                 onChange={handleNameChange}
//                                 placeholder="Enter Technician Full Name"
//                                 />
//                                 {errors.technicianFullName && (
//                                 <span className="text-danger">{errors.technicianFullName}</span>
//                                 )}
//                             </div>
//                             </div>

//                             <div className="col-md-6">
//                             <div className="form-group">
//                                 <label htmlFor="aadharNumber">
//                                 Aadhar Number <span className="req_star">*</span>
//                                 </label>
//                                 <input
//                                 type="text"
//                                 className="form-control"
//                                 id="aadharNumber"
//                                 value={aadharNumber}
//                                 onChange={handleAadharChange}
//                                 placeholder="Enter Aadhar No"
//                                 />
//                                 {errors.aadharNumber && (
//                                 <span className="text-danger">{errors.aadharNumber}</span>
//                                 )}
//                             </div>
//                             </div>
//                         </div>

//                         <div className="row">
//                             <div className="col-md-6">
//                             <input type="hidden" value={isMobileVerified ? 'true' : 'false'} />
//                             <input type="hidden" value={'false'} />
//                             </div>
//                         </div>
//                         <div className="row">
//                         <div className="col-md-6">
//                             <div className="form-group">
//                                 <label htmlFor="mobileNumber">
//                                 Mobile Number <span className="req_star">*</span>
//                                 </label>
//                                 <div className="input-group">
//                                 <div className="input-group-prepend">
//                                     <span className="input-group-text">+91</span>
//                                 </div>
//                                 <input
//                                     type="tel"
//                                     className="form-control"
//                                     placeholder="Mobile Number"
//                                     maxLength={10}
//                                     pattern="\d{10}"
//                                     value={mobile}
//                                     // onChange={(e) => setMobileNumber(e.target.value)}
//                                     autoComplete="off"
//                                 />
//                                 <div className="input-group-append">
//                                     <button
//                                     className="btn btn-dark verify"
//                                     onClick={generateOtpSMS}
//                                     id="MobileOtpBtn"
//                                     type="button"
//                                     disabled={isMobileVerified}
//                                     >
//                                     Verify
//                                     </button>
//                                 </div>
//                                 </div>

//                                 {timer && (
//                                 <div
//                                     id="smstimer"
//                                     className="timer"
//                                     style={{
//                                     color: 'red',
//                                     fontWeight: 'bold',
//                                     marginTop: '10px',
//                                     fontSize: '14px',
//                                     }}
//                                 >
//                                     {timer}
//                                 </div>
//                                 )}
//                             </div>
//                             </div>

//                             <div className="col-md-6">
//                             <label>
//                                 Verification Code <span className="req_star">*</span>
//                             </label>
//                             <div className="input-group">
//                                 <input
//                                 type="number"
//                                 className="form-control"
//                                 placeholder="Enter Verification Code"
//                                 value={enteredOtp}
//                                 // onChange={(e) => setMobileOtp(e.target.value)}
//                                 onKeyUp={validateOtpSMS}
//                                 maxLength={6}
//                                 autoComplete="off"
//                                 />
//                                 {isMobileVerified && (
//                                 <div className="input-group-append rgt_appnd" id="divMobVerified">
//                                     <span className="input-group-text">
//                                     <span className="material-symbols-outlined text-success">verified</span>
//                                     </span>
//                                 </div>
//                                 )}
//                             </div>
//                             </div>
//                             </div>
//                         {/* <div className="row">
//                             {/* Email input and OTP trigger
//                             <div className="col-md-6">
//                                 <div className="form-group">
//                                 <label htmlFor="email">Email (Optional)</label>
//                                 <div className="input-group">
//                                     <input
//                                     type="email"
//                                     className="form-control"
//                                     placeholder="Enter Email ID"
//                                     value={email}
//                                     onChange={(e) => setEmail(e.target.value)}
//                                     id="email"
//                                     />
//                                     <div className="input-group-append rgt_appnd">
//                                     <button
//                                         className="btn-dark"
//                                         onClick={generateOtpEmail}
//                                         type="button"
//                                         id="EmailOtpBtn"
//                                     >
//                                         <span className="text-decoration-none">Verify</span>
//                                     </button>
//                                     </div>
//                                 </div>
//                                 {/* Email validation error display if needed */}
//                                 {/* <span className="text-danger"></span>
//                                 <div
//                                     id="mailtimer"
//                                     className="timer"
//                                     style={{ color: 'red', fontWeight: 'bold', marginTop: '15px' }}
//                                 >
//                                     {emailTimer}
//                                 </div>
//                                 </div>
//                             </div> */}

//                             {/* OTP Input */}
//                             {/* <div className="col-md-6">
//                                 <label htmlFor="emailOtp">Verification Code</label>
//                                 <div className="input-group">
//                                 <input
//                                     type="number"
//                                     className="form-control"
//                                     placeholder="Enter Verification Code"
//                                     value={emailOtp}
//                                     onChange={(e) => setEmailOtp(e.target.value)}
//                                     onKeyUp={validateOtpEmail}
//                                     maxLength={6}
//                                     id="emailOtp"
//                                 />
//                                 {isEmailVerified && (
//                                     <div className="input-group-append rgt_appnd" id="divMailVerified">
//                                     <span className="input-group-text">
//                                         <span className="material-symbols-outlined text-success">
//                                         verified
//                                         </span>
//                                     </span>
//                                     </div>
//                                 )}
//                                 </div>
//                                 {/* Email OTP validation error display if needed
//                                 <span className="text-danger"></span>
//                             </div>
//                             </div>
//                           */}
//                             {/* <div className="row">
//                          Alternative Mobile Number
//                         <div className="col-md-6">
//                             <label htmlFor="altMobile">Alt Mobile Number (Optional)</label>
//                             <div className="input-group">
//                             <div className="input-group-prepend lft_prep">
//                                 <span className="input-group-text" id="basic-addon1">+91</span>
//                             </div>
//                             <input
//                                 type="number"
//                                 className="form-control"
//                                 placeholder="Alt Mobile Number"
//                                 autoComplete="off"
//                                 value={altMobile}
//                                 onChange={(e) => setAltMobile(e.target.value)}
//                                 id="altMobile"
//                             />
//                             </div>
//                         </div>

//                          PAN Number
//                         <div className="col-md-6">
//                             <div className="form-group">
//                             <label htmlFor="panNumber">PAN Number (Optional)</label>
//                             <input
//                                 type="text"
//                                 className="form-control"
//                                 placeholder="Enter PAN Number"
//                                 value={panNumber}
//                                 onChange={(e) => setPanNumber(e.target.value)}
//                                 id="panNumber"
//                             />
//                             <span className="text-danger"></span> PAN validation error display if needed
//                             </div>
//                         </div>
//                         </div> */}
//                         <div className="row ">
//                         {/* <div className="col-md-6">
//                             <div className="form-group">
//                             <label>Number of Technicians (Optional)</label>
//                             <input type="number" className="form-control" placeholder="Enter Number of Technicians" />
//                             </div>
//                         </div> */}

//                         <div className="col-md-6">
//                         <div className="form-group">
//                             <label>
//                             Category <span className="req_star">*</span>
//                             </label>
//                             <div className="dropdown" ref={dropdownRef}>
//                             <button
//                                 className="btn btn-secondary dropdown-toggle"
//                                 type="button"
//                                 onClick={toggleDropdown}
//                             >
//                                 {selectedCategories.length > 0
//                                 ? selectedCategories.join(", ")
//                                 : "Choose Categories"}
//                             </button>

//                             {isDropdownOpen && (
//                                 <div className="dropdown-menu show p-2" style={{ minWidth: "100%" }}>
//                                 {categories.map((cat) => (
//                                     <div className="form-check" key={cat}>
//                                     <input
//                                         className="form-check-input border-dark"
//                                         type="checkbox"
//                                         id={cat}
//                                         value={cat}
//                                         onChange={() => toggleCategory(cat)}
//                                         checked={selectedCategories.includes(cat)}
//                                     />
//                                     <label className="form-check-label" htmlFor={cat}>
//                                         {cat}
//                                     </label>
//                                     </div>
//                                 ))}

//                                 <div className="text-end mt-2">
//                                     <button
//                                     className="btn btn-sm btn-primary"
//                                     onClick={() => setIsDropdownOpen(false)}
//                                     >
//                                     Done
//                                     </button>
//                                 </div>
//                                 </div>
//                             )}
//                             </div>
//                         </div>
//                         </div>

//                         <div className="col-md-6">
//                             <div className="form-group">
//                             <label>Technician Photo <span className="req_star">*</span></label>
//                             <div className="d-flex upld_btn_mn">
//                                 <input
//                                 type="text"
//                                 className="form-control upld_inpt"
//                                 placeholder="Technician Photo"
//                                 value={fileName}
//                                 readOnly
//                                 />
//                                 <input
//                                 type="file"
//                                 id="fileInput"
//                                 onChange={handleFileChange}
//                                 style={{ display: "none" }}
//                                 />
//                                 <button type="button" onClick={handleUploadClick} className="btn btn-dark">
//                                 Upload File
//                                 </button>
//                             </div>
//                             </div>
//                         </div>

//                         <div className="col-md-6">
//                             <div className="form-group">
//                             <label>Address <span className="req_star">*</span></label>
//                             <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="form-control" placeholder="Enter Address" />
//                             </div>
//                         </div>

//                         <div className="col-md-6">
//                             <div className="form-group">
//                             <label>Landmark <span className="req_star">*</span></label>
//                             <input type="text" value={landmark} onChange={(e) => setLandMark(e.target.value)} className="form-control" placeholder="Landmark" />
//                             </div>
//                         </div>

//                      {/* <div className="row mt-3">
//               <div className="col-md-6">
//                 <label>State <span className="req_star">*</span></label>
//                 <Field as="select" name="State" className="form-control"
//                 // onChange={(e) => {
//                 //   handleChange(e);
//                 //   handleStateChange(e.target.value);
//                 // }}
//                 >
//                   <option value="">Choose State</option>
//                   {Object.keys(states).map((state) => (
//                     <option key={state} value={state}>{state}</option>
//                   ))}
//                 </Field>
//                 <ErrorMessage name="State" component="div" className="text-danger" />
//               </div>
//               <div className="col-md-6">
//                 <label>District <span className="req_star">*</span></label>
//                 <Field as="select" name="District" className="form-control">
//                   <option value="">Choose District</option>
//                   {districts.map((district) => (
//                     <option key={district} value={district}>{district}</option>
//                   ))}
//                 </Field>
//                 <ErrorMessage name="District" component="div" className="text-danger" />
//               </div>
//             </div>  */}
//                         {/* <div className="col-md-6">
//                             <div className="form-group">
//                             <label>State <span className="req_star">*</span></label>
//                             <select className="form-control" value={selectedStateId}
//                             //  onChange={handleStateChange}
//                              >
//                                 <option value="">Choose State</option>
//                                 {states.map((s, idx) => (
//                                 <option key={idx} value={s.state}>
//                                     {s.state}
//                                 </option>
//                                 ))}
//                             </select>
//                             </div>
//                         </div>

//                         <div className="col-md-6">
//                             <div className="form-group">
//                             <label>District <span className="req_star">*</span></label>
//                             <select className="form-control">
//                                 <option value="">Choose District</option>
//                                 {districts.map((d, idx) => (
//                                 <option key={idx} value={d}>
//                                     {d}
//                                 </option>
//                                 ))}
//                             </select>
//                             </div>
//                         </div> */}

//                         <div className="col-md-6">
//                             <div className="form-group">
//                             <label>State <span className="req_star">*</span></label>
//                             <select className="form-control">
//                                 <option value="">Choose State</option>
//                                 <option>Andhra Pradesh</option>
//                                 {/* <option>Telangana</option> */}
//                             </select>
//                             </div>
//                         </div>

//                         <div className="col-md-6">
//                             <div className="form-group">
//                             <label>District <span className="req_star">*</span></label>
//                             <select className="form-control">
//                                 <option value="">Choose District</option>
//                                 <option>Visakhapatnam</option>
//                                 {/* <option>Hyderabad</option> */}
//                             </select>
//                             </div>
//                         </div>

//                         <div className="col-md-6">
//                           <div className="form-group">
//                             <label>
//                               Pincode <span className="req_star">*</span>
//                             </label>
//                             <input
//                               type="text"
//                               value={pincode}
//                               onChange={(e) => {
//                                 const value = e.target.value;
//                                         if (/^\d{0,6}$/.test(value)) {
//                                   setPincode(value);
//                                 }
//                               }}
//                               className="form-control"
//                               inputMode="numeric"
//                               maxLength="6"
//                               pattern="\d{6}"
//                               placeholder='Enter Pincode'
//                             />
//                           </div>
//                         </div>

//                         <div class="row">
//                                 <div class="col-md-6">
//                                     <div class="form-group">
//                                         <label for="registration.UserId">Create User ID <span class="req_star">*</span></label>
//                                         <input type="text" class="form-control"
//                                                value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Enter User ID" onblur="VerifyUser(this.value)" />
//                                         <span asp-validation-for="Registration.UserName" class="text-danger"></span>
//                                     </div>
//                                 </div>

//                                 <div class="col-md-6">
//                                     <div class="form-group">
//                                         <label for="registration.Password">
//                                             Create Password <span class="req_star">*</span>
//                                         </label>
//                                         <input  name="Password"
//                                             type="password"
//                                             className="form-control"
//                                             placeholder="Create Password"
//                                             value={password}
//                                             onChange={(e) => setPassword(e.target.value)}                                            />
//                                         <span asp-validation-for="Registration.Password" class="text-danger"></span>
//                                     </div>
//                                 </div>

//                                 {/* <div class="col-md-6">
//                                     <label for="registration.Password" data-toggle="tooltip" data-placement="left" title="Password should be minimum of 6 characters with one Upper case, Lower case and a Special character.">
//                                         Password <span class="req_star">*</span>
//                                     </label>
//                                     <div class="input-group">
//                                         <input type="password" class="form-control" placeholder="Enter Password" onkeyup="passwordStrengthTrigger()"
//                                                asp-for="Registration.Password" />
//                                         <div class="input-group-append rgt_appnd">
//                                             <span class="input-group-text" onclick="togglePassword('Registration_Password')">
//                                                 <span class="material-symbols-outlined" id="Registration_Password_span">
//                                                     visibility
//                                                 </span>
//                                             </span>
//                                         </div>
//                                     </div>
//                                     <div class="indicator">
//                                         <span class="weak"></span>
//                                         <span class="medium"></span>
//                                         <span class="strong"></span>
//                                         <div class="textStrength"></div>
//                                     </div>
//                                     <span asp-validation-for="Registration.Password" class="text-danger"></span>
//                                     <input type="text" asp-for="Registration.PasswordStrength" style={{display: "none"}} />
//                                     <span asp-validation-for="Registration.PasswordStrength" class="text-danger"></span>

//                                 </div> */}
//                             </div>

//                             <div class="row d-flex gap_sm_3">
//                                 <div class="d_flex">
//                                     <input type="checkbox" asp-for="Registration.Consent" />
//                                     I’ve read Service Terms & Privacy Policy
//                                 </div>
//                                 <span asp-validation-for="Registration.Consent" class="text-danger"></span>
//                             </div>
//                             {/* <div className="d-flex justify-content-center align-items-center"> */}
//                             <div className="col-md-4 text-center">
//                                 <button type="submit" className="fs-6 btn btn-dark btn-sm" onClick={handleUserOnBoardingandTechnician} >Register</button>
//                             </div>
//                             {/* </div> */}

//                         </div>
//                                 </form>
//                 </div>
//             </div>
//         </div>
//     </main>
// </>
//     );
// };

// export default TechnicianRegistration;
