// import React, { useEffect, useState } from 'react';
// import { Formik, Form, Field, ErrorMessage } from 'formik';
// import * as Yup from 'yup';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import './App.css';
// import HandyMan from './img/Hm_Logo 1.png';
// import { useLocation } from 'react-router-dom';
// import TermsandConditions from './TermsandConditions.js';
// import { v4 as uuidv4 } from 'uuid';

// const validationSchema = Yup.object({
//   FirstName: Yup.string().required('Required'),
//   Address: Yup.string().required('Required'),
//   LandMark: Yup.string().required('Required'),
//   State: Yup.string().required('Required'),
//   District: Yup.string().required('Required'),
//   ZipCode: Yup.string().matches(/^\d{6}$/, 'Invalid pincode').required('Required'),
//   Consent: Yup.bool().oneOf([true], 'Consent required'),
// });

// const getPasswordStrength = (password) => {
//   if (!password) return '';
//   const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{6,}$/;
//   return strong.test(password) ? 'Strong' : password.length >= 6 ? 'Medium' : 'Weak';
// };

// const CustomerRegistrationForm = () => {
//   const location = useLocation();
//   const mobile = location.state?.mobile || localStorage.getItem('mobile');
//   const enteredOtp = location.state?.enteredOtp || localStorage.getItem('enteredOtp');
//   const [mobileVerified, setMobileVerified] = useState(false);
//    const [states, setStates] = useState([]);
//   const [districts, setDistricts] = useState([]);
//    const [selectedStateId, setSelectedStateId] = useState(null);
//    const [districtId, setDistrictId] = useState('');

// useEffect(() => {
//   console.log(  states, districts);
// }, [  states, districts]);

//   const handleVerifyOTP = (code) => {
//     if (code === enteredOtp) {
//       setMobileVerified(true);
//     }
//   };

//   useEffect(() => {
//     const fetchStates = async () => {
//       try {
//         const res = await fetch('https://localhost:7091/api/MasterData/getStates');
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
//         const res = await fetch(`https://localhost:7091/api/MasterData/getDistricts?stateId=${selectedStateId}`);
//         const data = await res.json();
//         setDistricts(data);
//       } catch (err) {
//         console.error("Error fetching districts:", err);
//       }
//     };

//     fetchDistricts();
//   }, [selectedStateId]);

//   const initialValues = {
//     FirstName: '',
//     MobileNumber: '',
//     MobileVerificationCode: '',
//     AlternativeMobileNumber: '',
//     Address: '',
//     LandMark: '',
//     State: '',
//     District: '',
//     ZipCode: '',
//     UserName: '',
//     Password: '',
//     PasswordStrength: '',
//     Consent: false,
//   };

//   const handleUserOnBoardingandCustomer = async (values, actions) => {

//     const payload1 = {
//       UserId: "",
//       id: uuidv4(),
//       UserName : values.UserName || "",
//       UserPassword : values.Password || "",
//       MobileNo : mobile,
//       EmailId : "",
//       IsMobileNumberValidate : true,
//       IsEmailValidate : false,
//       ProfileType : "customer",
//     };

//     try {
//       const response1 = await fetch(`https://localhost:7091/api/UserOnBoarding/UserUpload`, {
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

//     const payload2 = {
//       CustomerId : "",
//       id: "",
//       FirstName: values.FirstName,
//       LastName  : "",
//       MobileNo : mobile,
//       MobileVerificationCode: enteredOtp,
//       EmailAddress : "",
//       EmailVerificationCode : "",
//       AlternativeMobileNumber: values.AlternativeMobileNumber,
//       GSTNumber: "",
//       Address: values.Address,
//       Landmark: values.LandMark,
//       State: values.State,
//       StateId: selectedStateId,
//       District: values.District,
//       DistrictId: districtId,
//       ZipCode: values.ZipCode,
//       CustomerPhotoId: "",
//       UserId: userId,
//       IsApproved: "True",
//       Status: "Open",
//     };

//       const response2 = await fetch(`https://localhost:7091/api/Customer/CustomerUpload`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(payload2),
//       });

//       if (!response2.ok) {
//         throw new Error('Failed to Upload User Data.');
//       }
//       const customerData = await response2.json();
//       alert('Customer registered successfully!');
//     } catch (error) {
//       console.error('Registration Error:', error);
//       window.alert('Failed to Registration. Please try again later.');
//     }
//   };

//   return (
//     <>
//     <header class="header">
//         <img class="h-100" src={HandyMan} alt="Handy Man Logo" />
//     </header>
//     <div class="d-flex justify-content-center mb-3 pos_rel w-75 m-auto">
//         <div class="ur_bgimg cust_reg">
//         </div>
//     </div>
//     <div className="container py-3">
//         <h3 className='text-center'>Customer Registration Form</h3>
//       <Formik
//         initialValues={initialValues}
//         validationSchema={validationSchema}
//         onSubmit={(values, actions) => handleUserOnBoardingandCustomer(values, actions)}
//       >
//         {({ values, handleChange, setFieldValue }) => (
//           <Form className="bg-white p-4 rounded shadow">
//             <div className="row">
//               <div className="col-md-6">
//                 <label>Full Name <span className="req_star">*</span></label>
//                 <Field name="FirstName" className="form-control" placeholder="Enter Full Name"/>
//                 <ErrorMessage name="FirstName" component="div" className="text-danger" />
//               </div>
//               <div className="col-md-6">
//                 <label>Alt Mobile Number (Optional)</label>
//                 <Field
//                 name="AlternativeMobileNumber"
//                 type="text"
//                 className="form-control"
//                 placeholder="Alternative Mobile Number (Optional)"
//                 maxLength="10"
//                 pattern="\d{0,10}"
//                 onInput={(e) => {
//                   e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
//                 }}
//               />
//               </div>
//             </div>

//             <div className="row mt-3">
//               <div className="col-md-6">
//                 <label>Mobile Number <span className="req_star">*</span></label>
//                  <div className="form-group">
//               <div className="input-group">
//                 <div className="input-group-prepend">
//                   <span className="input-group-text">+91</span>
//                 </div>
//                 <Field
//                   name="MobileNumber"
//                   className="form-control"
//                   placeholder="Enter Mobile Number"
//                   maxLength="10"
//                   value={mobile}
//                 />
//               </div>
//             </div>

//                 <ErrorMessage name="MobileNumber" component="div" className="text-danger" />
//               </div>
//               <div className="col-md-6">
//                 <label>Verification Code <span className="req_star">*</span></label>
//                 <div className="input-group">
//                   <Field
//                     name="MobileVerificationCode"
//                     className="form-control"
//                     value={enteredOtp}
//                     onBlur={() => handleVerifyOTP(values.MobileVerificationCode)}
//                   />
//                   {mobileVerified && (
//                     <span className="input-group-text text-success">✔️</span>
//                   )}
//                 </div>
//                 <ErrorMessage name="MobileVerificationCode" component="div" className="text-danger" />
//               </div>
//             </div>
//             <div className="row mt-3">
//               <div className="col-md-6">
//                 <label>Address <span className="req_star">*</span></label>
//                 <Field name="Address" className="form-control" placeholder="Address" />
//                 <ErrorMessage name="Address" component="div" className="text-danger" />
//               </div>
//               <div className="col-md-6">
//                 <label>Landmark <span className="req_star">*</span></label>
//                 <Field name="LandMark" className="form-control" placeholder="Enter Landmark" />
//                 <ErrorMessage name="LandMark" component="div" className="text-danger" />
//               </div>
//             </div>
//              {/* State */}
//            <div className="row">
//             <div className="col-md-6 form-group">
//             <label>State <span className="text-danger">*</span></label>
//             <Field
//               as="select"
//               name="State"
//               className="form-control"
//               onChange={(e) => {
//                 handleChange(e);
//                 const selectedId = parseInt(e.target.value);
//                 setSelectedStateId(selectedId);
//               }}
//             >
//               <option value="">Choose State</option>
//               <option value="Andhra Pradesh">Andhra Pradesh</option>
//               </Field>
//             </div>

//           {/* District */}
//           <div className="col-md-6 form-group">
//             <label>District <span className="text-danger">*</span></label>
//             <Field as="select" name="District" className="form-control" >
//               <option value="">Choose District</option>
//               <option value="Visakhapatnam">Visakhapatnam</option>
//             </Field>
//           </div>
//          </div>

//             <div className="row mt-3">
//               <div className="col-md-6">
//                 <label>Pincode <span className="req_star">*</span></label>
//                 <Field name="ZipCode">
//                 {({ field, form }) => (
//                   <input
//                     {...field}
//                     type="text"
//                     className="form-control"
//                     placeholder="Enter Pincode"
//                     maxLength="6"
//                     onChange={(e) => {
//                       const value = e.target.value;
//                       if (/^\d{0,6}$/.test(value)) {
//                         form.setFieldValue("ZipCode", value);
//                       }
//                     }}
//                   />
//                 )}
//               </Field>
//               <ErrorMessage name="ZipCode" component="div" className="text-danger" />
//               </div>
//             </div>

//             <div className="row mt-3">
//               <div className="col-md-6">
//                 <label>User ID <span className="req_star">*</span></label>
//                 <Field name="UserName" className="form-control" placeholder="Create User ID"/>
//                 <ErrorMessage name="UserName" component="div" className="text-danger" />
//               </div>
//               <div className="col-md-6">
//                 <label>Password <span className="req_star">*</span></label>
//                 <Field
//                   name="Password"
//                   type="password"
//                   className="form-control"
//                   placeholder="Create Password"
//                   onKeyUp={(e) => setFieldValue('PasswordStrength', getPasswordStrength(e.target.value))}
//                 />
//                 <ErrorMessage name="Password" component="div" className="text-danger" />
//                 <div className="mt-1">
//                   <small>Password Strength: {values.PasswordStrength}</small>
//                 </div>
//               </div>
//             </div>

//             <div className="row mt-3">
//               <div className="col">
//                 <label>
//                   <TermsandConditions />
//                  </label>
//                 <ErrorMessage name="Consent" component="div" className="text-danger" />
//               </div>
//             </div>
//             <div className="d-flex justify-content-center align-items-center">
//             <div className="col-md-4 text-center">
//                 <button type="submit" onClick={handleUserOnBoardingandCustomer} className="btn btn-dark">Register</button>
//             </div>
//           </div>
//           </Form>
//         )}
//       </Formik>
//     </div>
//     </>
//   );
// };

// export default CustomerRegistrationForm;
