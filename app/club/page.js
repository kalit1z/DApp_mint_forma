'use client';

import NotConnected from "@/components/shared/NotConnected";
import { useAccount } from "wagmi";
import ClubPage from "@/components/shared/ClubPage";

const page = () => {

    const { isConnected } = useAccount();

    return (
        <div>
            {isConnected ? (
                <ClubPage />
            ) : (
                <NotConnected />
            )}
        </div>
    )
}

export default page