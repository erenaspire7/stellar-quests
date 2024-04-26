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
    "SBN6DIW6EQJKCT5VNG4IYO5IZ3DW2OFA5LXTJH42DPUUEVVO6O5PQYY7"
  );

  const questAccount = await server.loadAccount(questKeypair.publicKey());

  const tx = new TransactionBuilder(questAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.manageData({
        name: "Hello",
        value: "World",
      })
    )
    .addOperation(
      Operation.manageData({
        name: "Hello",
        value: Buffer.from("Stellar Quest!"),
      })
    )
    .setTimeout(30)
    .build();

  tx.sign(questKeypair);

  await executeTx(tx);
})();
