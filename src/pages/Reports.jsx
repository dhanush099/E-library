// src/pages/Reports.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminHomeButton from "../components/AdminHomeButton";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";

/* API endpoints */
const REQUEST_API = "https://68cadc55430c4476c34b39e7.mockapi.io/request";
const BOOKS_API = "https://68cadc55430c4476c34b39e7.mockapi.io/books";
const FEEDBACK_API = "https://68d017d5ec1a5ff338266959.mockapi.io/feedback";
const USERS_API = "https://68c7d8fb5d8d9f514733470f.mockapi.io/user";
const PAYMENTS_API = "https://68d017d5ec1a5ff338266959.mockapi.io/payments";

/* Helpers */
const normalizeStatus = (s) => {
  if (!s) return "unknown";
  const st = String(s).toLowerCase();
  if (st === "accepted") return "approved";
  return st;
};
const dateKey = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null; // check invalid date
  return d.toISOString().slice(0, 10);
};

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [requests, setRequests] = useState([]);
  const [books, setBooks] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [rangeDays, setRangeDays] = useState(30);
  const [paymentView, setPaymentView] = useState("daily"); // daily/monthly

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    setError(null);
    try {
      const [rReq, bReq, fReq, uReq, pReq] = await Promise.all([
        axios.get(REQUEST_API),
        axios.get(BOOKS_API),
        axios.get(FEEDBACK_API),
        axios.get(USERS_API),
        axios.get(PAYMENTS_API),
      ]);

      // Calculate dueDate dynamically as 7 days after createdAt
      const now = new Date();
      const requestsWithDue = (rReq.data || []).map((r) => {
        let created = r.createdAt ? new Date(r.createdAt) : new Date();
        if (isNaN(created.getTime())) created = new Date(); // fallback
        const dueDate = new Date(created);
        dueDate.setDate(created.getDate() + 7);
        return { ...r, dueDate: dueDate.toISOString() };
      });

      setRequests(requestsWithDue);
      setBooks(bReq.data || []);
      setFeedbacks(fReq.data || []);
      setUsers(uReq.data || []);
      setPayments(pReq.data || []);
    } catch (err) {
      console.error("Reports fetch error:", err);
      setError("Failed to load report data.");
    } finally {
      setLoading(false);
    }
  }

  const derived = useMemo(() => {
    const now = new Date();
    const cutoff =
      rangeDays > 0
        ? new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000)
        : null;

    const requestsInRange = requests.filter((r) => {
      if (!cutoff) return true;
      const created = r.createdAt ? new Date(r.createdAt) : new Date(r.dueDate);
      return created >= cutoff;
    });

    // Status counts including expired
    const statusCounts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      expired: 0,
      unknown: 0,
    };
    requestsInRange.forEach((r) => {
      const s = normalizeStatus(r.status);
      const isExpired = s === "approved" && new Date(r.dueDate) < now;
      if (isExpired) statusCounts.expired++;
      else if (statusCounts[s] === undefined) statusCounts.unknown++;
      else statusCounts[s]++;
    });

    // Requests per day
    const dayMap = {};
    requestsInRange.forEach((r) => {
      const key = dateKey(r.createdAt || r.dueDate);
      if (!key) return;
      dayMap[key] = (dayMap[key] || 0) + 1;
    });
    const requestsPerDay = Object.entries(dayMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Books per category
    const catMap = {};
    books.forEach((b) => {
      const c = b.category || "Uncategorized";
      catMap[c] = (catMap[c] || 0) + 1;
    });
    const booksByCategory = Object.entries(catMap).map(([name, value]) => ({
      name,
      value,
    }));

    // Top books
    const bookCountMap = {};
    requestsInRange.forEach((r) => {
      const id = r.bookId || "__noid__:" + (r.bookName || "Unknown");
      bookCountMap[id] = (bookCountMap[id] || 0) + 1;
    });
    const topBooks = Object.entries(bookCountMap)
      .map(([bookId, count]) => {
        const book = books.find((b) => b.id === bookId);
        const name = book
          ? book.name
          : requests.find((x) => x.bookId === bookId)?.bookName || bookId;
        return { bookId, name, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const totalBooks = books.length;
    const totalUsers = users.length;
    const totalRequests = requestsInRange.length;

    const feedbacksEnriched = feedbacks
      .slice()
      .map((f) => {
        const book = books.find((b) => b.id === f.bookId);
        const user = users.find(
          (u) => u.id === (f.userID || f.userId || f.user)
        );
        return {
          ...f,
          ratingNum: Number(f.rating) || 0,
          bookName: book
            ? book.name
            : requests.find((r) => r.bookId === f.bookId)?.bookName ||
              "Unknown",
          userName: user ? user.name : "Unknown",
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const avgRating =
      feedbacksEnriched.length > 0
        ? (
            feedbacksEnriched.reduce((s, f) => s + f.ratingNum, 0) /
            feedbacksEnriched.length
          ).toFixed(2)
        : "—";

    const statusPie = [
      { name: "pending", value: statusCounts.pending },
      { name: "approved", value: statusCounts.approved },
      { name: "rejected", value: statusCounts.rejected },
      { name: "expired", value: statusCounts.expired },
    ];

    // Payments over time (daily or monthly)
    const paymentMap = {};
    payments.forEach((p) => {
      const d = new Date(p.paymentDate);
      if (isNaN(d.getTime())) return; // skip invalid dates

      const key =
        paymentView === "monthly"
          ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
          : d.toISOString().slice(0, 10);

      paymentMap[key] = (paymentMap[key] || 0) + Number(p.amount || 0);
    });

    const paymentsOverTime = Object.entries(paymentMap)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      requestsInRange,
      requestsPerDay,
      booksByCategory,
      topBooks,
      totalBooks,
      totalUsers,
      totalRequests,
      feedbacksEnriched,
      avgRating,
      statusCounts,
      statusPie,
      paymentsOverTime,
    };
  }, [requests, books, feedbacks, users, payments, rangeDays, paymentView]);

  if (loading) return <div className="p-6 text-center">Loading reports...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  const PIE_COLORS = ["#f59e0b", "#10b981", "#ef4444", "#6b7280"];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-gray-800">
            📊 Admin Reports
          </h1>
          <AdminHomeButton />
        </div>

        {/* KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Total Books", value: derived.totalBooks },
            { label: "Total Users", value: derived.totalUsers },
            { label: "Requests", value: derived.totalRequests },
            { label: "Average Rating", value: derived.avgRating },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition duration-300"
            >
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {item.value}
              </p>
            </div>
          ))}
        </section>

        {/* Status Counts */}
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Request Status Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.entries(derived.statusCounts).map(([k, v]) => (
              <div
                key={k}
                className="bg-white p-5 rounded-2xl shadow text-center hover:shadow-md transition"
              >
                <p className="text-gray-500 capitalize">{k}</p>
                <p className="text-2xl font-bold text-gray-800">{v}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Charts */}
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Analytics
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Payments Over Time */}
            <div className="bg-white p-5 rounded-2xl shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Payments Over Time</h3>
                <select
                  value={paymentView}
                  onChange={(e) => setPaymentView(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value="daily">Daily</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              {derived.paymentsOverTime.length === 0 ? (
                <p className="text-center text-gray-500 py-10">
                  No payment data
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={derived.paymentsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ReTooltip formatter={(value) => `₹${value}`} />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#16a34a"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Status Pie */}
            <div className="bg-white p-5 rounded-2xl shadow">
              <h3 className="font-semibold mb-4">Request Status Breakdown</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={derived.statusPie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    label
                  >
                    {derived.statusPie.map((entry, i) => (
                      <Cell
                        key={`c-${i}`}
                        fill={PIE_COLORS[i % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <ReTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Books by Category */}
            <div className="bg-white p-5 rounded-2xl shadow">
              <h3 className="font-semibold mb-4">Books by Category</h3>
              {derived.booksByCategory.length === 0 ? (
                <p className="text-center text-gray-500 py-10">No books</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={derived.booksByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <ReTooltip />
                    <Bar dataKey="value" fill="#06b6d4" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </section>

        {/* Top Books & Feedback */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Books */}
          <div className="bg-white p-5 rounded-2xl shadow">
            <h3 className="font-semibold mb-4">🏆 Top Requested Books</h3>
            <ul className="space-y-3">
              {derived.topBooks.map((b, i) => (
                <li
                  key={b.bookId}
                  className="flex justify-between items-center hover:bg-gray-50 p-2 rounded-lg transition"
                >
                  <div>
                    <p className="font-medium">
                      {i + 1}. {b.name}
                    </p>
                    <p className="text-xs text-gray-400">ID: {b.bookId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">{b.count}</p>
                    <p className="text-xs text-gray-500">requests</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Latest Feedback */}
          <div className="bg-white p-5 rounded-2xl shadow">
            <h3 className="font-semibold mb-4">📝 Latest Feedback</h3>
            <ul className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {derived.feedbacksEnriched.slice(0, 8).map((f) => (
                <li
                  key={f.id}
                  className="border-b pb-3 hover:bg-gray-50 p-2 rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">{f.bookName}</p>
                      <p className="text-xs text-gray-500">
                        {f.userName} • {new Date(f.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-yellow-600">
                      ⭐ {f.ratingNum}
                    </span>
                  </div>
                  {f.feedback && (
                    <p className="text-sm text-gray-700 mt-1">{f.feedback}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
