import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const REQUESTS_API = "https://68cadc55430c4476c34b39e7.mockapi.io/request";
const BOOKS_API = "https://68cadc55430c4476c34b39e7.mockapi.io/books";
const FEEDBACK_API = "https://68d017d5ec1a5ff338266959.mockapi.io/feedback";
const PAYMENTS_API = "https://68d017d5ec1a5ff338266959.mockapi.io/payments";

export default function MyBooks({ currentUser }) {
  const [loading, setLoading] = useState(true);
  const [activeRequests, setActiveRequests] = useState([]);
  const [booksMap, setBooksMap] = useState({});
  const [error, setError] = useState(null);

  // Feedback modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Toast message state
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();

  // Helper: Days left
  const daysLeftFrom = (iso) => {
    if (!iso) return null;
    const ms = new Date(iso) - new Date();
    if (ms <= 0) return 0;
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    if (!currentUser || !currentUser.id) {
      setLoading(false);
      setActiveRequests([]);
      return;
    }
    loadData();
  }, [currentUser]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const reqRes = await axios.get(
        `${REQUESTS_API}?userId=${currentUser.id}`
      );
      const userRequests = Array.isArray(reqRes.data) ? reqRes.data : [];

      const acceptedStatuses = ["approved", "accepted", "expired"];
      const myRequests = userRequests.filter((r) =>
        acceptedStatuses.includes((r.status || "").toLowerCase())
      );

      // Mark expired
      const now = new Date();
      const toExpire = myRequests.filter(
        (r) => r.status !== "expired" && r.dueDate && new Date(r.dueDate) < now
      );

      if (toExpire.length > 0) {
        await Promise.all(
          toExpire.map((r) =>
            axios.put(`${REQUESTS_API}/${r.id}`, { ...r, status: "expired" })
          )
        );
        // reload
        const refresh = await axios.get(
          `${REQUESTS_API}?userId=${currentUser.id}`
        );
        const refreshed = Array.isArray(refresh.data) ? refresh.data : [];
        myRequests.length = 0;
        myRequests.push(
          ...refreshed.filter((r) =>
            acceptedStatuses.includes((r.status || "").toLowerCase())
          )
        );
      }

      const booksRes = await axios.get(BOOKS_API);
      const books = Array.isArray(booksRes.data) ? booksRes.data : [];
      const map = {};
      books.forEach((b) => (map[b.id] = b));

      setBooksMap(map);
      setActiveRequests(myRequests);
    } catch (err) {
      console.error("MyBooks load error:", err);
      setError("Could not load your books. Try again.");
    } finally {
      setLoading(false);
    }
  }

  // Payment handler
  async function handlePayment() {
    if (!agreeTerms) return; // don't allow without checkbox

    try {
      const req = selectedRequest;

      await axios.post(PAYMENTS_API, {
        userId: currentUser.id,
        bookId: req.bookId,
        amount: "35",
        paymentDate: new Date().toISOString(),
      });

      const newDueDate = new Date();
      newDueDate.setDate(newDueDate.getDate() + 7);

      await axios.put(`${REQUESTS_API}/${req.id}`, {
        ...req,
        status: "accepted",
        dueDate: newDueDate.toISOString(),
      });

      setPaymentSuccess(true);
      setTimeout(() => {
        setShowPaymentModal(false);
        setPaymentSuccess(false);
        setAgreeTerms(false);
        loadData();
        showToast(
          `✅ Payment successful! Due extended to ${newDueDate.toDateString()}`,
          "success"
        );
      }, 1500);
    } catch (err) {
      console.error("Payment failed:", err);
      showToast("Payment failed. Please try again.", "error");
    }
  }

  function showToast(message, type = "info") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function submitFeedback() {
    if (!rating) return alert("Please select a rating!");
    try {
      await axios.post(FEEDBACK_API, {
        userID: currentUser.id,
        bookId: selectedBook.bookId,
        rating: String(rating),
        feedback,
        createdAt: new Date().toISOString(),
      });
      setShowModal(false);
      setRating(0);
      setFeedback("");
      showToast("✅ Feedback submitted successfully!", "success");
    } catch (err) {
      console.error("Feedback submit error:", err);
      showToast("❌ Failed to submit feedback. Try again.", "error");
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-6 px-4">
        <p className="text-center text-gray-600">Loading your books...</p>
      </div>
    );
  }

  if (!currentUser || !currentUser.id) {
    return (
      <div className="max-w-6xl mx-auto mt-6 px-4">
        <p className="text-center text-gray-600">
          Please login to view your books.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-6 px-4">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 px-4 py-2 rounded-lg shadow-lg text-white z-50 transition ${
            toast.type === "success"
              ? "bg-green-600"
              : toast.type === "error"
              ? "bg-red-600"
              : "bg-gray-700"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Books</h1>
        <button
          onClick={() => navigate("/home")}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 shadow-md transition"
        >
          🏠 Home
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
          {error}
        </div>
      )}

      {activeRequests.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No active books found. If you have requests pending, wait for admin
          approval.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeRequests.map((req) => {
            const book = booksMap[req.bookId];
            const daysLeft = daysLeftFrom(req.dueDate);
            const isExpired = daysLeft <= 0;

            const badge =
              daysLeft > 3
                ? "bg-green-100 text-green-800"
                : daysLeft > 0
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800";

            return (
              <div
                key={req.id}
                className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 relative"
              >
                {book?.category && (
                  <span className="absolute top-3 right-3 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {book.category}
                  </span>
                )}

                <h3 className="text-lg font-semibold">{req.bookName}</h3>
                {book?.author && (
                  <p className="text-sm text-gray-600 mt-1">By {book.author}</p>
                )}

                <p className="text-sm text-gray-500 mt-3">
                  Due:{" "}
                  {req.dueDate ? new Date(req.dueDate).toLocaleString() : "—"}
                </p>

                <div className="mt-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${badge}`}
                  >
                    {isExpired
                      ? "Expired"
                      : `${daysLeft} day${daysLeft > 1 ? "s" : ""} left`}
                  </span>
                </div>

                <div className="mt-5 flex gap-2 flex-wrap">
                  <button
                    onClick={() => navigate(`/read/${req.bookId}`)}
                    disabled={isExpired}
                    className={`px-4 py-2 rounded-lg shadow-sm transition ${
                      !isExpired
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    📖 Read Now
                  </button>

                  {isExpired && (
                    <button
                      onClick={() => {
                        setSelectedRequest(req);
                        setShowPaymentModal(true);
                      }}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg shadow hover:bg-orange-600 transition"
                    >
                      💰 Pay & Extend
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSelectedBook(req);
                      setShowModal(true);
                    }}
                    className="px-4 py-2 bg-yellow-400 text-black rounded-lg shadow hover:bg-yellow-500 transition"
                  >
                    Give Feedback
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Feedback Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-96">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Give Feedback for{" "}
              <span className="text-indigo-600">{selectedBook?.bookName}</span>
            </h2>

            <div className="flex justify-center mb-4 space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-3xl cursor-pointer transition-colors ${
                    star <= rating
                      ? "text-yellow-400"
                      : "text-gray-300 hover:text-yellow-200"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>

            <textarea
              className="w-full border border-gray-300 rounded-xl p-3 mb-4 focus:ring-2 focus:ring-indigo-400 resize-none text-gray-700"
              placeholder="Write your feedback..."
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={submitFeedback}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6 relative animate-fadeIn">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>

            {!paymentSuccess ? (
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Extend Book Due Date
                </h2>
                <div className="text-5xl font-bold text-green-600 mb-4">
                  ₹35
                </div>
                <p className="text-gray-600 mb-4">
                  Pay ₹35 to extend your due date by <b>7 more days</b>.
                </p>

                <label className="flex items-center justify-center gap-2 mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-green-600"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                      Terms & Conditions
                    </a>
                  </span>
                </label>

                <button
                  onClick={handlePayment}
                  disabled={!agreeTerms}
                  className={`w-full px-6 py-3 rounded-xl text-white transition transform ${
                    agreeTerms
                      ? "bg-green-600 hover:bg-green-700 hover:scale-105"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  Pay Now
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-12 h-12 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-green-700">
                  Payment Successful!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
