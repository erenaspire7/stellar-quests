import {
  Keypair,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  BASE_FEE,
} from "@stellar/stellar-sdk";

import { airdrop, executeTx, server } from "./../helper";

(async () => {
  const questKeypair = Keypair.fromSecret(
    "SBD67YY4YG6HCKUBM7A3VZI6N7UORRZGPB5TA3DHNDB5JIQDARWXEJEP"
  );

  const senderKeypair = Keypair.random();
  const destinationKeypair = Keypair.random();

  await airdrop([senderKeypair, destinationKeypair]);

  const senderAccount = await server.loadAccount(senderKeypair.publicKey());

  const innerTx = new TransactionBuilder(senderAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.payment({
        destination: destinationKeypair.publicKey(),
        asset: Asset.native(),
        amount: "100",
        source: senderKeypair.publicKey(),
      })
    )
    .setTimeout(30)
    .build();

  innerTx.sign(senderKeypair);

  let feeBumpTransaction = TransactionBuilder.buildFeeBumpTransaction(
    questKeypair,
    BASE_FEE,
    innerTx,
    Networks.TESTNET
  );

  feeBumpTransaction.sign(questKeypair);

  await executeTx(feeBumpTransaction);
})();
