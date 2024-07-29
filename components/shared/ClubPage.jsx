import React, { useEffect, useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { contractAddress, contractAbi } from '@/constants';
import { Alert } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SunIcon, EyeOpenIcon, FaceIcon } from "@radix-ui/react-icons";

const ClubPage = () => {
  const { address } = useAccount();
  const { data: balanceOfData } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'balanceOf',
    args: [address], // Notez l'utilisation de 'args' au lieu de 'functionArgs'
  });

  const [balanceOf, setBalanceOf] = useState(0);

  useEffect(() => {
    const fetchBalance = () => {
      if (address) {
        // Assure-toi que balanceOfData est bien défini avant de l'utiliser
        if (balanceOfData !== undefined) {
          const balance = Number(balanceOfData.toString());
          setBalanceOf(balance);
          console.log('Balance:', balanceOfData.toString()); // Log de la balance
        }
      }
    };

    // Effectue la vérification initiale
    fetchBalance();

    // Définir un intervalle pour les vérifications régulières
    const intervalId = setInterval(fetchBalance, 100000000); // 10000 ms = 10 secondes

    // Nettoyer l'intervalle lors du démontage du composant
    return () => clearInterval(intervalId);
  }, [address, balanceOfData]);

  // Vérifier si l'utilisateur a au moins un NFT dans son portefeuille
  if (balanceOf >= 1) {
    return (
        <div className="home">
        <div className="home_inner p-4 md:p-0"> {/* Added padding for mobile */}
          <h1 className="home_inner_title">
          Bienvenue, 
            <span className="home_inner_title_colored"> Astraliens </span>
          </h1>
          <p className="home_inner_description">
          Vous faites désormais partie des nôtres. <br/> Voici ce à quoi vous avez accès :
          </p>
          <div className="home_inner_links">
          <Link href="club/dao" className="">
            <Button className="home_inner_links_button2">
              <FaceIcon className="mr-2" />DAO
            </Button>
          </Link>
        </div>
          <div className="home_inner_links">
<Link href="https://forge-monnaie.vercel.app">
  <Button className="home_inner_links_button1 hover:bg-[#C8B1F4]">
    <SunIcon className="mr-2" />Créez votre token
  </Button>
</Link>
        </div>
          <div className="home_inner_links">
<Link href="https://forge-monnaie.vercel.app">
  <Button className="home_inner_links_button1 hover:bg-[#C8B1F4]">
    <SunIcon className="mr-2" />à suivre
  </Button>
</Link>
        </div>
        </div>
      </div>
    );
  } else {
    return (
      <Alert>
        <div style={{ textAlign: 'center' }}>
          <ExclamationTriangleIcon style={{ display: 'block', margin: '0 auto', color: 'orange' }} />
          <p>Le Christ Cosmique ne vous a pas donné l'autorisation de voir le contenu.</p>
        </div>
      </Alert>
      
    );
  }
};

export default ClubPage;
