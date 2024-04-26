import {
  Keypair,
  TransactionBuilder,
  Networks,
  Operation,
  BASE_FEE,
} from "@stellar/stellar-sdk";
import { executeTx, server } from "../helper";

(async () => {
  const questKeypair = Keypair.fromSecret(
    "SAZEWFEBU3SQ3Y3TNQ3BIWV77TWYZES7XUIUNZ5STSAESBR2L3UQSW7Z"
  );
  const secondSigner = Keypair.random();
  const thirdSigner = Keypair.random();

  const questAccount = await server.loadAccount(questKeypair.publicKey());

  const setupTx = new TransactionBuilder(questAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.setOptions({
        masterWeight: 1,
        lowThreshold: 5,
        medThreshold: 5,
        highThreshold: 5,
      })
    )
    .addOperation(
      Operation.setOptions({
        signer: {
          ed25519PublicKey: secondSigner.publicKey(),
          weight: 2,
        },
      })
    )
    .addOperation(
      Operation.setOptions({
        signer: {
          ed25519PublicKey: thirdSigner.publicKey(),
          weight: 2,
        },
      })
    )
    .setTimeout(300)
    .build();

  setupTx.sign(questKeypair);

  await executeTx(setupTx);

  const testTx = new TransactionBuilder(questAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.manageData({
        name: "Hello",
        value: "World",
      })
    )
    .setTimeout(300)
    .build();

  testTx.sign(questKeypair, secondSigner, thirdSigner);

  await executeTx(testTx);
})();
