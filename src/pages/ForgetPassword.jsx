import { useState } from "react";
import axios from "axios";

export default function ForgetPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleEmailSubmit = () => {
    if (!email) return alert("Enter email!");
    alert(`OTP sent to ${email} (Use 123456)`);
    setStep(2);
  };

  const handleOTPSubmit = async () => {
    if (otp !== "123456") return alert("Invalid OTP!");
    if (newPassword !== confirmPassword)
      return alert("Passwords do not match!");
    const { data } = await axios.get(
      "https://68c7d8fb5d8d9f514733470f.mockapi.io/user"
    );
    const user = data.find((u) => u.email === email);
    if (!user) return alert("User not found!");
    await axios.put(
      `https://68c7d8fb5d8d9f514733470f.mockapi.io/user/${user.id}`,
      { ...user, password: newPassword }
    );
    alert("Password updated! Please login again.");
    window.location.href = "/";
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh] bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          🔑 Reset Password
        </h2>

        {step === 1 && (
          <div className="space-y-4">
            <input
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-3 rounded-xl"
            />
            <button
              onClick={handleEmailSubmit}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white p-3 rounded-xl hover:scale-[1.02] transition"
            >
              Send OTP
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border p-3 rounded-xl"
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border p-3 rounded-xl"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border p-3 rounded-xl"
            />
            <button
              onClick={handleOTPSubmit}
              className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white p-3 rounded-xl hover:scale-[1.02] transition"
            >
              Update Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
