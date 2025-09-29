import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import AdminHomeButton from "../components/AdminHomeButton";

const API_URL = "https://68cadc55430c4476c34b39e7.mockapi.io/books";

function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState({
    name: "",
    author: "",
    about: "",
    category: "",
    filePath: "",
  });

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await axios.get(API_URL);
      setBooks(res.data);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();

    if (!newBook.filePath) {
      alert("Please enter a valid file name (must exist in public/books/)");
      return;
    }

    try {
      await axios.post(API_URL, newBook);
      setNewBook({
        name: "",
        author: "",
        about: "",
        category: "",
        filePath: "",
      });
      fetchBooks();
    } catch (error) {
      console.error("Error adding book:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchBooks();
    } catch (error) {
      console.error("Error deleting book:", error);
    }
  };

  // Filter + Search logic
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch =
        book.name.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "All" || book.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [books, search, categoryFilter]);

  const categories = useMemo(() => {
    const unique = new Set(books.map((b) => b.category).filter(Boolean));
    return ["All", ...Array.from(unique)];
  }, [books]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      {/* Header with Admin Home Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">📚 Manage Books</h1>
        <AdminHomeButton />
      </div>

      {/* Add Book Form */}
      <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
          Add New Book
        </h2>

        <form onSubmit={handleAddBook} className="grid gap-5">
          <input
            type="text"
            placeholder="Book Name"
            value={newBook.name}
            onChange={(e) => setNewBook({ ...newBook, name: e.target.value })}
            className="border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            required
          />

          <input
            type="text"
            placeholder="Author Name"
            value={newBook.author}
            onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
            className="border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            required
          />

          <input
            type="text"
            placeholder="Category"
            value={newBook.category}
            onChange={(e) =>
              setNewBook({ ...newBook, category: e.target.value })
            }
            className="border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            required
          />

          <textarea
            placeholder="About Book (optional)"
            value={newBook.about}
            onChange={(e) => setNewBook({ ...newBook, about: e.target.value })}
            className="border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
            rows="3"
          />

          <input
            type="text"
            placeholder="Enter PDF file name (ex: book1.pdf)"
            value={newBook.filePath}
            onChange={(e) =>
              setNewBook({ ...newBook, filePath: e.target.value })
            }
            className="border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            required
          />
          <p className="text-sm text-gray-500">
            🔹 Place this file manually inside <code>public/books/</code>{" "}
            folder.
          </p>

          <button
            type="submit"
            className="bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 shadow-md transition transform hover:scale-[1.02]"
          >
            ➕ Add Book
          </button>
        </form>
      </div>

      {/* Available Books */}
      <div>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Available Books</h2>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="🔎 Search by name or author"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-2 rounded-xl w-full md:w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border p-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            >
              {categories.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredBooks.length === 0 ? (
          <p className="text-gray-500 text-center italic">
            No books found. Try a different search or add more books.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white shadow-md rounded-2xl p-5 border border-gray-200 hover:shadow-xl transition"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {book.name}
                  </h3>
                  {book.category && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-medium">
                      {book.category}
                    </span>
                  )}
                </div>

                <p className="text-gray-600 text-sm">By {book.author}</p>

                {book.about && (
                  <p className="text-gray-500 text-sm mt-2 line-clamp-3">
                    {book.about}
                  </p>
                )}

                <div className="flex justify-between items-center mt-5">
                  {book.filePath ? (
                    <a
                      href={`${window.location.origin}/books/${book.filePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition shadow-sm"
                    >
                      📄 View PDF
                    </a>
                  ) : (
                    <span className="text-gray-400 text-xs italic">
                      No PDF available
                    </span>
                  )}

                  <button
                    onClick={() => handleDelete(book.id)}
                    className="text-red-500 hover:text-red-700 font-medium transition"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageBooks;
