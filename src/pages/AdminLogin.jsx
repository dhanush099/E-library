import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";

export default function AdminLogin({ setCurrentUser }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  // Validation Function
  const validate = () => {
    let newErrors = {};
    if (!form.email) newErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Invalid email format.";

    if (!form.password) newErrors.password = "Password is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // clear field error on change
    setLoginError(""); // clear login error
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const { data } = await axios.get(
        "https://68c7d8fb5d8d9f514733470f.mockapi.io/admin"
      );
      const admin = data.find(
        (a) => a.email === form.email && a.password === form.password
      );

      if (admin) {
        setCurrentUser({ type: "admin", ...admin });
        navigate("/admin/home");
      } else {
        setLoginError("Invalid admin credentials. Please try again.");
      }
    } catch (err) {
      setLoginError("Server error. Please try again later.");
    }
  };

  return (
    <AuthCard title="Admin Login" color="border-red-500">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Admin Email */}
        <div className="flex flex-col">
          <label
            htmlFor="email"
            className="text-sm font-medium text-gray-700 mb-1"
          >
            Admin Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            onChange={handleChange}
            placeholder="Email"
            className={`w-full border rounded-xl p-3 focus:ring-2 focus:ring-red-400 outline-none transition bg-gray-50 hover:bg-white ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Admin Password */}
        <div className="flex flex-col">
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-700 mb-1"
          >
            Admin Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            onChange={handleChange}
            placeholder="Password"
            className={`w-full border rounded-xl p-3 focus:ring-2 focus:ring-red-400 outline-none transition bg-gray-50 hover:bg-white ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* General Login Error */}
        {loginError && (
          <p className="text-red-600 text-center text-sm">{loginError}</p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white p-3 rounded-xl 
                     hover:scale-[1.02] hover:shadow-lg transition-all duration-300"
        >
          Login as Admin
        </button>
      </form>
    </AuthCard>
  );
}
