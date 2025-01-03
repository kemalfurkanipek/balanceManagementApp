import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { setBalances } from "../redux/slices/balancesSlice";
import { setLanguage } from "../redux/slices/languageSlice";
import { homePagesLanguage } from "../literals";

const HomePage = () => {
    const user = useSelector((state) => state.user.userInfo);
    const balances = useSelector((state) => state.balances.balances);
    const language = useSelector((state) => state.language.currentLanguage);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            try {
                const balancesDocRef = doc(db, "users", user.uid);
                const balancesDocSnap = await getDoc(balancesDocRef);
                if (balancesDocSnap.exists()) {
                    dispatch(setBalances(balancesDocSnap.data().balances));
                } else {
                    console.error("Kullanıcı bakiyeleri bulunamadı.");
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
                console.error("Veriler alınırken hata oluştu:", error);
            }
        };

        fetchData();
    }, [user, dispatch]);

    if (!user) {
        return <div>Loading</div>;
    }
    let balanceTypes = {
        'cash': homePagesLanguage.CASH[language],
        'fuel': homePagesLanguage.FUEL[language],
        'roadPass': homePagesLanguage.ROAD_PASS[language],
        'flight': homePagesLanguage.FLIGHT[language],
        'food': homePagesLanguage.FOOD[language]
    }
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">{homePagesLanguage.BALANCES[language]}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(balances).map(([type, amount]) => (
                    <div
                        key={type}
                        className="p-4 bg-white shadow rounded flex flex-col items-center"
                    >
                        <h3 className="text-lg font-semibold capitalize">
                            {balanceTypes[type]}
                        </h3>
                        <p className="text-xl font-bold text-blue-600">{amount} TL</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HomePage;
