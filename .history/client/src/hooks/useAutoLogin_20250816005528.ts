import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import { setUserLoading, setUser, clearUser } from "@/redux/userSlice";
import { auth } from "@/auth/firebase";
import axios from "axios";

export const useAutoLogin = () => {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            dispatch(setUserLoading(true));

            if (!user) {
                dispatch(clearUser());
                dispatch(setUserLoading(false));
                // console.log("no user found")
                
                return;
            }

            try {
                const idToken = await user.getIdToken();
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/user/get_user`, {
                    headers: { Authorization: `Bearer ${idToken}` }
                });

                dispatch(setUser(res.data));
            } catch (err) {
                console.error("Auto login error:", err);
                dispatch(clearUser());
            } finally {
                dispatch(setUserLoading(false));
            }
        });

        return () => unsubscribe();
    }, [dispatch]);
};
