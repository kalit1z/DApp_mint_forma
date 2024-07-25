import React, { useState, useEffect, useMemo } from "react";
import { useAccount, useContractRead, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { contractDaoAddress, contractDaoAbi, contractAddress, contractAbi } from '@/constants';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

const DaoPage = () => {
  const { address } = useAccount();
  const [description, setDescription] = useState('');
  const [choice1, setChoice1] = useState('');
  const [choice2, setChoice2] = useState('');
  const [duration, setDuration] = useState('');

  // State for voting
  const [tokenId, setTokenId] = useState('');
  const [voteChoice, setVoteChoice] = useState('');
  const [selectedProposalId, setSelectedProposalId] = useState(null);
  const [voteSubmitted, setVoteSubmitted] = useState(false);

  // State for proposals
  const [proposals, setProposals] = useState([]);
  const [currentProposalId, setCurrentProposalId] = useState(0);
  const [loading, setLoading] = useState(true);

  // State for NFT balance
  const [balanceOf, setBalanceOf] = useState(0);

  const { data: hash, isPending: isVotingPending, error: writeError, writeContract } = useWriteContract();
  const { data: proposal, error: readError } = useContractRead({
    address: contractDaoAddress,
    abi: contractDaoAbi,
    functionName: 'proposals',
    args: [currentProposalId],
    enabled: currentProposalId !== null
  });

  const { data: balanceOfData } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'balanceOf',
    args: [address],
  });

  const isOwner = useMemo(() => {
    return address && address.toLowerCase() === '0xba9fbb31ce4ab06c721981b3f34ad61890dca462';
  }, [address]);

  useEffect(() => {
    if (proposal && proposal[0] && proposal[0] !== '') {
      setProposals(prev => [{ ...proposal, id: currentProposalId }, ...prev]);
      setCurrentProposalId(prevId => prevId + 1);
    } else {
      setLoading(false);
    }
  }, [proposal, currentProposalId]);

  useEffect(() => {
    if (currentProposalId !== null && loading) {
      fetchProposal(currentProposalId);
    }
  }, [currentProposalId, loading]);

  useEffect(() => {
    const fetchBalance = () => {
      if (address) {
        if (balanceOfData !== undefined) {
          const balance = Number(balanceOfData.toString());
          setBalanceOf(balance);
          console.log('Balance:', balanceOfData.toString());
        }
      }
    };

    fetchBalance();

    const intervalId = setInterval(fetchBalance, 100000000);

    return () => clearInterval(intervalId);
  }, [address, balanceOfData]);

  const fetchProposal = async (id) => {
    try {
      setCurrentProposalId(id);
    } catch (error) {
      console.error("Error fetching proposal:", error);
      setLoading(false);
    }
  };

  const createProposal = async () => {
    try {
      await writeContract({
        address: contractDaoAddress,
        abi: contractDaoAbi,
        functionName: 'createProposal',
        args: [description, choice1, choice2, duration],
        account: address
      });
      console.log("Proposal created:", hash);
    } catch (err) {
      console.error("Error creating proposal:", err.message);
    }
  };

  const voteOnProposal = async () => {
    try {
      await writeContract({
        address: contractDaoAddress,
        abi: contractDaoAbi,
        functionName: 'vote',
        args: [selectedProposalId, tokenId, voteChoice],
        account: address
      });
      console.log("Vote submitted:", hash);
      setVoteSubmitted(true);
    } catch (err) {
      console.error("Error submitting vote:", err.message);
    }
  };

  const handleSubmitProposal = (event) => {
    event.preventDefault();
    event.stopPropagation();
    createProposal();
  };

  const handleSubmitVote = (event) => {
    event.preventDefault();
    event.stopPropagation();
    voteOnProposal();
  };

  const { isLoading: isCreatingProposal, isSuccess: proposalCreated } = useWaitForTransactionReceipt({ hash });

  const getEndDate = (proposal) => {
    if (proposal) {
      const startTime = Number(proposal[3]);
      const duration = Number(proposal[4]);
      const endTime = new Date(startTime * 1000 + duration * 1000);
      return endTime;
    }
    return new Date();
  };

  const getProposalStatus = (proposal) => {
    const endDate = getEndDate(proposal);
    const now = new Date();
    const startDate = new Date(Number(proposal[3]) * 1000);
    if (now < startDate) return "Pas encore commencée";
    return now < endDate ? "En cours" : "Terminée";
  };

  if (balanceOf < 1) {
    return (
      <Alert>
        <div style={{ textAlign: 'center' }}>
          <ExclamationTriangleIcon style={{ display: 'block', margin: '0 auto', color: 'orange' }} />
          <p>Le Christ Cosmique ne vous a pas donné l'autorisation de voir le contenu.</p>
        </div>
      </Alert>
    );
  }

  return (
    
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div className="home">
      <div className="home_inner p-4 md:p-0"> {/* Added padding for mobile */}
        <h1 className="home_inner_title">
            Votre opinion compte ! <br/>
          <span className="home_inner_title_colored"> Ici, vous pouvez </span>  voter pour la
          <span className="home_inner_title_colored"> suite du projet !</span>
        </h1>
      </div>
    </div>
      {/* Voting form at the top */}
      {selectedProposalId !== null && (
        <Card style={{
          width: '100%',
          maxWidth: '500px',
          marginBottom: '20px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h3>Voter sur la proposition {selectedProposalId}</h3>
          <form onSubmit={handleSubmitVote} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <label>Token ID</label>
              <Input
                type="number"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                required
              />
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <label>Choice (1 or 2)</label>
              <Input
                type="number"
                value={voteChoice}
                onChange={(e) => setVoteChoice(e.target.value)}
                min="1"
                max="2"
                required
              />
            </div>
            <Button type="submit" disabled={isVotingPending}>
              {isVotingPending ? 'Submitting Vote...' : 'Submit Vote'}
            </Button>
            {writeError && <p style={{ color: 'red' }}>Il y a eu une erreur lors de la soumission du vote.</p>}
            {voteSubmitted && <p style={{ color: 'green' }}>Votre vote a bien été pris en compte</p>}
          </form>
        </Card>
      )}

      {loading ? (
        <p>Chargement ...'Rechargez la page si nécessaire.'</p>
      ) : (
        proposals.map((proposal) => {
          const status = getProposalStatus(proposal);
          return (
            <Card key={proposal.id} style={{
              width: '100%',
              maxWidth: '500px',
              marginBottom: '20px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <b><h2 className="home_inner_description" style={{ marginBottom: '20px'}}>{status}</h2></b>
              
              <p><strong>Description:</strong> {proposal[0] || 'N/A'}</p>
              <p><strong>Option 1:</strong> {proposal[1] || 'N/A'}</p>
              <p><strong>Option 2:</strong> {proposal[2] || 'N/A'}</p>
              <p><strong>Date de fin:</strong> {getEndDate(proposal).toLocaleString()}</p>
              
              {status !== "En cours ou relancer la page" && (
                <>
                  <p><strong>Vote Option 1:</strong> {proposal[5] ? Number(proposal[5]).toString() : '0'}</p>
                  <p><strong>Vote Option 2:</strong> {proposal[6] ? Number(proposal[6]).toString() : '0'}</p>
                </>
              )}
              
              {status === "En cours" && (
                <Button onClick={() => setSelectedProposalId(proposal.id)}>Sélectionnez cette proposition pour voter</Button>
              )}
            </Card>
          );
        })
      )}

      {isOwner && (
        <Card style={{
          width: '100%',
          maxWidth: '500px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <form onSubmit={handleSubmitProposal} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <label>Description</label>
              <Input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <label>Option 1</label>
              <Input
                type="text"
                value={choice1}
                onChange={(e) => setChoice1(e.target.value)}
                required
              />
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <label>Option 2</label>
              <Input
                type="text"
                value={choice2}
                onChange={(e) => setChoice2(e.target.value)}
                required
              />
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <label>Durée (in seconds)</label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={isCreatingProposal}>
              {isCreatingProposal ? 'Création ...' : 'Créer une proposition'}
            </Button>
            {writeError && <p style={{ color: 'red' }}>Une erreur est survenue lors de la création de la proposition</p>}
            {proposalCreated && <p style={{ color: 'green' }}>Proposition créée avec succès !</p>}
          </form>
        </Card>
      )}
    </div>
  );
};

export default DaoPage;