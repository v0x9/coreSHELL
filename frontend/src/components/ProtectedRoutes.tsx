import {Navigate} from "react-router-dom";

import { useAuthStore } from "../stores/authStore";



interface ProtectedRoutesProps {

    children?: React.ReactNode;

}

export default function ProtectedRoutes({children}: ProtectedRoutesProps) {
    const { isAuthenticated, loading } = useAuthStore();
    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }

    return children;

}