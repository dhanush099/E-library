import { useNavigate } from "react-router-dom";

function AdminHome() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Add Admin",
      description: "Create a new admin account",
      icon: "👨‍💻",
      gradient: "from-pink-500 to-rose-500",
      onClick: () => navigate("/admin/add-admin"),
    },
    {
      title: "Manage Books",
      description: "Add, view, or delete books",
      icon: "📚",
      gradient: "from-indigo-500 to-blue-500",
      onClick: () => navigate("/admin/manage-books"),
    },
    {
      title: "Requests",
      description: "Approve or reject user borrow requests",
      icon: "✅",
      gradient: "from-green-500 to-emerald-500",
      onClick: () => navigate("/admin/requests"),
    },
    {
      title: "Reports",
      description: "View statistics & most borrowed books",
      icon: "📊",
      gradient: "from-orange-500 to-yellow-500",
      onClick: () => navigate("/admin/reports"),
    },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-extrabold text-center mb-8 text-gray-800">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            onClick={card.onClick}
            className={`cursor-pointer bg-gradient-to-r ${card.gradient} rounded-2xl shadow-xl p-6 transform hover:scale-105 hover:shadow-2xl transition-all duration-300`}
          >
            {/* Icon */}
            <div className="text-4xl mb-3">{card.icon}</div>

            {/* Title & Description */}
            <h2 className="text-2xl font-bold text-white mb-1">{card.title}</h2>
            <p className="text-white/90 text-sm">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminHome;
