// Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const Navbar = ({ currentUser, handleLogout }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [dateTime, setDateTime] = useState(new Date());
  const menuRef = useRef(null);

  // Live IST Date & Time
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onLogout = () => {
    handleLogout();
    navigate("/"); // redirect to login page
  };

  // Navigate based on currentUser
  const handleLogoClick = (e) => {
    e.preventDefault();
    if (!currentUser) return navigate("/");

    if (currentUser.role === "admin") {
      navigate("/admin/home");
    } else {
      navigate("/home");
    }
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 flex justify-between items-center shadow-lg">
      {/* Logo */}
      <button
        onClick={handleLogoClick}
        className="text-2xl font-bold text-white tracking-wide hover:scale-105 transition-transform"
      >
        📚 DigitalRead
      </button>

      {/* Right Section */}
      <div className="flex items-center space-x-6">
        {/* Date & Time */}
        <div className="flex flex-col text-white text-sm text-right">
          <span className="font-semibold">
            {dateTime.toLocaleDateString("en-IN", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
              timeZone: "Asia/Kolkata",
            })}
          </span>
          <span className="text-bold opacity-90">
            {dateTime.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
              timeZone: "Asia/Kolkata",
            })}
          </span>
        </div>

        {!currentUser ? (
          <>
            <Link
              to="/"
              className="text-white hover:bg-white hover:text-purple-600 px-3 py-1 rounded-lg transition"
            >
              User Login
            </Link>
            <Link
              to="/register"
              className="text-white hover:bg-white hover:text-purple-600 px-3 py-1 rounded-lg transition"
            >
              Register
            </Link>
            <Link
              to="/admin"
              className="text-white hover:bg-white hover:text-purple-600 px-3 py-1 rounded-lg transition"
            >
              Admin Login
            </Link>
          </>
        ) : (
          <div className="relative" ref={menuRef}>
            {/* Profile Button */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center bg-white text-purple-700 font-semibold px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:bg-purple-50 transition-all"
            >
              <span className="mr-2 text-lg">👤</span>
              {currentUser.name}
              <span className="ml-2 transform transition-transform duration-200">
                {showMenu ? "▲" : "▼"}
              </span>
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 mt-3 bg-white rounded-xl shadow-xl w-52 border border-gray-100 animate-fadeIn">
                <Link
                  to="/profile"
                  onClick={() => setShowMenu(false)}
                  className="block px-4 py-2 hover:bg-purple-100 rounded-t-xl transition"
                >
                  My Profile
                </Link>
                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 hover:bg-red-100 text-red-600 rounded-b-xl transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
