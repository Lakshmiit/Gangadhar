import React, { useState, useEffect, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Header from "./Header.js";
import Footer from "./Footer.js";

const AddressPage = () => {
  const navigate = useNavigate();
  const { userType, userId } = useParams();
  const [stateId, setStateId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressData, setAddressData] = useState(null);
  const [districtList, setDistrictList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    mobileNumber: "",
    address: "",
    state: "",
    district: "",
    zipCode: "",
  });

  useEffect(() => {
    console.log(state, district);
  }, [state, district]);

  const PINCODE_LIST = [
    "530001",
    "530002",
    "530003",
    "530004",
    "530005",
    "530013",
    "530016",
    "530020",
    "530024",
    "530022",
    "530017",
    "530007",
    "530008",
    "530009",
    "530012",
    "530018",
    "530011",
    "530031",
    "530029",
    "530026",
    "530032",
    "530049",
    "530027",
    "530028",
    "530040",
    "530014",
    "530041",
    "530043",
    "530045",
    "530048",
    "531162",
    "531163",
    "531173",
  ];
  const [pincodeOptions] = useState(PINCODE_LIST);
  const [showManualPincode, setShowManualPincode] = useState(false);
  const [manualPincode, setManualPincode] = useState("");

  const hasAddress = Boolean(
    addressData?.address &&
    addressData?.district &&
    addressData?.state &&
    addressData?.zipCode,
  );
  const isFormValid = Boolean(
    addressForm.fullName.trim() &&
    addressForm.address.trim() &&
    addressForm.zipCode.trim() &&
    addressForm.state.trim() &&
    addressForm.district.trim(),
  );

  const fetchAddressData = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await axios.get(
        `https://localhost:7091/api/Address/GetAddressById/${userId}`,
      );
      const data = Array.isArray(response.data)
        ? response.data[0]
        : response.data;
      if (data) {
        setAddressData(data);
        setAddressForm({
          fullName: (data.fullName || "").trim(),
          mobileNumber: data.mobileNumber || "",
          address: data.address || "",
          state: data.state || "",
          district: data.district || "",
          zipCode: data.zipCode || "",
        });
        setStateId(data.stateId ? String(data.stateId) : "");
        setDistrictId(data.districtId ? String(data.districtId) : "");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  }, [userId]);

  useEffect(() => {
    fetchAddressData();
  }, [fetchAddressData]);

  useEffect(() => {
    if (addressForm.state) {
      setStateId(stateId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressForm.state]);

  useEffect(() => {
    if (addressForm.district) {
      setDistrictId(districtId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressForm.district]);

  useEffect(() => {
    axios
      .get(`https://localhost:7091/api/MasterData/getStates`)
      .then((response) => setStateList(response.data))
      .catch((error) => console.error("Error fetching states:", error));
  }, []);

  useEffect(() => {
    if (stateId) {
      axios
        .get(`https://localhost:7091/api/MasterData/getDistricts/${stateId}`)
        .then((response) => setDistrictList(response.data))
        .catch((error) => console.error("Error fetching districts:", error));
    } else {
      setDistrictList([]);
    }
  }, [stateId]);

  useEffect(() => {
    if (addressForm.state && stateList.length) {
      const matched = stateList.find(
        (s) => s.StateName?.toLowerCase() === addressForm.state.toLowerCase(),
      );
      if (matched) setStateId(String(matched.StateId));
    }
  }, [addressForm.state, stateList]);

  useEffect(() => {
    if (addressForm.district && districtList.length) {
      const matched = districtList.find(
        (d) =>
          d.districtName?.toLowerCase() === addressForm.district.toLowerCase(),
      );
      if (matched) setDistrictId(String(matched.districtId));
    }
  }, [addressForm.district, districtList]);

  //  const handleStateChange = (e) => {
  //   const selectedId = e.target.value;
  //   setStateId(selectedId);
  //   setDistrictId("");
  //   setAddressForm((p) => ({
  //     ...p,
  //     state: selectedId ? stateId : "",
  //     district: "",
  //   }));
  // };

  // const handleDistrictChange = (e) => {
  //   const selectedId = e.target.value;
  //   setDistrictId(selectedId);
  //   setAddressForm((p) => ({
  //     ...p,
  //     district: selectedId ? DISTRICT_NAME : "",
  //   }));
  // };

  const handlePincodeSelect = (e) => {
    const value = e.target.value;
    if (value === "others") {
      setShowManualPincode(true);
      setManualPincode("");
      setAddressForm((p) => ({ ...p, zipCode: "" }));
    } else {
      setShowManualPincode(false);
      setAddressForm((p) => ({ ...p, zipCode: value }));
    }
  };

  const handleManualPincodeChange = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 6);
    setManualPincode(v);
    setAddressForm((p) => ({ ...p, zipCode: v }));
  };

  const handleSaveAddress = async () => {
    const { fullName, mobileNumber, address, state, district, zipCode } =
      addressForm;

    if (!fullName || !address || !zipCode || !state || !district) {
      alert("Please fill in all required fields.");
      return;
    }
    if (fullName.trim().toLowerCase() === "guest") {
      alert("Please remove Guest and enter your full name.");
      return;
    }
    if (!/^\d{6}$/.test(zipCode)) {
      alert("Pincode must be exactly 6 digits.");
      return;
    }

    const payload3 = {
      id: addressData.id,
      profileType: "profileType",
      addressId: addressData.addressId,
      isPrimaryAddress: true,
      address: address,
      state: state,
      district: district,
      StateId: stateId,
      DistrictId: districtId,
      zipCode: zipCode,
      mobileNumber: mobileNumber,
      emailAddress: "emailAddress",
      userId: userId,
      firstName: fullName,
      lastName: "lastName",
      fullName: fullName,
      walletAmount: "0",
    };

    try {
      setSavingAddress(true);
      const response = await fetch(
        `https://localhost:7091/api/Customer/CustomerAddressEdit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload3),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error Response:", errorText);
        throw new Error("Failed to edit address.");
      }

      await fetchAddressData();
      alert("Address Updated Successfully!");
      navigate(`/profilePage/${userType}/${userId}`);
    } catch (err) {
      console.error("Error saving address:", err);
      alert("Failed to save address. Please try again.");
    } finally {
      setSavingAddress(false);
    }
  };

  return (
    <>
      <Header />
      <div
        className="container py-3"
        style={{ maxWidth: "600px", marginTop: "100px" }}
      >
        <div className="d-flex align-items-center mb-1">
          <ArrowBackIcon
            style={{ cursor: "pointer", marginRight: "10px" }}
            onClick={() => navigate(`/loginnew`)}
          />
          <h5 className="fw-bold mb-0 d-flex align-items-center">
            <LocationOnIcon className="me-1" style={{ color: "#008000" }} />
            {hasAddress ? "Edit Address" : "Add Your Delivery Address"}
          </h5>
        </div>

        <div className="shadow-sm rounded-4 p-3 bg-white">
          {!hasAddress && (
            <p className="text-danger small mb-2">
              Please add your address to continue using the app.
            </p>
          )}
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>
                Full Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={addressForm.fullName}
                onChange={(e) =>
                  setAddressForm((p) => ({ ...p, fullName: e.target.value }))
                }
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>
                Address <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="House no, street, area"
                value={addressForm.address}
                onChange={(e) =>
                  setAddressForm((p) => ({ ...p, address: e.target.value }))
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                State <span className="req_star">*</span>
              </Form.Label>
              <Form.Select
                value={stateId || ""}
                onChange={(e) => {
                  const selectedId = e.target.value;

                  setStateId(selectedId);
                  setDistrictId("");

                  const selectedState = stateList.find(
                    (s) => s?.StateId?.toString() === selectedId,
                  );

                  if (selectedState) {
                    const selectedStateName = selectedState.StateName;

                    setState(selectedStateName);

                    setAddressForm((p) => ({
                      ...p,
                      state: selectedStateName,
                      district: "",
                      zipCode: "",
                    }));

                    setShowManualPincode(false);
                    setManualPincode("");
                  }
                }}
                required
              >
                <option value="">Select State</option>
                {Array.isArray(stateList) &&
                  stateList
                    .filter((s) => s && s.StateId && s.StateName)
                    .map((s) => (
                      <option key={s.StateId} value={s.StateId.toString()}>
                        {s.StateName}
                      </option>
                    ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                District <span className="req_star">*</span>
              </Form.Label>
              <Form.Select
                value={districtId || ""}
                onChange={(e) => {
                  const selectedId = e.target.value;

                  setDistrictId(selectedId);

                  const selectedDistrict = districtList.find(
                    (d) => d.districtId.toString() === selectedId,
                  );

                  if (selectedDistrict) {
                    const selectedDistrictName = selectedDistrict.districtName;

                    setDistrict(selectedDistrictName);

                    setAddressForm((p) => ({
                      ...p,
                      district: selectedDistrictName,
                      zipCode: "",
                    }));

                    if (
                      selectedDistrictName.trim().toLowerCase() ===
                      "visakhapatnam"
                    ) {
                      // Visakhapatnam → pincode dropdown
                      setShowManualPincode(false);
                      setManualPincode("");
                    } else {
                      // Other districts → manual pincode only
                      setShowManualPincode(true);
                      setManualPincode("");
                    }
                  }
                }}
                required
              >
                <option value="">Select District</option>
                {districtList.map((d) => (
                  <option key={d.districtId} value={d.districtId.toString()}>
                    {d.districtName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            {/* {isNonServiceableDistrict && (
                    <div className="text-danger small mt-1">
                      Service available in only <strong>Visakhapatnam</strong> location.
                    </div>    
                  )} */}

            <div className="row">
              <div className="col-6">
                <Form.Group className="mb-2">
                  <Form.Label>
                    Mobile Number <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={addressForm.mobileNumber}
                    readOnly
                  />
                </Form.Group>
              </div>
              <div className="col-6">
                <Form.Group className="mb-3">
                  <Form.Label>
                    Pincode <span className="text-danger">*</span>
                  </Form.Label>

                  {showManualPincode ? (
                    <Form.Control
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit pincode"
                      value={manualPincode}
                      onChange={handleManualPincodeChange}
                    />
                  ) : (
                    <Form.Select
                      value={
                        pincodeOptions.includes(addressForm.zipCode)
                          ? addressForm.zipCode
                          : ""
                      }
                      onChange={handlePincodeSelect}
                    >
                      <option value="">Select Pincode</option>

                      {pincodeOptions.map((pin) => (
                        <option key={pin} value={pin}>
                          {pin}
                        </option>
                      ))}

                      <option value="others">Others (Enter Manually)</option>
                    </Form.Select>
                  )}
                </Form.Group>
              </div>
            </div>
            <Button
              style={{ backgroundColor: "#008000", borderColor: "#008000" }}
              onClick={handleSaveAddress}
              disabled={savingAddress || !isFormValid}
            >
              {savingAddress ? "Saving..." : "Save & Continue"}
            </Button>
          </Form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AddressPage;
