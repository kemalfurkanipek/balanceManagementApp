import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "firebase/auth";
import { useDispatch } from "react-redux";
import { login } from "../redux/slices/userSlice";
import { auth } from "../firebaseConfig";
import { Link, useNavigate } from "react-router-dom";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleLogin = async () => {
        try {
            await setPersistence(auth, browserLocalPersistence);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            dispatch(login({ uid: userCredential.user.uid, email: userCredential.user.email }));
            setMessage("Giriş başarılı! Yönlendiriliyorsunuz...");
            setMessageType("success");

            setTimeout(() => {
                navigate("/home");
            }, 2000);
        } catch (error) {
            console.error("Giriş hatası:", error);
            setMessage("Giriş başarısız! Lütfen bilgilerinizi kontrol edin.");
            setMessageType("error");
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="w-96 p-6 bg-white shadow-md rounded">
                <h1 className="text-xl font-semibold mb-4">Giriş Yap</h1>
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full mb-3 p-2 border rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Şifre"
                    className="w-full mb-3 p-2 border rounded"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {message && (
                    <div
                        className={`mb-4 p-2 rounded ${messageType === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                    >
                        {message}
                    </div>
                )}
                <button
                    className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={handleLogin}
                >
                    Giriş Yap
                </button>
                <p className="mt-4 text-center">
                    Hesabınız yok mu?{" "}
                    <Link to="/register" className="text-blue-600 hover:underline">
                        Kayıt Ol
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
