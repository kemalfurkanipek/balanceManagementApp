import React, { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebaseConfig";

const RegisterPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            setMessage("Şifreler eşleşmiyor!");
            setMessageType("error");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const userId = userCredential.user.uid;

            const languageDocRef = doc(db, "languagePreferences", userId);
            await setDoc(languageDocRef, { language: "tr" });

            setMessage("Kayıt başarılı! Varsayılan dil Türkçe olarak ayarlandı.");
            setMessageType("success");

            setTimeout(() => {
                navigate("/");
            }, 2000);
        } catch (error) {
            console.error("Kayıt sırasında hata oluştu:", error);
            setMessage("Kayıt başarısız! Lütfen tekrar deneyin.");
            setMessageType("error");
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="w-96 p-6 bg-white shadow-md rounded">
                <h1 className="text-xl font-semibold mb-4">Kayıt Ol</h1>
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
                <input
                    type="password"
                    placeholder="Şifre Tekrar"
                    className="w-full mb-3 p-2 border rounded"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                    className="w-full p-2 bg-green-600 text-white rounded hover:bg-green-700"
                    onClick={handleRegister}
                >
                    Kayıt Ol
                </button>
                <p className="mt-4 text-center">
                    Zaten Kayıtlı mısınız?{" "}
                    <Link to="/" className="text-blue-600 hover:underline">
                        Giriş Yap
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
