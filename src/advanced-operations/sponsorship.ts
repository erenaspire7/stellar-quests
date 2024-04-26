import {
  Keypair,
  TransactionBuilder,
  Networks,
  Operation,
  BASE_FEE,
} from "@stellar/stellar-sdk";
import { airdrop, executeTx, server } from "../helper";

(async () => {
  const questKeypair = Keypair.fromSecret(
    "SCMLYICT3IRINSVUIT6JMTQ4QZ7VWRF2IGJSINV7GHWVRLYCSDIJOB54"
  );

  const sponsorKeypair = Keypair.random();

  await airdrop([sponsorKeypair]);
  const sponsorAccount = await server.loadAccount(sponsorKeypair.publicKey());

  const transaction = new TransactionBuilder(sponsorAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.beginSponsoringFutureReserves({
        sponsoredId: questKeypair.publicKey(),
      })
    )
    .addOperation(
      Operation.createAccount({
        destination: questKeypair.publicKey(),
        startingBalance: "0",
      })
    )
    .addOperation(
      Operation.endSponsoringFutureReserves({
        source: questKeypair.publicKey(),
      })
    )
    .setTimeout(300)
    .build();

  transaction.sign(sponsorKeypair, questKeypair);

  await executeTx(transaction);
})();
