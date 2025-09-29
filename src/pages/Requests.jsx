import { useEffect, useState } from "react";
import axios from "axios";
import AdminHomeButton from "../components/AdminHomeButton";

const REQUESTS_API = "https://68cadc55430c4476c34b39e7.mockapi.io/request";
const USERS_API = "https://68c7d8fb5d8d9f514733470f.mockapi.io/user";

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchRequests();
    fetchUsers();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(REQUESTS_API);
      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(USERS_API);
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : "Unknown User";
  };

  const handleAction = async (id, status) => {
    try {
      const payload = { status };
      if (status === "accepted") {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7); // add 7 days from today
        payload.dueDate = dueDate.toISOString();
      }
      await axios.put(`${REQUESTS_API}/${id}`, payload);
      fetchRequests();
    } catch (err) {
      console.error("Error updating request:", err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-6 space-y-6 px-4">
      {/* Heading + Admin Home Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">📋 Borrow Requests</h2>
        <AdminHomeButton />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-xl border border-gray-100">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left text-gray-700">📖 Book Name</th>
              <th className="p-3 text-left text-gray-700">👤 Name</th>
              <th className="p-3 text-left text-gray-700">📅 Status</th>
              <th className="p-3 text-center text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length > 0 ? (
              requests.map((req) => (
                <tr key={req.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{req.bookName}</td>
                  <td className="p-3">{getUserName(req.userId)}</td>
                  <td className="p-3 font-semibold">
                    {req.status === "pending" && (
                      <span className="text-yellow-600">⏳ Pending</span>
                    )}
                    {req.status === "accepted" && (
                      <span className="text-green-600">✅ Accepted</span>
                    )}
                    {req.status === "rejected" && (
                      <span className="text-red-600">❌ Rejected</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {req.status === "pending" ? (
                      <div className="space-x-2">
                        <button
                          onClick={() => handleAction(req.id, "accepted")}
                          className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(req.id, "rejected")}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">No actions</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  No requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
