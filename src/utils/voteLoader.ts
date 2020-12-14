import { getRepository } from 'typeorm';
import DataLoader from "dataloader";
import { Vote } from "../entities/Vote";

type CompoundKey = {postId: string, userId: string}

export const voteLoader = () => new DataLoader<CompoundKey, Vote | null>(
  async (keys) => {
    const voteRepo = getRepository(Vote)
    const votes = await voteRepo.findByIds(keys as any)
    const voteIds2Votes: Record<string, Vote> = {}
    
    votes.forEach(vote => {
      voteIds2Votes[`${vote.userId}-${vote.postId}`] = vote;
    });

    // group by id
    return keys.map(key => voteIds2Votes[`${key.userId}-${key.postId}`])
  } 
)