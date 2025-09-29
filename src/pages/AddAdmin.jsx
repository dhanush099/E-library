import { useState } from "react";
import AdminHomeButton from "../components/AdminHomeButton";

export default function AddAdmin() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const API_URL = "https://68c7d8fb5d8d9f514733470f.mockapi.io/admin";

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form validation
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required!");
      setSuccess(null);
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role: "admin", // adding role
        }),
      });

      if (!response.ok) throw new Error("Failed to add admin");

      setSuccess("✅ Admin added successfully!");
      setError(null);
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError("❌ Could not add admin. Please try again.");
      setSuccess(null);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-xl rounded-xl p-6 mt-6 border border-red-300">
      <h2 className="text-2xl font-bold text-red-600 mb-4 text-center">
        Add New Admin
      </h2>

      {/* Success / Error Messages */}
      {success && <p className="text-green-600 text-center">{success}</p>}
      {error && <p className="text-red-600 text-center">{error}</p>}

      <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
        {/* Name */}
        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Admin Name
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
            placeholder="Enter admin name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Admin Email
          </label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
            placeholder="Enter admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-2 rounded-lg shadow hover:scale-105 transition-transform duration-200"
        >
          Add Admin
        </button>
      </form>

      {/* Admin Home Button */}
      <div className="mt-4">
        <AdminHomeButton />
      </div>
    </div>
  );
}
