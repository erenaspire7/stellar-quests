import {
  Keypair,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  BASE_FEE,
} from "@stellar/stellar-sdk";

import { airdrop, executeTx, server } from "./helper";

(async () => {
  const questKeypair = Keypair.fromSecret(
    "SBBXANFNZYS2YGS2F7UOMCFIK77YEZ6A7KHGC6DSL6SSYQDGCKAIHFWF"
  );

  const issuerKeypair = Keypair.random();
  const distributorKeypair = Keypair.random();
  const destinationKeypair = Keypair.random();

  await airdrop([issuerKeypair, distributorKeypair, destinationKeypair]);
  const questAccount = await server.loadAccount(questKeypair.publicKey());

  // Create Asset / Build Trustline
  const customAsset = new Asset("USDC", issuerKeypair.publicKey());

  const tx = new TransactionBuilder(questAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.changeTrust({
        asset: customAsset,
        source: destinationKeypair.publicKey(),
      })
    )
    .addOperation(
      Operation.changeTrust({
        asset: customAsset,
        source: distributorKeypair.publicKey(),
      })
    )
    .addOperation(
      Operation.payment({
        destination: distributorKeypair.publicKey(),
        asset: customAsset,
        amount: "1000000",
        source: issuerKeypair.publicKey(),
      })
    )
    .addOperation(
      Operation.createPassiveSellOffer({
        selling: customAsset,
        buying: Asset.native(),
        amount: "2000",
        price: "1",
        source: distributorKeypair.publicKey(),
      })
    )
    .addOperation(
      Operation.createPassiveSellOffer({
        selling: Asset.native(),
        buying: customAsset,
        amount: "2000",
        price: "1",
        source: distributorKeypair.publicKey(),
      })
    )
    .addOperation(
      Operation.pathPaymentStrictSend({
        sendAsset: Asset.native(),
        sendAmount: "1000",
        destination: destinationKeypair.publicKey(),
        destAsset: customAsset,
        destMin: "1000",
      })
    )
    .addOperation(
      Operation.pathPaymentStrictSend({
        sendAsset: Asset.native(),
        sendAmount: "1000",
        destination: destinationKeypair.publicKey(),
        destAsset: customAsset,
        destMin: "1000",
      })
    )
    .addOperation(
      Operation.pathPaymentStrictReceive({
        sendAsset: customAsset,
        sendMax: "450",
        destination: questKeypair.publicKey(),
        destAsset: Asset.native(),
        destAmount: "450",
        source: destinationKeypair.publicKey(),
      })
    )
    .setTimeout(300)
    .build();

  tx.sign(questKeypair, issuerKeypair, destinationKeypair, distributorKeypair);

  // execute
  await executeTx(tx);
})();
