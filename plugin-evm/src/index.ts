export * from "./actions/bridge";
export * from "./actions/swap";
export * from "./actions/transfer";
export * from "./providers/wallet";
export * from "./actions/faucet";
export * from "./types";

import type { Plugin } from "@elizaos/core";
import { bridgeAction } from "./actions/bridge";
import { swapAction } from "./actions/swap";
import { transferAction } from "./actions/transfer";
import { faucetAction } from "./actions/faucet";
import { evmWalletProvider } from "./providers/wallet";

export const evmPlugin: Plugin = {
  name: "evm",
  description: "EVM blockchain integration plugin",
  providers: [evmWalletProvider],
  evaluators: [],
  services: [],
  actions: [transferAction, bridgeAction, swapAction, faucetAction],
};

export default evmPlugin;
