import React, {useState, useEffect} from 'react';
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from './Sidebar';
import { Dashboard as MoreVertIcon,} from '@mui/icons-material';
import {  Button } from 'react-bootstrap'; 
import { useParams } from 'react-router-dom';

const AddTechnician = ({onClose, onSubmit}) => {
    const [isMobile, setIsMobile] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const {selectedUserType} = useParams();
    const [ name, setName ] = useState(""); 
    const [ emailAddress, setEmailAddress ] = useState("");
    const [ phoneNumber, setPhoneNumber ] = useState("");
    const [ address, setAddress] = useState("")
    const [ state, setState] = useState("");
    const [ district, setDistrict] = useState("");
    const [ pincode, setPincode ] = useState("");
    const [landmark, setLandmark ] = useState("");
    const [ aadhaarNumber, setAadhaarNumber ] = useState("");
    const [ category, setCategory ] = useState("category 1");

    const handleSubmit = (e) => {
        e.preventDefault();
        const newTechnician = {
            name, 
            emailAddress,
            phoneNumber,
            address:"",
            state,
            district,
            pincode,
            landmark,
            aadhaarNumber,
            category,
        };
        onSubmit(newTechnician);
    };

     // Detect screen size for responsiveness
        useEffect(() => {
            const handleResize = () => setIsMobile(window.innerWidth <= 768);
            handleResize(); // Set initial state
            window.addEventListener('resize', handleResize);        
            return () => window.removeEventListener('resize', handleResize);
        }, []);

    return (

    <div className="d-flex flex-row justify-content-start align-items-start m-2">
        {/* Sidebar menu for Larger Screens */}
      {!isMobile && (
        <div className=" ml-0 m-4 p-0 sde_mnu">
          <Sidebar userType={selectedUserType} />
        </div>
      )}

      {/* Floating menu for mobile */}
      {isMobile && (
        <div className="floating-menu">
          <Button
            variant="primary"
            className="rounded-circle shadow"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertIcon />
          </Button>

          {showMenu && (
              <div className="sidebar-container">
                <Sidebar userType={selectedUserType} />
              </div>
          )}
        </div>
      )}
         <div className={`container m-3 ${isMobile ? 'w-100' : 'w-75'}`}>
            <div className="bg-white rounded-3 bx_sdw w-50 m-4">
                <div className="bg-warning d-flex justify-content-between align-items-center py-2 px-3 rounded-top">
                    <h4 className="m-0">Add Technician</h4>
                    <span className="text-secondary fs-2"
                    onClick={onClose}
                    style={{ cursor: "pointer"}}
                    >
                        &times;
                    </span>
                </div>
                <div className="bg-white p-1 rounded-bottom">
                    <form onSubmit={handleSubmit}>
                        {/* Name */}
                        <div className="mb-3">
                            <label>Name<span className="req_star">*</span></label>
                            <input
                            type="text"
                            className="form-control"
                            placeholder="Enter your Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        {/* Email Address */}
                        <div className="mb-3">
                            <label>Email Address<span className="req_star">*</span></label>
                            <input
                            type="email"
                            className="form-control"
                            placeholder="Enter your email address"
                            value={emailAddress}
                            onChange={(e) => setEmailAddress(e.target.value)}
                            />
                        </div>
                        {/* Phone Number */}
                        <div className="mb-3">
                            <label>Phone Number<span className="req_star">*</span></label>
                            <input
                            type="number"
                            className="form-control"
                            placeholder="Enter your phone Number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                        </div>
                        {/* Address */}
                        <div className="form-control">
                            <label>Address<span className="req_star">*</span></label>
                            <input
                            type="text"
                            className="form-control"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            /> 
                        </div>
                        {/* State */}
                        <div className="form-control">
                            <label>State<span className="req_star">*</span></label>
                            <select
                            type="text"
                            className="form-select"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            >
                                <option>State 1</option>
                                <option>State 2</option>
                            </select>
                        </div>
                        {/* District */}
                        <div className="form-control">
                            <label>District<span className="req_star">*</span></label>
                            <select
                            type="text"
                            className="form-control"
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            >
                                <option>District 1</option>
                                <option>District 2</option>
                            </select>
                        </div>
                        {/* Pincode */}
                        <div className="form-control">
                            <label>Pincode<span className="req_star">*</span></label>
                            <input
                            type="text"
                            className="form-control"
                            placeholder="Enter your Pincode"
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value)}
                            />
                        </div>
                        {/* Landmark */}
                        <div className="form-control">
                            <label>Landmark<span className="req_star">*</span></label>
                            <input
                            type="text"
                            className="form-control"
                            placeholder="Enter your Landmark"
                            value={landmark}
                            onChange={(e) => setLandmark(e.target.value)}
                            />
                        </div>
                        {/* Aadhaar Number */}
                        <div className="mb-3">
                            <label>Aadhaar Number<span className="req_star">*</span></label>
                            <input 
                                type="number"
                                className="form-control"
                                placeholder="Enter your Aadhaar Number"
                                value={aadhaarNumber}
                                onChange={(e) => setAadhaarNumber(e.target.value)}
                            />
                        </div>
                        {/* Category */}
                        <div className="form-control">
                            <label>Category<span className="req_star">*</span></label>
                            <select
                            className="form-select"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            >
                                <option>Category 1</option>
                                <option>Category 2</option>
                                <option>Category 3</option>
                                <option>Category 4</option>
                                <option>Category 5</option>
                            </select>
                        </div>
                        {/* Close and Submit Button */}
                        <div className="d-flex gap-2">
                            <button type="button"
                            className="text-dark btn btn-light w-50"
                            onClick={onClose}
                            >
                                Close
                            </button>
                            <button 
                            type="submit"
                            className="text-dark btn btn-warning w-50">
                                Submit
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        {/* Styles for floating menu */}
<style jsx>{`
        .floating-menu {
          position: fixed;
          top: 80px; /* Increased from 20px to avoid overlapping with the logo */
          left: 20px; /* Adjusted for placement on the left side */
          z-index: 1000;
        }
        .menu-popup {
          position: absolute;
          top: 50px; /* Keeps the popup aligned below the floating menu */
          left: 0; /* Aligns the popup to the left */
          background: white;
          border: 1px solid #ddd;
          border-radius: 5px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          width: 200px;
        }
        .menu-item {
          padding: 10px;
          border-bottom: 1px solid #ddd;
          display: flex;
          align-items: center;
          justify-content: flex-start;
        }
        .menu-item:last-child {
          border-bottom: none;
        }
      `}</style>

    
    </div>
    );
};

export default AddTechnician;