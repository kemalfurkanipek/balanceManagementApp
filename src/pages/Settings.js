import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { setLanguage } from "../redux/slices/languageSlice";
import { db } from "../firebaseConfig";
import { settingsLanguage } from "../literals";

const Settings = () => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.userInfo);
    const currentLanguage = useSelector((state) => state.language.currentLanguage);
    const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState("");

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
                        setSelectedLanguage(languageData.language);
                    }
                } else {
                    console.error("Dil bilgisi bulunamadı.");
                }
            } catch (error) {
                console.error("Dil bilgisi yüklenirken hata oluştu:", error);
                setMessage(settingsLanguage.FETCH_ERROR[currentLanguage]);
                setMessageType("error");
            }
        };

        fetchLanguage();
    }, [user, dispatch, currentLanguage]);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleLanguageChange = async () => {
        if (!user) {
            setMessage(settingsLanguage.USER_NOT_FOUND[currentLanguage]);
            setMessageType("error");
            return;
        }

        try {
            dispatch(setLanguage(selectedLanguage));

            const languageDocRef = doc(db, "languagePreferences", user.uid);
            await setDoc(languageDocRef, { language: selectedLanguage }, { merge: true });

            setMessage(settingsLanguage.LANGUAGE_UPDATED[currentLanguage]);
            setMessageType("success");
        } catch (error) {
            console.error("Dil güncellenirken hata oluştu:", error);
            setMessage(settingsLanguage.LANGUAGE_UPDATE_ERROR[currentLanguage]);
            setMessageType("error");
        }
    };

    return (
        <div className="flex-1 p-4 min-h-screen bg-gray-100 relative">
            {message && (
                <div
                    className={`fixed top-4 right-4 p-3 rounded shadow-md transition-all duration-300 ${messageType === "success"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                >
                    {message}
                </div>
            )}

            <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md mx-auto">
                <h1 className="text-2xl font-bold mb-6 text-center">
                    {settingsLanguage.SETTINGS[currentLanguage]}
                </h1>
                <div className="mb-4">
                    <label className="block font-semibold mb-2">
                        {settingsLanguage.LANGUAGE_SELECTION[currentLanguage]}
                    </label>
                    <select
                        className="w-full p-2 border rounded"
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                    >
                        <option value="tr">{settingsLanguage.TURKISH[currentLanguage]}</option>
                        <option value="en">{settingsLanguage.ENGLISH[currentLanguage]}</option>
                    </select>
                </div>
                <button
                    className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    onClick={handleLanguageChange}
                >
                    {settingsLanguage.SAVE_LANGUAGE[currentLanguage]}
                </button>
            </div>
        </div>
    );
};

export default Settings;
