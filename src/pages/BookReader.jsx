import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const BOOKS_API = "https://68cadc55430c4476c34b39e7.mockapi.io/books";

export default function BookReader() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);

  useEffect(() => {
    fetchBook();
    const disableRightClick = (e) => e.preventDefault();
    document.addEventListener("contextmenu", disableRightClick);
    return () => document.removeEventListener("contextmenu", disableRightClick);
  }, []);

  const fetchBook = async () => {
    try {
      const res = await axios.get(`${BOOKS_API}/${bookId}`);
      setBook(res.data);
    } catch (err) {
      console.error("Error fetching book:", err);
    }
  };

  if (!book) return <p className="text-center mt-10">Loading book...</p>;

  // ✅ Use BASE_URL so it works on GitHub Pages
  const pdfUrl = `${import.meta.env.BASE_URL}books/${book.filePath}`;

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <div className="bg-white shadow p-3 flex items-center justify-between">
        <h2 className="font-semibold text-lg">{book.name}</h2>
        <button
          onClick={() => navigate(-1)}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Back
        </button>
      </div>

      <div className="flex-1">
        <iframe
          src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
          title={book.name}
          className="w-full h-full border-none"
        ></iframe>
      </div>
    </div>
  );
}
