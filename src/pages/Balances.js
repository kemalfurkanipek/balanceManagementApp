import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { setBalances } from "../redux/slices/balancesSlice";
import { setLanguage } from "../redux/slices/languageSlice";
import { addCoupon } from "../redux/slices/couponsSlice";
import Modal from "react-modal";
import { balancesPageLanguage } from "../literals";

Modal.setAppElement("#root");

const Balances = () => {
    const user = useSelector((state) => state.user.userInfo);
    const balances = useSelector((state) => state.balances.balances);
    const language = useSelector((state) => state.language.currentLanguage);
    const dispatch = useDispatch();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [couponData, setCouponData] = useState({ type: "", amount: "", expiryDate: "" });
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            try {
                const balancesDocRef = doc(db, "users", user.uid);
                const balancesDocSnap = await getDoc(balancesDocRef);
                if (balancesDocSnap.exists()) {
                    const balancesData = balancesDocSnap.data();
                    if (balancesData.balances) {
                        dispatch(setBalances(balancesData.balances));
                    }
                }

                const languageDocRef = doc(db, "languagePreferences", user.uid);
                const languageDocSnap = await getDoc(languageDocRef);
                if (languageDocSnap.exists()) {
                    const languageData = languageDocSnap.data();
                    if (languageData.language) {
                        dispatch(setLanguage(languageData.language));
                    }
                }
            } catch (error) {
                console.error("Veriler çekilirken hata oluştu:", error);
                setMessage(balancesPageLanguage.FETCH_ERROR[language]);
                setMessageType("error");
            }
        };

        fetchData();
    }, [user, dispatch, language]);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const openModal = (type) => {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 10);

        setCouponData({ type, amount: "", expiryDate: expiryDate.toISOString().split("T")[0] });
        setMessage(null);
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleCouponCreate = async () => {
        if (!couponData.amount || isNaN(couponData.amount) || parseFloat(couponData.amount) <= 0) {
            setMessage(balancesPageLanguage.INVALID_AMOUNT[language]);
            setMessageType("error");
            return;
        }

        const amount = parseFloat(couponData.amount);
        const currentBalance = balances[couponData.type] || 0;

        if (amount > currentBalance) {
            setMessage(balancesPageLanguage.INSUFFICIENT_BALANCE[language]);
            setMessageType("error");
            return;
        }

        const newCoupon = {
            type: couponData.type,
            amount,
            expiryDate: couponData.expiryDate,
            createdAt: new Date().toISOString(),
        };

        try {
            const docRef = doc(db, "users", user.uid);
            await updateDoc(docRef, {
                coupons: arrayUnion(newCoupon),
            });

            const updatedBalances = {
                ...balances,
                [couponData.type]: currentBalance - amount,
            };
            await updateDoc(docRef, { balances: updatedBalances });

            dispatch(setBalances(updatedBalances));
            dispatch(addCoupon(newCoupon));
            setIsModalOpen(false);
            setMessage(balancesPageLanguage.COUPON_CREATED[language]);
            setMessageType("success");
        } catch (error) {
            console.error("Kupon kaydedilirken hata oluştu:", error);
            setMessage(balancesPageLanguage.COUPON_ERROR[language]);
            setMessageType("error");
        }
    };

    if (!user) {
        return <div>Yükleniyor...</div>;
    }

    return (
        <div className="p-4 md:p-6">
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

            <h1 className="text-xl md:text-2xl font-bold mb-4 text-center md:text-left">
                {balancesPageLanguage.BALANCE_TABLE[language]}
            </h1>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200 text-sm md:text-base">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 px-4 py-2">{balancesPageLanguage.ID[language]}</th>
                            <th className="border border-gray-300 px-4 py-2">{balancesPageLanguage.BALANCE_TYPE[language]}</th>
                            <th className="border border-gray-300 px-4 py-2">{balancesPageLanguage.REMAINING_BALANCE[language]}</th>
                            <th className="border border-gray-300 px-4 py-2">{balancesPageLanguage.CREATE_COUPON[language]}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(balances).map(([type, amount], index) => (
                            <tr key={type}>
                                <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                                <td className="border border-gray-300 px-4 py-2 capitalize">{type}</td>
                                <td className="border border-gray-300 px-4 py-2">{amount} TL</td>
                                <td className="border border-gray-300 px-4 py-2">
                                    <button
                                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                        onClick={() => openModal(type)}
                                    >
                                        {balancesPageLanguage.CREATE_COUPON[language]}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Kupon Oluştur Modal"
                className="bg-white p-6 rounded shadow-lg w-full max-w-lg md:max-w-xl mx-4 md:mx-auto"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
            >
                <h2 className="text-lg md:text-xl font-bold mb-4 text-center">{balancesPageLanguage.CREATE_COUPON[language]}</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">{balancesPageLanguage.COUPON_TYPE[language]}:</label>
                    <input
                        type="text"
                        value={couponData.type}
                        readOnly
                        className="w-full border border-gray-300 px-3 py-2 rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">{balancesPageLanguage.AMOUNT[language]}:</label>
                    <input
                        type="number"
                        value={couponData.amount}
                        onChange={(e) => setCouponData({ ...couponData, amount: e.target.value })}
                        className="w-full border border-gray-300 px-3 py-2 rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">{balancesPageLanguage.EXPIRY_DATE[language]}:</label>
                    <input
                        type="date"
                        value={couponData.expiryDate}
                        readOnly
                        className="w-full border border-gray-300 px-3 py-2 rounded"
                    />
                </div>
                <div className="flex justify-end">
                    <button
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2"
                        onClick={closeModal}
                    >
                        {balancesPageLanguage.CANCEL[language]}
                    </button>
                    <button
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        onClick={handleCouponCreate}
                    >
                        {balancesPageLanguage.CREATE[language]}
                    </button>
                </div>
            </Modal>

        </div>
    );
};

export default Balances;
