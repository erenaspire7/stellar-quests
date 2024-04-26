import { Keypair } from "@stellar/stellar-sdk";

import { Server } from "@stellar/stellar-sdk/lib/horizon";

export const server = new Server("https://horizon-testnet.stellar.org");

export const airdrop = async (accounts: Keypair[]) => {
  for (let account of accounts) {
    try {
      const response = await fetch(
        `https://friendbot.stellar.org?addr=${encodeURIComponent(
          account.publicKey()
        )}`
      );
      const responseJSON = await response.json();
    //   console.log("SUCCESS! You have a new account :)\n", responseJSON);
    } catch (e) {
      console.error("ERROR!", e);
    }
  }
};

export const executeTx = async (transaction) => {
  try {
    let res = await server.submitTransaction(transaction);
    console.log(`Transaction Successful! Hash: ${res.hash}`);
  } catch (error) {
    console.log(
      `${error}. More details:\n${JSON.stringify(
        error.response.data.extras,
        null,
        2
      )}`
    );
  }
};

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
