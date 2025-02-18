import { ContractCallParams } from "./types";

export const round = (num) => {
  const arr = num.split(".");
  const firstPart = arr[0];
  const secondPart = arr[1].substring(0, 2);
  return firstPart + "." + secondPart;
};

export type Token = {
  price: number;
  symbol: string;
};

export type Pool = {
  tvl: number;
  apr: number;
  dailyRewards: number;
  tokens: Token[];
};

export const callReadContract = async ({
  publicClient,
  address,
  abi,
  functionName,
  args,
}: ContractCallParams) => {
  return await publicClient.readContract({
    address,
    abi,
    functionName,
    args,
  });
};

export const callWriteContract = async ({
  walletClient,
  publicClient,
  address,
  abi,
  functionName,
  args,
}: ContractCallParams) => {
  const { request } = await publicClient.simulateContract({
    address,
    abi,
    functionName,
  });
  await walletClient.writeContract(request);
};
