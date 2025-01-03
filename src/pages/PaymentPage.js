import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { setLanguage } from "../redux/slices/languageSlice";
import { updateBalance } from "../redux/slices/balancesSlice";
import { getAuth } from "firebase/auth";
import store from "../redux/store";
import { paymentPageLanguage } from "../literals";

const PaymentPage = () => {
    const [paymentType, setPaymentType] = useState("creditCard");
    const [balanceType, setBalanceType] = useState("cash");
    const [amount, setAmount] = useState("");
    const [cardDetails, setCardDetails] = useState({
        cardNumber: "",
        expiry: "",
        cvv: "",
    });
    const [creditDetails, setCreditDetails] = useState({
        name: "",
        idNumber: "",
    });
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState("");

    const dispatch = useDispatch();
    const language = useSelector((state) => state.language.currentLanguage);
    const user = useSelector((state) => state.user.userInfo);

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

    const handlePayment = async () => {
        try {
            if (paymentType === "creditCard") {
                if (cardDetails.cvv !== "000") {
                    setMessage(paymentPageLanguage.INVALID_CVV[language]);
                    setMessageType("error");
                    return;
                }
                if (!cardDetails.cardNumber || !cardDetails.expiry) {
                    setMessage(paymentPageLanguage.FILL_REQUIRED_FIELDS[language]);
                    setMessageType("error");
                    return;
                }
            } else if (paymentType === "credit") {
                if (parseInt(amount) > 10000) {
                    setMessage(paymentPageLanguage.AMOUNT_LIMIT[language]);
                    setMessageType("error");
                    return;
                }
                if (!creditDetails.name || !creditDetails.idNumber) {
                    setMessage(paymentPageLanguage.FILL_REQUIRED_FIELDS[language]);
                    setMessageType("error");
                    return;
                }
            }

            if (!amount || parseInt(amount) <= 0) {
                setMessage(paymentPageLanguage.INVALID_AMOUNT[language]);
                setMessageType("error");
                return;
            }

            dispatch(updateBalance({ balanceType, amount: parseInt(amount) }));

            const updatedBalances = store.getState().balances.balances;
            const auth = getAuth();
            const userId = auth.currentUser?.uid;

            if (!userId) {
                setMessage(paymentPageLanguage.USER_NOT_FOUND[language]);
                setMessageType("error");
                return;
            }

            await setDoc(doc(db, "users", userId), {
                balances: updatedBalances,
            });

            setMessage(paymentPageLanguage.PAYMENT_SUCCESS[language]);
            setMessageType("success");

            setAmount("");
            setCardDetails({
                cardNumber: "",
                expiry: "",
                cvv: "",
            });
            setCreditDetails({
                name: "",
                idNumber: "",
            });
        } catch (error) {
            console.error("Firestore hata mesajı:", error);
            setMessage(paymentPageLanguage.PAYMENT_FAILED[language]);
            setMessageType("error");
        }
    };


    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    if (!user) {
        return <div>{paymentPageLanguage.LOADING[language]}</div>;
    }

    return (
        <div className="p-6">
            {message && (
                <div
                    className={`fixed top-4 right-4 p-3 rounded shadow-md ${messageType === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                >
                    {message}
                </div>
            )}

            <h1 className="text-2xl font-bold mb-4">{paymentPageLanguage.MAKE_PAYMENT[language]}</h1>

            <div className="mb-4">
                <label className="block font-semibold mb-2">{paymentPageLanguage.PAYMENT_TYPE[language]}</label>
                <select
                    className="w-full p-2 border rounded"
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                >
                    <option value="creditCard">{paymentPageLanguage.CREDIT_CARD[language]}</option>
                    <option value="credit">{paymentPageLanguage.CREDIT[language]}</option>
                </select>
            </div>

            <div className="mb-4">
                <label className="block font-semibold mb-2">{paymentPageLanguage.BALANCE_TYPE[language]}</label>
                <select
                    className="w-full p-2 border rounded"
                    value={balanceType}
                    onChange={(e) => setBalanceType(e.target.value)}
                >
                    <option value="cash">{paymentPageLanguage.CASH[language]}</option>
                    <option value="food">{paymentPageLanguage.FOOD[language]}</option>
                    <option value="roadPass">{paymentPageLanguage.ROAD_PASS[language]}</option>
                    <option value="fuel">{paymentPageLanguage.FUEL[language]}</option>
                    <option value="flight">{paymentPageLanguage.FLIGHT[language]}</option>
                </select>
            </div>

            <div className="mb-4">
                <label className="block font-semibold mb-2">{paymentPageLanguage.AMOUNT[language]} (TL)</label>
                <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
            </div>

            {paymentType === "creditCard" && (
                <div className="space-y-4">
                    <div>
                        <label className="block font-semibold mb-2">{paymentPageLanguage.CARD_NUMBER[language]}</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded"
                            value={cardDetails.cardNumber}
                            onChange={(e) =>
                                setCardDetails({ ...cardDetails, cardNumber: e.target.value })
                            }
                        />
                    </div>
                    <div>
                        <label className="block font-semibold mb-2">{paymentPageLanguage.EXPIRATION_DATE[language]}</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded"
                            value={cardDetails.expiry}
                            onChange={(e) =>
                                setCardDetails({ ...cardDetails, expiry: e.target.value })
                            }
                        />
                    </div>
                    <div>
                        <label className="block font-semibold mb-2">{paymentPageLanguage.CVV[language]}</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded"
                            value={cardDetails.cvv}
                            onChange={(e) =>
                                setCardDetails({ ...cardDetails, cvv: e.target.value })
                            }
                        />
                    </div>
                </div>
            )}

            {paymentType === "credit" && (
                <div className="space-y-4">
                    <div>
                        <label className="block font-semibold mb-2">{paymentPageLanguage.NAME_SURNAME[language]}</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded"
                            value={creditDetails.name}
                            onChange={(e) =>
                                setCreditDetails({ ...creditDetails, name: e.target.value })
                            }
                        />
                    </div>
                    <div>
                        <label className="block font-semibold mb-2">{paymentPageLanguage.TC[language]}</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded"
                            value={creditDetails.idNumber}
                            onChange={(e) =>
                                setCreditDetails({ ...creditDetails, idNumber: e.target.value })
                            }
                        />
                    </div>
                </div>
            )}

            <button
                className="mt-4 w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handlePayment}
            >
                {paymentPageLanguage.MAKE_PAYMENT[language]}
            </button>
        </div>
    );
};

export default PaymentPage;
