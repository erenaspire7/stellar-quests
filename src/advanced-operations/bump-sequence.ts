import {
  Keypair,
  TransactionBuilder,
  Networks,
  Operation,
  BASE_FEE,
  Account,
} from "@stellar/stellar-sdk";
import { airdrop, executeTx, server } from "../helper";

(async () => {
  const questKeypair = Keypair.fromSecret(
    "SDQ4TOTCBM2VUEVSWCCF6DWEFCNMI4L3WZSBEJDGFGEZ2HIIDV5324KJ"
  );

  const questAccount = await server.loadAccount(questKeypair.publicKey());

  const transaction = new TransactionBuilder(questAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.bumpSequence({
        bumpTo: (parseInt(questAccount.sequence) + 100).toString(),
      })
    )
    .setTimeout(300)
    .build();

  transaction.sign(questKeypair);

  await executeTx(transaction);

  const bumpedAccount = new Account(
    questKeypair.publicKey(),
    (parseInt(questAccount.sequence) + 99).toString()
  );

  const nextTransaction = new TransactionBuilder(bumpedAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.manageData({
        name: "sequence",
        value: "bumped",
      })
    )
    .setTimeout(300)
    .build();

  nextTransaction.sign(questKeypair);

  await executeTx(nextTransaction);
})();
