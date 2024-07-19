import React, { useState, useEffect } from "react";
import { useAccount, useContractRead, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { contractDaoAddress, contractDaoAbi } from '@/constants';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DaoPage = () => {
  const { address } = useAccount();
  const [isOwner, setIsOwner] = useState(false);
  const [description, setDescription] = useState('');
  const [choice1, setChoice1] = useState('');
  const [choice2, setChoice2] = useState('');
  const [duration, setDuration] = useState('');

  // State for voting
  const [tokenId, setTokenId] = useState('');
  const [voteChoice, setVoteChoice] = useState('');
  const [selectedProposalId, setSelectedProposalId] = useState(null);

  // State for proposals
  const [proposals, setProposals] = useState([]);
  const [currentProposalId, setCurrentProposalId] = useState(0);
  const [loading, setLoading] = useState(true);

  const { data: hash, isPending, error: writeError, writeContract } = useWriteContract();
  const { data: proposal, error: readError } = useContractRead({
    address: contractDaoAddress,
    abi: contractDaoAbi,
    functionName: 'proposals',
    args: [currentProposalId],
    enabled: currentProposalId !== null
  });

  useEffect(() => {
    if (address && address.toLowerCase() === '0xba9fbb31ce4ab06c721981b3f34ad61890dca462') {
      setIsOwner(true);
    } else {
      setIsOwner(false);
    }
  }, [address]);

  useEffect(() => {
    if (proposal && proposal[0] && proposal[0] !== '') {
      setProposals(prev => [proposal, ...prev]);
      setCurrentProposalId(prevId => prevId + 1);
    } else {
      // Stop loading when no more proposals are returned
      setLoading(false);
    }
  }, [proposal]);

  useEffect(() => {
    if (currentProposalId !== null) {
      fetchProposal(currentProposalId);
    }
  }, [currentProposalId]);

  const fetchProposal = async (id) => {
    try {
      setCurrentProposalId(id);
    } catch (error) {
      console.error("Error fetching proposal:", error);
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
    } catch (err) {
      console.error("Error submitting vote:", err.message);
    }
  };

  const handleSubmitProposal = (event) => {
    event.preventDefault();
    createProposal();
  };

  const handleSubmitVote = (event) => {
    event.preventDefault();
    voteOnProposal();
  };

  const { isLoading: isCreatingProposal, isSuccess: proposalCreated } = useWaitForTransactionReceipt({ hash });

  // Fonction pour calculer la date de fin
  const getEndDate = (proposal) => {
    if (proposal) {
      const startTime = Number(proposal[3]);
      const duration = Number(proposal[4]);
      const endTime = new Date(startTime * 1000 + duration * 1000);
      console.log("End Time Calculated:", endTime); // Log calculated end time
      return endTime;
    }
    return new Date();
  };

  // Fonction pour déterminer le statut de la proposition
  const getProposalStatus = (proposal) => {
    const endDate = getEndDate(proposal);
    const now = new Date();
    return now < endDate ? "En cours" : "Terminée";
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px'
    }}>
      {/* Display all proposals */}
      {loading ? (
        <p>Loading proposals...</p>
      ) : (
        proposals.map((proposal, index) => {
          const status = getProposalStatus(proposal);
          return (
            <Card key={index} style={{
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
              <p><strong>End Date & Time:</strong> {getEndDate(proposal).toLocaleString()}</p>
              <p><strong>Vote Count 1:</strong> {proposal[5] ? Number(proposal[5]).toString() : '0'}</p>
              <p><strong>Vote Count 2:</strong> {proposal[6] ? Number(proposal[6]).toString() : '0'}</p>
              
              {/* Select this proposal to vote */}
              {status === "En cours" && (
                <Button onClick={() => setSelectedProposalId(currentProposalId)}>Select this Proposal to Vote</Button>
              )}
            </Card>
          );
        })
      )}

      {/* Form to vote on the selected proposal */}
      {selectedProposalId !== null && (
        <div style={{ marginTop: '20px' }}>
          <h3>Voter sur la proposition {selectedProposalId}</h3>
          <Card style={{
            width: '100%',
            maxWidth: '500px',
            padding: '20px',
            textAlign: 'center'
          }}>
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
                  required
                />
              </div>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Submitting Vote...' : 'Submit Vote'}
              </Button>
              {writeError && <p style={{ color: 'red' }}>There was an error submitting the vote</p>}
            </form>
          </Card>
        </div>
      )}

      {/* Form to create a proposal */}
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
              <label>Duration (in seconds)</label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating Proposal...' : 'Create Proposal'}
            </Button>
            {writeError && <p style={{ color: 'red' }}>There was an error creating the proposal</p>}
            {proposalCreated && <p style={{ color: 'green' }}>Proposal created successfully!</p>}
          </form>
        </Card>
      )}
    </div>
  );
};

export default DaoPage;
