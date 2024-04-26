import {
  Keypair,
  TransactionBuilder,
  Networks,
  Operation,
  BASE_FEE,
  Asset,
  AuthRevocableFlag,
  AuthRequiredFlag,
  AuthFlag,
} from "@stellar/stellar-sdk";
import { airdrop, executeTx, server } from "../helper";

(async () => {
  const questKeypair = Keypair.fromSecret(
    "SDWZJBNXD4JU2SOSM6VFYRHVWBENSZLOIT72QRSL62AND7DGKK7T4DGN"
  );

  const issuerKeypair = Keypair.random();

  await airdrop([issuerKeypair]);

  const issuerAccount = await server.loadAccount(issuerKeypair.publicKey());

  const controlledAsset = new Asset("CONTROL", issuerKeypair.publicKey());

  const tx = new TransactionBuilder(issuerAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.setOptions({
        setFlags: AuthRevocableFlag || AuthRequiredFlag,
      })
    )
    .addOperation(
      Operation.changeTrust({
        asset: controlledAsset,
        source: questKeypair.publicKey(),
      })
    )
    .addOperation(
      Operation.setTrustLineFlags({
        trustor: questKeypair.publicKey(),
        asset: controlledAsset,
        flags: {
          authorized: true,
        },
      })
    )
    .addOperation(
      Operation.payment({
        destination: questKeypair.publicKey(),
        asset: controlledAsset,
        amount: "100",
      })
    )
    .addOperation(
      Operation.setTrustLineFlags({
        trustor: questKeypair.publicKey(),
        asset: controlledAsset,
        flags: {
          authorized: false,
        },
      })
    )
    .setTimeout(300)
    .build();

  tx.sign(questKeypair, issuerKeypair);

  await executeTx(tx);
})();
