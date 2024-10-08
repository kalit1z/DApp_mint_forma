import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWalletClient } from 'wagmi';
import { contractAddress, contractAbi } from '@/constants';
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { parseEther, Contract } from 'ethers';

const MintPage = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { data: saleStartTimeData } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'saleStartTime',
  });
  const { data: totalSupplyData } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'totalSupply',
  });

  const [saleStartTime, setSaleStartTime] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [message, setMessage] = useState('');
  const [totalSupply, setTotalSupply] = useState(0);
  const [isMinting, setIsMinting] = useState(false);
  const [mintError, setMintError] = useState('');
  const [mintSuccess, setMintSuccess] = useState(false);

  useEffect(() => {
    if (saleStartTimeData) {
      const saleStartTimeValue = saleStartTimeData.toString();
      const saleStartTimeNumber = Number(saleStartTimeValue);

      setSaleStartTime(saleStartTimeNumber);

      const currentTime = Math.floor(Date.now() / 1000);

      if (saleStartTimeNumber > currentTime) {
        const saleDate = new Date(saleStartTimeNumber * 1000);
        setMessage(`Préparez-vous car la révélation sera à ${saleDate.toLocaleString()}`);
        setShowAlert(true);
        setShowImage(false);
      } else {
        setMessage('');
        setShowAlert(false);
        setShowImage(true);
      }
    }
  }, [saleStartTimeData]);

  useEffect(() => {
    if (totalSupplyData) {
      setTotalSupply(Number(totalSupplyData.toString()));
    }
  }, [totalSupplyData]);

  const mint = async (numberOfNFTs) => {
    setIsMinting(true);
    setMintError('');
    setMintSuccess(false);

    try {
      if (!walletClient) {
        throw new Error("Wallet client not available");
      }

      const contract = new Contract(contractAddress, contractAbi, walletClient);
      const value = parseEther((0 * numberOfNFTs).toString());

      const transaction = await contract.mint(numberOfNFTs, { value });
      const receipt = await transaction.wait();

      if (receipt.status === 1) {
        const newTotalSupply = await contract.totalSupply();
        setTotalSupply(Number(newTotalSupply.toString()));
        setMintSuccess(true);
      } else {
        throw new Error("La transaction a échoué, mais sans erreur critique.");
      }
    } catch (e) {
      console.error(e);
      setMintError("Une erreur s'est produite lors du minting. Veuillez réessayer.");
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="container">
      {showAlert && (
        <Alert>
          <div style={{ textAlign: 'center' }}>
            <ExclamationTriangleIcon style={{ display: 'block', margin: '0 auto', color: 'orange' }} />
            <p>{message}</p>
          </div>
        </Alert>
      )}
      {!showAlert && (
        <Card className="card">
          <div className="content">
            <div className="text-content">
              <h2>GOAT OF WEB3</h2>
              <p>C'est gratuit !</p>
              <p>{totalSupply}/499</p>
              <div className="button-group">
                <Button variant="outline" disabled={isMinting} onClick={() => mint(1)}>
                  Mint 1 NFT
                </Button>
              </div>
              {isMinting && <p className="status">Minting en cours...</p>}
              {mintSuccess && <p className="success">Votre(s) NFT(s) a/ont été minté(s) avec succès !</p>}
            </div>
            {showImage && (
              <div className="image-container">
                <Image src="/imgMint.png" alt="Mint Image" width={600} height={600} style={{ maxWidth: '100%', height: 'auto' }} />
              </div>
            )}
          </div>
        </Card>
      )}

      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px;
        }

        .card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 30px;
          max-width: 1000px;
          width: 90%;
          margin-top: 20px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .content {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          width: 100%;
          gap: 20px;
        }

        .text-content {
          flex: 1;
          text-align: center;
          font-family: Arial, sans-serif;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .text-content h2 {
          font-size: 32px;
          font-weight: bold;
          color: #333;
          margin-bottom: 20px;
        }

        .text-content p {
          font-size: 24px;
          color: #555;
          margin-bottom: 10px;
        }

        .text-content p:last-child {
          font-size: 20px;
          color: #777;
        }

        .button-group {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-top: 20px;
        }

        .status {
          margin-top: 10px;
          color: blue;
        }

        .error {
          color: red;
          margin-top: 10px;
        }

        .success {
          color: green;
          margin-top: 10px;
        }

        .image-container {
          flex: 1;
          text-align: center;
        }

        @media (max-width: 767px) {
          .content {
            flex-direction: column;
            align-items: center;
          }

          .text-content {
            margin-right: 0;
            text-align: center;
            margin-bottom: 20px;
          }

          .image-container {
            width: 100%;
            text-align: center;
          }

          .image-container img {
            width: 90%;
            height: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default MintPage;
