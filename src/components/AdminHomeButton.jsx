import { useNavigate } from "react-router-dom";

function AdminHomeButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/admin/home")}
      className="mt-6 bg-gray-800 text-white px-5 py-2 rounded-xl shadow-md hover:bg-gray-900 transition"
    >
      ← Back to Admin Home
    </button>
  );
}

export default AdminHomeButton;
