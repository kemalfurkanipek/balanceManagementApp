import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { setLanguage } from "../redux/slices/languageSlice";
import { couponsLanguage } from "../literals";

const Coupons = () => {
    const user = useSelector((state) => state.user.userInfo);
    const language = useSelector((state) => state.language.currentLanguage);
    const [coupons, setCoupons] = useState([]);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    setCoupons(userData.coupons || []);
                } else {
                    console.error("Kullanıcı verisi bulunamadı.");
                }

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
                console.error("Firestore'dan veri yüklenirken hata oluştu:", error);
            }
        };

        fetchData();
    }, [user, dispatch]);

    if (!user) {
        return <div>Loading</div>;
    }
    let balanceTypes = {
        'cash': couponsLanguage.CASH[language],
        'fuel': couponsLanguage.FUEL[language],
        'roadPass': couponsLanguage.ROAD_PASS[language],
        'flight': couponsLanguage.FLIGHT[language],
        'food': couponsLanguage.FOOD[language]
    }
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">{couponsLanguage.COUPONS[language]}</h1>
            {coupons.length > 0 ? (
                <table className="w-full border-collapse border border-gray-200">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 px-4 py-2">{couponsLanguage.ID[language]}</th>
                            <th className="border border-gray-300 px-4 py-2">
                                {couponsLanguage.COUPON_TYPE[language]}
                            </th>
                            <th className="border border-gray-300 px-4 py-2">
                                {couponsLanguage.AMOUNT[language]}
                            </th>
                            <th className="border border-gray-300 px-4 py-2">
                                {couponsLanguage.EXPIRY_DATE[language]}
                            </th>
                            <th className="border border-gray-300 px-4 py-2">
                                {couponsLanguage.CREATED_DATE[language]}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.map((coupon, index) => (
                            <tr key={index}>
                                <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                                <td className="border border-gray-300 px-4 py-2 capitalize">{balanceTypes[coupon.type]}</td>
                                <td className="border border-gray-300 px-4 py-2">{coupon.amount} TL</td>
                                <td className="border border-gray-300 px-4 py-2">
                                    {new Date(coupon.expiryDate).toLocaleDateString()}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                    {new Date(coupon.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>{couponsLanguage.NO_COUPON_SAVED[language]}</p>
            )}
        </div>
    );
};

export default Coupons;
