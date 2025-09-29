import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";

import UserLogin from "./pages/UserLogin";
import UserRegister from "./pages/UserRegister";
import AdminLogin from "./pages/AdminLogin";
import AdminHome from "./pages/AdminHome";
import ManageBooks from "./pages/ManageBooks";
import Requests from "./pages/Requests";
import Reports from "./pages/Reports";

import Home from "./pages/Home";
import Profile from "./pages/Profile";
import ForgetPassword from "./pages/ForgetPassword";
import AddAdmin from "./pages/AddAdmin";

// ✅ Newly added pages
import MyBooks from "./pages/MyBooks";
import BookReader from "./pages/BookReader";

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <BrowserRouter>
      {/* ✅ Pass handleLogout to Navbar */}
      <Navbar
        currentUser={currentUser}
        handleLogout={() => setCurrentUser(null)}
      />

      <div className="container mx-auto mt-10">
        <Routes>
          {/* ✅ Default route: If logged in -> go to home, else show login */}
          <Route
            path="/"
            element={
              currentUser ? (
                <Navigate to="/home" replace />
              ) : (
                <UserLogin setCurrentUser={setCurrentUser} />
              )
            }
          />

          {/* ✅ User register route */}
          <Route path="/register" element={<UserRegister />} />

          {/* ✅ Admin login route */}
          <Route
            path="/admin"
            element={<AdminLogin setCurrentUser={setCurrentUser} />}
          />

          {/* ✅ Admin Dashboard & Pages */}
          <Route
            path="/admin/home"
            element={
              currentUser ? <AdminHome /> : <Navigate to="/admin" replace />
            }
          />
          <Route
            path="/admin/add-admin"
            element={
              currentUser ? <AddAdmin /> : <Navigate to="/admin" replace />
            }
          />
          <Route
            path="/admin/manage-books"
            element={
              currentUser ? <ManageBooks /> : <Navigate to="/admin" replace />
            }
          />
          <Route
            path="/admin/requests"
            element={
              currentUser ? <Requests /> : <Navigate to="/admin" replace />
            }
          />
          <Route
            path="/admin/reports"
            element={
              currentUser ? <Reports /> : <Navigate to="/admin" replace />
            }
          />

          {/* ✅ Protected user routes */}
          <Route
            path="/home"
            element={
              currentUser ? (
                <Home currentUser={currentUser} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/profile"
            element={
              currentUser ? (
                <Profile
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* ✅ My Books Page */}
          <Route
            path="/my-books"
            element={
              currentUser ? (
                <MyBooks currentUser={currentUser} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* ✅ Book Reader Page */}
          <Route
            path="/read/:bookId"
            element={currentUser ? <BookReader /> : <Navigate to="/" replace />}
          />

          {/* ✅ Forget Password Page */}
          <Route path="/forget-password" element={<ForgetPassword />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
