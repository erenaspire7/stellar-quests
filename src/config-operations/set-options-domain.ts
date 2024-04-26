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
    "SCMBXNOJ6AYWYQTQMFODMUWU32E5GVEUUEGHE5Q2BO5KIWCNAYT4VPUG"
  );

  const questAccount = await server.loadAccount(questKeypair.publicKey());

  const tx = new TransactionBuilder(questAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.setOptions({ homeDomain: "vlt5827xgfw9.runkit.sh" })
    )
    .setTimeout(30)
    .build();

  tx.sign(questKeypair);

  await executeTx(tx);
})();
