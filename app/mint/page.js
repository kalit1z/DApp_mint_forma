'use client';

import NotConnected from "@/components/shared/NotConnected";
import MintPage from "@/components/shared/MintPage";

import { useAccount } from "wagmi";

const page = () => {

    const { isConnected } = useAccount();

    return (
        <div>
            {isConnected ? (
                <MintPage />
            ) : (
                <NotConnected />
            )}
        </div>
    )
}

export default page