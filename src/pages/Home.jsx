// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BOOKS_API = "https://68cadc55430c4476c34b39e7.mockapi.io/books";
const REQUESTS_API = "https://68cadc55430c4476c34b39e7.mockapi.io/request";

export default function Home({ currentUser }) {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [requests, setRequests] = useState([]);
  const [loadingRequestId, setLoadingRequestId] = useState(null);
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
  }, []);

  // Re-fetch current user's requests whenever currentUser changes
  useEffect(() => {
    fetchRequestsForCurrentUser();
  }, [currentUser]);

  // fetch all books
  const fetchBooks = async () => {
    try {
      const res = await axios.get(BOOKS_API);
      setBooks(res.data || []);
    } catch (err) {
      console.error("Error fetching books:", err);
    }
  };

  // fetch only requests that belong to the logged-in user
  const fetchRequestsForCurrentUser = async () => {
    try {
      if (!currentUser || !currentUser.id) {
        setRequests([]); // no logged-in user → no requests shown
        return;
      }
      // MockAPI supports query params, so ask server for user-specific requests
      const res = await axios.get(`${REQUESTS_API}?userId=${currentUser.id}`);
      setRequests(res.data || []);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  // create a new borrow request for the logged-in user
  const handleRequestBook = async (book) => {
    if (!currentUser || !currentUser.id) {
      setToast({ type: "warn", text: "Please login to request a book." });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    // Only check current user's requests (we fetched only that user's requests)
    const already = requests.find((r) => r.bookId === book.id);
    if (already) {
      // show more specific message based on status
      if (already.status === "pending") {
        setToast({
          type: "info",
          text: `Request already pending for "${book.name}".`,
        });
      } else if (already.status === "accepted") {
        setToast({
          type: "info",
          text: `Request already accepted — check My Books.`,
        });
      } else {
        setToast({ type: "info", text: `You previously requested this book.` });
      }
      setTimeout(() => setToast(null), 3000);
      return;
    }

    try {
      setLoadingRequestId(book.id);
      // include userId so the request belongs to this user
      await axios.post(REQUESTS_API, {
        userId: currentUser.id,
        bookId: book.id,
        bookName: book.name,
        status: "pending",
        dueDate: null,
      });

      // refresh only this user's requests
      await fetchRequestsForCurrentUser();

      setToast({ type: "success", text: `Request sent for "${book.name}".` });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error("Error creating request:", err);
      setToast({ type: "error", text: "Failed to send request. Try again." });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoadingRequestId(null);
    }
  };

  // Extract unique authors & categories
  const authors = [...new Set(books.map((b) => b.author).filter(Boolean))];
  const categories = [...new Set(books.map((b) => b.category).filter(Boolean))];

  // Filter + Search
  const filteredBooks = books.filter((b) => {
    const q = query.trim().toLowerCase();
    const matchesSearch =
      !q ||
      b.name.toLowerCase().includes(q) ||
      (b.author || "").toLowerCase().includes(q) ||
      (b.category || "").toLowerCase().includes(q);

    const matchesAuthor = authorFilter ? b.author === authorFilter : true;
    const matchesCategory = categoryFilter
      ? b.category === categoryFilter
      : true;

    return matchesSearch && matchesAuthor && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto mt-6 space-y-6 px-4">
      {/* toast */}
      {toast && (
        <div
          className={`p-3 rounded-lg text-center shadow ${
            toast.type === "success"
              ? "bg-green-100 text-green-800"
              : toast.type === "error"
              ? "bg-red-100 text-red-800"
              : toast.type === "warn"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {toast.text}
        </div>
      )}

      {/* Top controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <input
          type="text"
          placeholder="🔍 Search by name, author, or category..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border p-3 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none shadow-sm"
        />

        <select
          value={authorFilter}
          onChange={(e) => setAuthorFilter(e.target.value)}
          className="border p-3 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none shadow-sm"
        >
          <option value="">All Authors</option>
          {authors.map((author, i) => (
            <option key={i} value={author}>
              {author}
            </option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border p-3 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none shadow-sm"
        >
          <option value="">All Categories</option>
          {categories.map((cat, i) => (
            <option key={i} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            if (!currentUser || !currentUser.id) {
              setToast({
                type: "warn",
                text: "Please login to view My Books.",
              });
              setTimeout(() => setToast(null), 2000);
              return;
            }
            navigate("/my-books");
          }}
          className={`px-4 py-2 rounded-xl shadow-md transition ${
            currentUser && currentUser.id
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          📚 My Books
        </button>
      </div>

      {/* Books Grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((b) => {
            // requests state contains only current user's requests (server filtered)
            const req = requests.find((r) => r.bookId === b.id);

            return (
              <div
                key={b.id}
                className="p-5 bg-white shadow-lg rounded-2xl hover:shadow-2xl transition-all border border-gray-100 relative"
              >
                {/* category badge top-right */}
                {b.category && (
                  <span className="absolute top-3 right-3 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {b.category}
                  </span>
                )}

                {/* Book Cover */}
                {b.imageUrl && (
                  <img
                    src={b.imageUrl}
                    alt={b.name}
                    className="w-full h-40 object-contain rounded-lg mb-4 bg-gray-100"
                  />
                )}

                <h3 className="text-lg font-bold text-gray-800">{b.name}</h3>
                <p className="text-gray-600 text-sm mt-1">👤 {b.author}</p>

                {b.about && (
                  <p className="text-gray-500 text-sm mt-2 line-clamp-3">
                    {b.about}
                  </p>
                )}

                <div className="mt-4 flex justify-between items-center">
                  {/* show request status or request button (only for this user) */}
                  {req ? (
                    req.status === "accepted" ? (
                      <span className="text-green-700 text-sm font-semibold">
                        Accepted — Check My Books page
                      </span>
                    ) : req.status === "pending" ? (
                      <span className="text-yellow-600 text-sm font-medium">
                        ⏳ Pending — Wait for Admin Approval
                      </span>
                    ) : (
                      <span className="text-red-700 text-sm font-semibold">
                        {req.status} — Check My Books to extend
                      </span>
                    )
                  ) : (
                    <button
                      onClick={() => handleRequestBook(b)}
                      disabled={loadingRequestId === b.id}
                      className={`px-3 py-1 rounded-lg transition shadow-sm ${
                        loadingRequestId === b.id
                          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                          : "bg-purple-500 text-white hover:bg-purple-600"
                      }`}
                    >
                      {loadingRequestId === b.id ? "Requesting..." : "Request"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500 text-center italic mt-5">
          No books found matching your search or filters.
        </p>
      )}
    </div>
  );
}
