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
    "SDGLEPU6ODJN7BGCUJKYHQ5IRVLSYBKMLC6UN5SS7KHBUYYHRNJXWS5G"
  );

  const destinationKeypair = Keypair.random();

  await airdrop([destinationKeypair]);
  const questAccount = await server.loadAccount(questKeypair.publicKey());

  const tx = new TransactionBuilder(questAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.accountMerge({
        destination: destinationKeypair.publicKey(),
      })
    )
    .setTimeout(30)
    .build();

  tx.sign(questKeypair);

  await executeTx(tx);
})();
