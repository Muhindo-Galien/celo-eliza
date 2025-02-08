
export * from "./actions/transfer";
export * from "./providers/wallet";
export * from "./types";

import type { Plugin } from "@elizaos/core";
import { transferAction } from "./actions/transfer";
import { faucetAction } from "./actions/faucet";
import { evmWalletProvider } from "./providers/wallet";

export const evmPlugin: Plugin = {
  name: "evm",
  description: "EVM blockchain integration plugin",
  providers: [evmWalletProvider],
  evaluators: [],
  services: [],
  actions: [transferAction,faucetAction],
};

export default evmPlugin;
