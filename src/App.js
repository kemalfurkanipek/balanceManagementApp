import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { login, logout } from "./redux/slices/userSlice";
import { auth } from "./firebaseConfig";
import Sidebar from "./components/Sidebar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import Balances from "./pages/Balances";
import PaymentPage from "./pages/PaymentPage";
import Coupons from "./pages/Coupons";
import Settings from "./pages/Settings";

const AppContent = () => {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
    const location = useLocation();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                dispatch(login({ uid: user.uid, email: user.email }));
            } else {
                dispatch(logout());
            }
        });

        return () => unsubscribe();
    }, [dispatch]);

    const showSidebar = isAuthenticated && location.pathname !== "/register" && location.pathname !== "/";

    return (
        <div className="flex">
            {showSidebar && <Sidebar />}

            <div className={`flex-1 p-4 ${showSidebar ? "ml-16 lg:ml-64" : ""}`}>
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/balances" element={<Balances />} />
                    <Route path="/payment" element={<PaymentPage />} />
                    <Route path="/coupons" element={<Coupons />} />
                    <Route path="/settings" element={<Settings />} />
                </Routes>
            </div>
        </div>
    );
};

const App = () => {
    return (
        <Router>
            <AppContent />
        </Router>
    );
};

export default App;
