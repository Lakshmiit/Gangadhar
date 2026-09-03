// import Sidebar from './Sidebar';
// import { useState, useEffect } from 'react';
// import MoreVertIcon from '@mui/icons-material/Dashboard';
// import { useParams, useNavigate } from 'react-router-dom';
// import { Button } from 'react-bootstrap';
// import axios from 'axios';
// import BabyKidsImg from './img/BabyKids.jpeg';
// import FamilyPackImg from './img/FamilyPack.jpeg';
// import PersonalCareImg from './img/PersonalCare.jpeg';
// import SnacksImg from './img/Snacks.jpeg';
// import StaplesImg from './img/Staples.jpeg';
// import HouseHoldImg from './img/HouseHold.jpeg';

// const categories = [
//   { label: 'Family Pack', value: 'Beverages', image: FamilyPackImg },
//   { label: 'Staples & Grains', value: 'Staples & Grains', image: StaplesImg },
//   { label: 'Snacks & Foods', value: 'Snacks & Branded Foods', image: SnacksImg },
//   { label: 'Home Needs', value: 'Home Needs', image: HouseHoldImg },
//   { label: 'Personal Care', value: 'Personal Care', image: PersonalCareImg },
//   { label: 'Baby & Kids', value: 'Baby & Kids', image: BabyKidsImg },
// ];

// const GroceryCategoryIcons = () => {
//     const [isMobile, setIsMobile] = useState(false);
//     const [showMenu, setShowMenu] = useState(false);
//     const { selectedUserType } = useParams();
//     const {userId} = useParams();
// const {userType} = useParams();
// const [error, setError] = useState('');
//         const navigate = useNavigate();
//   const [grocery, setGrocery] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState(null);

//   useEffect(() => {
//     console.log(grocery, selectedCategory);
//   }, [grocery, selectedCategory]);
//     useEffect(() => {
//         const handleResize = () => setIsMobile(window.innerWidth <= 768);
//         handleResize();
//         window.addEventListener('resize', handleResize);
//         return () => window.removeEventListener('resize', handleResize);
//     }, []);

//     const handleCategoryClick = async (category) => {
//         const { value } = category;
//         try {
//           setSelectedCategory(category);
//           setGrocery([]);
//           setError("");

//           const encodedCategory = encodeURIComponent(value);
//           const url = `https://lmartapiv1-fxcyd2b4btacgsav.westus2-01.azurewebsites.net/api/UploadGrocery/GetGroceryItemsBycategory?Category=${encodedCategory}`;
//           const response = await axios.get(url);
//           const groceryData = response.data;

//           if (groceryData.length === 0) {
//             setError("Oops! No grocery items found for this category.");
//             console.log("No grocery items found.");
//           } else {
//             setGrocery(groceryData);
//           }

//           localStorage.setItem('encodedCategory', encodedCategory);
//           navigate(`/grocery/${userType}/${userId}`, {
//             state: encodedCategory,
//           });

//           console.log('encodedCategory:', encodedCategory);
//         } catch (error) {
//           console.error('Error fetching products:', error);
//           setGrocery([]);
//           setError(`Oops! No grocery items found for ${value} category.`);
//         }
//       };

//   return (
//     <>
//     {/* <Header /> */}
//     <div className=" text-center text-white py-3" style={{backgroundColor: "#008000"}}>
//     🛒 <b>Special Grocery Offers!</b> Fresh, Healthy & Affordable – Delivered to Your Doorstep. 🛒
//       </div>
//     <div className=" d-flex">
//         {!isMobile && (
//             <div className="ml-0 p-0 sde_mnu">
//                 <Sidebar userType={selectedUserType} />
//             </div>
//         )}
//         {isMobile && (
//             <div className="floating-menu">
//                 <Button
//                     variant="primary"
//                     className="rounded-circle shadow"
//                     onClick={() => setShowMenu(!showMenu)}
//                 >
//                     <MoreVertIcon />
//                 </Button>

//                 {showMenu && (
//                     <div className="sidebar-container">
//                         <Sidebar userType={selectedUserType} />
//                     </div>
//                 )}
//             </div>
//         )}

// <div className={`container ${isMobile ? 'w-100' : 'w-75'}`}>
//   <div className="row row-cols-3 row-cols-md-5 g-2">
//   {categories.map((cat) => (
//     <div className="col" key={cat.label} onClick={() => handleCategoryClick(cat)}>
//       <div
//         className="groceryIcon-card border-0 shadow-sm mt-2"
//         style={{
//           height: isMobile ? '110px' : '120px',
//           width: isMobile ? '110px' : '120px',
//           cursor: 'pointer',
//           padding: '10px',
//           marginTop: '5px',
//         }}
//       >
//         <img
//           src={cat.image}
//           alt={cat.label}
//           style={{
//             height: '80px',
//             width: '80px',
//             borderRadius: '8px',
//             marginTop: '2px',
//             objectFit: 'cover'
//           }}
//         />
//         <span style={{ fontSize: '12px', fontWeight: '400', marginBottom: '3px' }}>
//           {cat.label}
//         </span>
//       </div>
//     </div>
//   ))}
// </div>
//   {error && (
//   <div className="d-flex flex-row text-danger">
//     <span>{error}</span>
//   </div>
// )}
// </div>
//     </div>
//     <Button
//   type="button"
//   className="back-btn m-2"
//   onClick={() => navigate(`/profilePage/${userType}/${userId}`)}
// >
//   Back
// </Button>
//     {/* <Footer /> */}
//     </>
//   );
// };
// export default GroceryCategoryIcons;
