import type { Token } from "@lifi/types";
import type {
  Account,
  Address,
  Chain,
  Hash,
  HttpTransport,
  PublicClient,
  WalletClient,
  Log,
  Abi,
} from "viem";
import * as viemChains from "viem/chains";
import { WalletProvider } from "../providers/wallet";

const _SupportedChainList = Object.keys(viemChains) as Array<
  keyof typeof viemChains
>;
export type SupportedChain = (typeof _SupportedChainList)[number];

// Transaction types
export interface Transaction {
  hash: Hash;
  from: Address;
  to: Address;
  value: bigint;
  data?: `0x${string}`;
  chainId?: number;
  logs?: Log[];
}

// Token types
export interface TokenWithBalance {
  token: Token;
  balance: bigint;
  formattedBalance: string;
  priceUSD: string;
  valueUSD: string;
}

export interface WalletBalance {
  chain: SupportedChain;
  address: Address;
  totalValueUSD: string;
  tokens: TokenWithBalance[];
}

// Chain configuration
export interface ChainMetadata {
  chainId: number;
  name: string;
  chain: Chain;
  rpcUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrl: string;
}

export interface ChainConfig {
  chain: Chain;
  publicClient: PublicClient<HttpTransport, Chain, Account | undefined>;
  walletClient?: WalletClient;
}

// Action parameters
export interface TransferParams {
  fromChain: SupportedChain;
  toAddress: Address;
  amount: string;
  data?: `0x${string}`;
}

// Plugin configuration
export interface EvmPluginConfig {
  rpcUrl?: {
    ethereum?: string;
    abstract?: string;
    base?: string;
    sepolia?: string;
    bsc?: string;
    arbitrum?: string;
    avalanche?: string;
    polygon?: string;
    optimism?: string;
    cronos?: string;
    gnosis?: string;
    fantom?: string;
    fraxtal?: string;
    klaytn?: string;
    celo?: string;
    moonbeam?: string;
    aurora?: string;
    harmonyOne?: string;
    moonriver?: string;
    arbitrumNova?: string;
    mantle?: string;
    linea?: string;
    scroll?: string;
    filecoin?: string;
    taiko?: string;
    zksync?: string;
    canto?: string;
    alienx?: string;
    gravity?: string;
  };
  secrets?: {
    EVM_PRIVATE_KEY: string;
  };
  testMode?: boolean;
  multicall?: {
    batchSize?: number;
    wait?: number;
  };
}

// Provider types
export interface TokenData extends Token {
  symbol: string;
  decimals: number;
  address: Address;
  name: string;
  logoURI?: string;
  chainId: number;
}

export interface TokenPriceResponse {
  priceUSD: string;
  token: TokenData;
}

export interface TokenListResponse {
  tokens: TokenData[];
}

export interface ProviderError extends Error {
  code?: number;
  data?: unknown;
}

export interface FaucetParams {
  chain: SupportedChain;
}
export interface LiquidityParams {
  chain: SupportedChain;
  olame?: string;
  celo?: string;
  olameLp?: string;
}


export interface InfoParams {
  chain: SupportedChain;
  amountToSwap: string;
  celoBalance?: string;
  reservedIcebear?: string;
}

export interface ContractCallParams {
  walletClient?: WalletClient;
  publicClient: PublicClient;
  address: Address;
  abi: Abi;
  functionName;
  args;
}

export interface OpportunityParams {
  chain: SupportedChain;
  rewards?: string | null;
  apr?: string | null;
  moreTvl?: string | null;
}

