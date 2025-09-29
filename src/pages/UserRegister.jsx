import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";

export default function UserRegister() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    let newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required.";
    if (!form.email.trim()) newErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Invalid email format.";
    if (!form.password) newErrors.password = "Password is required.";
    else if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      //  setting role for users
      const userData = { ...form, role: "user" };

      await axios.post(
        "https://68c7d8fb5d8d9f514733470f.mockapi.io/user",
        userData
      );
      navigate("/"); // redirect to login after successful register
    } catch (err) {
      alert("Error while registering user!");
    }
  };

  return (
    <AuthCard title="User Registration" color="border-blue-500">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-semibold">Name</label>
          <input
            name="name"
            placeholder="👤 Name"
            onChange={handleChange}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-400 outline-none"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>
        <div>
          <label className="block mb-1 text-sm font-semibold">Email</label>
          <input
            name="email"
            placeholder="📧 Email"
            onChange={handleChange}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-400 outline-none"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email}</p>
          )}
        </div>
        <div>
          <label className="block mb-1 text-sm font-semibold">Password</label>
          <input
            type="password"
            name="password"
            placeholder="🔒 Password"
            onChange={handleChange}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-400 outline-none"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password}</p>
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white p-3 rounded-xl hover:scale-[1.02] transition-transform"
        >
          Register
        </button>
      </form>
    </AuthCard>
  );
}
