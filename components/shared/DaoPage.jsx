import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
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

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  useEffect(() => {
    if (address && address.toLowerCase() === '0xba9fbb31ce4ab06c721981b3f34ad61890dca462') {
      setIsOwner(true);
    } else {
      setIsOwner(false);
    }
  }, [address]);

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

  const handleSubmit = (event) => {
    event.preventDefault();
    createProposal();
  };

  const { isLoading: isCreatingProposal, isSuccess: proposalCreated } = useWaitForTransactionReceipt({ hash });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <p style={{
        fontSize: '24px',
        fontWeight: 'bold'
      }}>
        Bonjour
      </p>
      {isOwner && (
        <Card style={{
          width: '100%',
          maxWidth: '500px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <form onSubmit={handleSubmit} style={{
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
            {error && <p style={{ color: 'red' }}>There was an error</p>}
            {proposalCreated && <p style={{ color: 'green' }}>Proposal created successfully!</p>}
          </form>
        </Card>
      )}
    </div>
  );
};

export default DaoPage;
