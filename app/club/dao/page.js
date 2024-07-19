'use client';

import DaoPage from "@/components/shared/DaoPage";
import NotConnected from "@/components/shared/NotConnected";
import { useAccount } from "wagmi";

const page = () => {

    const { isConnected } = useAccount();

    return (
        <div>
            {isConnected ? (
                <DaoPage />
            ) : (
                <NotConnected />
            )}
        </div>
    )
}

export default page