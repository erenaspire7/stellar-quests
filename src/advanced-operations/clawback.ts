import {
  Keypair,
  TransactionBuilder,
  Networks,
  Operation,
  BASE_FEE,
  AuthRevocableFlag,
  AuthClawbackEnabledFlag,
  Asset,
} from "@stellar/stellar-sdk";
import { executeTx, server, airdrop } from "../helper";

(async () => {
  const questKeypair = Keypair.fromSecret(
    "SC7E5RPSQZHZAKM646TSY4UHUEXFCDM6FASCJ2J6HW7AJEI3KBGEFXKD"
  );
  const destinationKeypair = Keypair.random();

  await airdrop([destinationKeypair]);

  const questAccount = await server.loadAccount(questKeypair.publicKey());

  const transaction = new TransactionBuilder(questAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.setOptions({
        setFlags: AuthClawbackEnabledFlag || AuthRevocableFlag,
      })
    )
    .setTimeout(30)
    .build();

  transaction.sign(questKeypair);

  await executeTx(transaction);

  const clawbackAsset = new Asset("CLAWBACK", questKeypair.publicKey());

  const paymentTransaction = new TransactionBuilder(questAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.changeTrust({
        asset: clawbackAsset,
        source: destinationKeypair.publicKey(),
      })
    )
    .addOperation(
      Operation.payment({
        destination: destinationKeypair.publicKey(),
        asset: clawbackAsset,
        amount: "500",
      })
    )
    .setTimeout(30)
    .build();

  paymentTransaction.sign(questKeypair, destinationKeypair);

  await executeTx(paymentTransaction);

  const clawbackTransaction = new TransactionBuilder(questAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.clawback({
        asset: clawbackAsset,
        amount: "250",
        from: destinationKeypair.publicKey(),
      })
    )
    .setTimeout(30)
    .build();

  clawbackTransaction.sign(questKeypair);
  await executeTx(clawbackTransaction);
})();
