import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminHomeButton from "../components/AdminHomeButton";

export default function Profile({ currentUser, setCurrentUser }) {
  const navigate = useNavigate();

  // Pre-fill form with current user/admin data
  const [form, setForm] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    id: currentUser?.id || "",
  });

  const [passwords, setPasswords] = useState({ newPass: "", confirmPass: "" });
  const [errors, setErrors] = useState({});

  // ✅ Validation logic
  const validate = () => {
    let newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name cannot be empty";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Invalid email format";
    if (passwords.newPass && passwords.newPass.length < 6)
      newErrors.newPass = "Password must be at least 6 characters.";
    if (passwords.newPass !== passwords.confirmPass)
      newErrors.confirmPass = "Passwords do not match.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Input handler
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ Update profile logic
  const handleUpdate = async () => {
    if (!validate()) return;

    try {
      let updatedData = { ...form };
      if (passwords.newPass) updatedData.password = passwords.newPass;

      // ✅ Decide which API to call based on role
      const apiUrl =
        currentUser.role === "admin"
          ? `https://68c7d8fb5d8d9f514733470f.mockapi.io/admin/${form.id}`
          : `https://68c7d8fb5d8d9f514733470f.mockapi.io/user/${form.id}`;

      await axios.put(apiUrl, updatedData);

      // ✅ Update global state
      setCurrentUser({ ...currentUser, ...updatedData });

      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile. Please try again.");
    }
  };

  // ✅ Navigate home for user
  const handleUserHome = () => navigate("/home");

  return (
    <div className="max-w-lg mx-auto bg-white shadow-2xl p-6 rounded-2xl mt-10 space-y-6 border border-gray-100">
      {/* Header with Home Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-semibold text-gray-800">
          {currentUser.role === "admin" ? "Admin Profile" : "My Profile"}
        </h2>

        {/* ✅ Conditionally render based on role */}
        {currentUser.role === "admin" ? (
          <AdminHomeButton />
        ) : (
          <button
            onClick={handleUserHome}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white rounded-xl hover:shadow-md hover:scale-105 transition-all"
          >
            🏠 Home
          </button>
        )}
      </div>

      {/* Name Field */}
      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-700">
          Name
        </label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>

      {/* Email Field */}
      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-700">
          Email
        </label>
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>

      {/* ID Field */}
      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-700">
          ID
        </label>
        <input
          name="id"
          value={form.id}
          onChange={handleChange}
          className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          readOnly
        />
      </div>

      {/* Password Fields */}
      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-700">
          Change Password
        </label>
        <input
          type="password"
          placeholder="New Password"
          onChange={(e) =>
            setPasswords({ ...passwords, newPass: e.target.value })
          }
          className="w-full border rounded-lg p-3 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        {errors.newPass && (
          <p className="text-red-500 text-sm">{errors.newPass}</p>
        )}

        <input
          type="password"
          placeholder="Confirm Password"
          onChange={(e) =>
            setPasswords({ ...passwords, confirmPass: e.target.value })
          }
          className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        {errors.confirmPass && (
          <p className="text-red-500 text-sm">{errors.confirmPass}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleUpdate}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white p-3 rounded-lg hover:shadow-lg hover:scale-[1.02] transition-transform"
      >
        Update Profile
      </button>
    </div>
  );
}
