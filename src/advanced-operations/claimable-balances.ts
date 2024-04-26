import {
  Keypair,
  TransactionBuilder,
  Networks,
  Operation,
  BASE_FEE,
  Asset,
  Claimant,
} from "@stellar/stellar-sdk";
import { airdrop, executeTx, server, sleep } from "../helper";

(async () => {
  const questKeypair = Keypair.fromSecret(
    "SCJW7UZAFOVWFFCCXCDUWRYTUEMKGDNW6ESWFUW4EIJAYPEAEI3IQDKP"
  );
  const claimantKeypair = Keypair.random();

  const questAccount = await server.loadAccount(questKeypair.publicKey());

  const claimant = new Claimant(
    claimantKeypair.publicKey(),
    Claimant.predicateNot(Claimant.predicateBeforeRelativeTime("300"))
  );

  const questClaimant = new Claimant(
    questKeypair.publicKey(),
    Claimant.predicateUnconditional()
  );

  const transaction = new TransactionBuilder(questAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.createClaimableBalance({
        asset: Asset.native(),
        amount: "100",
        claimants: [claimant, questClaimant],
      })
    )
    .setTimeout(300)
    .build();

  transaction.sign(questKeypair);

  await executeTx(transaction);

  const claimableBalanceId = transaction.getClaimableBalanceId(0);

  await sleep(300 * 1000);

  await airdrop([claimantKeypair]);

  const claimantAccount = await server.loadAccount(claimantKeypair.publicKey());
  const claimTransaction = new TransactionBuilder(claimantAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.claimClaimableBalance({
        balanceId: claimableBalanceId,
      })
    )
    .setTimeout(300)
    .build();

  claimTransaction.sign(claimantKeypair);

  await executeTx(claimTransaction);

  console.log(claimantKeypair.publicKey());
})();
