import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";

export default function UserLogin({ setCurrentUser }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showReset, setShowReset] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [newPass, setNewPass] = useState({ pass: "", confirm: "" });
  const navigate = useNavigate();

  // ✅ Login Validation
  const validate = () => {
    let newErrors = {};
    if (!form.email) newErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Invalid email format.";
    if (!form.password) newErrors.password = "Password is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ Login Logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const { data } = await axios.get(
      "https://68c7d8fb5d8d9f514733470f.mockapi.io/user"
    );
    const user = data.find(
      (u) => u.email === form.email && u.password === form.password
    );
    if (user) {
      setCurrentUser({ type: "user", ...user });
      navigate("/home");
    } else {
      alert("Invalid credentials!");
    }
  };

  // 🔑 Forgot Password Logic
  const handleResetPassword = async () => {
    if (!form.email) {
      alert("Please enter your email.");
      return;
    }

    if (resetStep === 1) {
      const { data } = await axios.get(
        "https://68c7d8fb5d8d9f514733470f.mockapi.io/user"
      );
      const user = data.find((u) => u.email === form.email);
      if (!user) {
        alert("Email not found in our records.");
        return;
      }
      setResetStep(2);
    } else if (resetStep === 2) {
      if (otp === "123456") setResetStep(3);
      else alert("Invalid OTP");
    } else if (resetStep === 3) {
      if (newPass.pass !== newPass.confirm)
        return alert("Passwords do not match");

      const { data } = await axios.get(
        "https://68c7d8fb5d8d9f514733470f.mockapi.io/user"
      );
      const user = data.find((u) => u.email === form.email);
      if (user) {
        await axios.put(
          `https://68c7d8fb5d8d9f514733470f.mockapi.io/user/${user.id}`,
          { ...user, password: newPass.pass }
        );
        alert("Password updated!");
        setShowReset(false);
        setResetStep(1);
        setOtp("");
        setNewPass({ pass: "", confirm: "" });
      }
    }
  };

  return (
    <AuthCard title="User Login" color="border-blue-500">
      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            name="email"
            placeholder="Enter your email"
            onChange={handleChange}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-400 outline-none"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            onChange={handleChange}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-400 outline-none"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* Login Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white p-3 rounded-xl hover:scale-[1.02] transition-transform"
        >
          Login
        </button>

        {/* Forgot Password */}
        <p
          onClick={() => setShowReset(true)}
          className="text-sm text-blue-600 cursor-pointer hover:underline text-center"
        >
          Forgot Password?
        </p>
      </form>

      {/* Forgot Password Section */}
      {showReset && (
        <div className="mt-5 p-4 bg-gray-100 rounded-lg shadow-md">
          <p className="text-gray-500 text-sm text-center mb-3">
            Enter your email above to receive OTP.
          </p>

          {resetStep === 1 && (
            <p className="text-gray-600 text-center">
              OTP will be sent to your email. Click below to continue.
            </p>
          )}

          {resetStep === 2 && (
            <div>
              <input
                placeholder="Enter OTP (123456)"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full border rounded-lg p-3 mb-3"
              />
              <p
                className="text-sm text-blue-600 cursor-pointer hover:underline text-right"
                onClick={() => {
                  setOtp("");
                  alert("OTP resent to your email.");
                }}
              >
                Resend OTP
              </p>
            </div>
          )}

          {resetStep === 3 && (
            <>
              <input
                type="password"
                placeholder="New Password"
                value={newPass.pass}
                className="w-full border rounded-lg p-3 mb-3"
                onChange={(e) =>
                  setNewPass({ ...newPass, pass: e.target.value })
                }
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={newPass.confirm}
                className="w-full border rounded-lg p-3 mb-3"
                onChange={(e) =>
                  setNewPass({ ...newPass, confirm: e.target.value })
                }
              />
            </>
          )}

          <button
            onClick={handleResetPassword}
            className="w-full bg-blue-500 text-white rounded-lg p-2 mt-2 hover:bg-blue-700"
          >
            {resetStep === 1
              ? "Send OTP"
              : resetStep === 2
              ? "Verify OTP"
              : "Update Password"}
          </button>
        </div>
      )}
    </AuthCard>
  );
}
