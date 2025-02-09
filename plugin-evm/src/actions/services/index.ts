import { Account, type Hex, type WalletClient, encodeFunctionData, type Abi } from "viem";
import { TOKEN_CONTRACT_ABI } from "../../contracts/artifacts";

// This can be used to  send any transaction on any wallet by passing the required arguments

export async function sendTransaction(
  walletClient: WalletClient,
  account: Account,
  to: `0x${string}`,
  value: bigint,
  data: Hex,
  chain: any
): Promise<Hex> {
  return await walletClient.sendTransaction({
    account,
    to,
    value,
    data,
    chain,
    kzg: {
      blobToKzgCommitment: (_blob) => {
        throw new Error("Function not implemented.");
      },
      computeBlobKzgProof: (_blob, _commitment) => {
        throw new Error("Function not implemented.");
      },
    },
  });
}

// Customized for Faucet trasction data only
export function getFaucetTxData(functionName: string, args: any[]): Hex {
  return encodeFunctionData({
    abi: TOKEN_CONTRACT_ABI,
    functionName,
    args,
  });
}

// This can be used for any trasction data on any contract by passing the required arguments
export function getTxData(abi:Abi,functionName: string, args: any[]): Hex {
  return encodeFunctionData({
    abi,
    functionName,
    args,
  });
}