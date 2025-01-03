import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/userSlice";
import { setLanguage } from "../redux/slices/languageSlice";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { sideBarLanguage } from "../literals";
import { FaHome, FaWallet, FaTags, FaCreditCard, FaCogs, FaSignOutAlt } from "react-icons/fa";

const Sidebar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const language = useSelector((state) => state.language.currentLanguage);
    const user = useSelector((state) => state.user.userInfo);

    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        const fetchLanguage = async () => {
            if (!user) return;

            try {
                const languageDocRef = doc(db, "languagePreferences", user.uid);
                const languageDocSnap = await getDoc(languageDocRef);

                if (languageDocSnap.exists()) {
                    const languageData = languageDocSnap.data();
                    if (languageData.language) {
                        dispatch(setLanguage(languageData.language));
                    }
                } else {
                    console.error("Dil bilgisi bulunamadı.");
                }
            } catch (error) {
                console.error("Dil bilgisi yüklenirken hata oluştu:", error);
            }
        };

        fetchLanguage();
    }, [user, dispatch]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            dispatch(logout());
            navigate("/");
        } catch (error) {
            console.error("Çıkış yapılamadı:", error);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            setIsCollapsed(window.innerWidth < 768);
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <div
            className={`fixed top-0 left-0 h-screen bg-gray-800 text-white flex flex-col transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"
                }`}
        >
            {!isCollapsed && (
                <button
                    className="p-4 text-center text-xl hover:bg-gray-700"
                    onClick={() => setIsCollapsed(true)}
                >
                    ←
                </button>
            )}
            {isCollapsed && (
                <button
                    className="p-4 text-center text-xl hover:bg-gray-700"
                    onClick={() => setIsCollapsed(false)}
                >
                    ☰
                </button>
            )}

            <nav className="flex flex-col items-center mt-4">
                <Link
                    to="/home"
                    className="mb-4 flex items-center justify-center w-full hover:bg-blue-500 transition-colors p-2 rounded"
                >
                    <FaHome className="text-lg" />
                    {!isCollapsed && (
                        <span className="ml-2">{sideBarLanguage.HOME_PAGE[language]}</span>
                    )}
                </Link>
                <Link
                    to="/balances"
                    className="mb-4 flex items-center justify-center w-full hover:bg-blue-500 transition-colors p-2 rounded"
                >
                    <FaWallet className="text-lg" />
                    {!isCollapsed && (
                        <span className="ml-2">{sideBarLanguage.BALANCES[language]}</span>
                    )}
                </Link>
                <Link
                    to="/coupons"
                    className="mb-4 flex items-center justify-center w-full hover:bg-blue-500 transition-colors p-2 rounded"
                >
                    <FaTags className="text-lg" />
                    {!isCollapsed && (
                        <span className="ml-2">{sideBarLanguage.COUPONS[language]}</span>
                    )}
                </Link>
                <Link
                    to="/payment"
                    className="mb-4 flex items-center justify-center w-full hover:bg-gray-700 transition-colors p-2 rounded"
                >
                    <FaCreditCard className="text-lg" />
                    {!isCollapsed && (
                        <span className="ml-2">{sideBarLanguage.MAKE_PAYMENT[language]}</span>
                    )}
                </Link>
                <Link
                    to="/settings"
                    className="mb-4 flex items-center justify-center w-full hover:bg-gray-700 transition-colors p-2 rounded"
                >
                    <FaCogs className="text-lg" />
                    {!isCollapsed && (
                        <span className="ml-2">{sideBarLanguage.SETTINGS[language]}</span>
                    )}
                </Link>
                <button
                    onClick={handleLogout}
                    className="mt-auto flex items-center justify-center w-full bg-red-500 hover:bg-red-600 transition-colors p-2 rounded"
                >
                    <FaSignOutAlt className="text-lg" />
                    {!isCollapsed && (
                        <span className="ml-2">{sideBarLanguage.LOG_OUT[language]}</span>
                    )}
                </button>
            </nav>
        </div>
    );
};

export default Sidebar;
