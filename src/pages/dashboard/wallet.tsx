import { useAtom } from "jotai";
import {
  balanceAtom,
  mnemonicAtom,
  syncEndHeightAtom,
  progressAtom,
  syncHeightAtom,
  isSyncRunningAtom,
  walletAtom,
  openWalletAtom,
  generatedSeedPhraseAtom,
} from "~/store";
import { MoneroSubaddress, MoneroWalletFull } from "monero-javascript";
import { Subaddress, TipxmrWallet } from "~/components";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import {
  createBalancesChangedListener,
  createOutputReceivedListener,
  createSyncProgressListener,
  generateSubaddress,
  open,
} from "~/lib/xmr";
import useUser from "~/lib/useUser";
import { Button } from "@mui/material";
import fetchJson, { FetchError } from "~/lib/fetchJson";

/* const MNEMONIC =
 *   "aimless erected efficient eluded richly return cage unveil seismic zodiac hotel ringing jingle echo rims maze tapestry inline bomb eldest woken zero older onslaught ringing";
 *  */
const Transaction = ({ wallet }: { wallet?: MoneroWalletFull }) => {
  useEffect(() => {
    (async () => {
      const listener = createOutputReceivedListener((output) => {
        const { inTxPool, isLocked, isIncoming } = output.state.tx.state;

        if (inTxPool && isLocked && isIncoming) {
          console.log({
            subaddressIndex: output.getSubaddressIndex(),
            amount: output.getAmount().toString(),
          });
        }
      });

      await wallet.addListener(listener);

      const subaddress = await wallet.createSubaddress(0, "foobar");
      const address = await subaddress.getAddress();
    })();

    (async () => {
      const listener = createBalancesChangedListener(
        (newBalance: BigInteger, newUnlockedBalance: BigInteger) => {
          console.log({
            newBalance: newBalance.toString(),
            newUnlockedBalance: newUnlockedBalance.toString(),
          });
        }
      );

      await wallet.addListener(listener);
    })();
  }, [wallet]);

  return null;
};

const WalletPage: NextPage = () => {
  const { user } = useUser({ redirectTo: "/login" });

  const [progress] = useAtom(progressAtom);
  const [myWallet] = useAtom(walletAtom);
  const [isSyncing] = useAtom(isSyncRunningAtom);
  const [syncHeight] = useAtom(syncHeightAtom);
  const [syncEndHeight] = useAtom(syncEndHeightAtom);
  const [balance] = useAtom(balanceAtom);
  const [currentAddress, setCurrentAddress] = useState<
    MoneroSubaddress | string
  >("");

  const isDone = progress === 100;

  const generateAddress = async () => {
    if (myWallet) {
      const addr = await myWallet.createSubaddress(0, "test");
      const subaddress = await addr.getAddress();

      setCurrentAddress(subaddress);

      const body = {
        streamer: user?.id,
        data: { subaddress },
      };

      try {
        const result = await fetchJson(`/api/donate/${user?.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        console.log(result);
      } catch (reason) {
        if (reason instanceof FetchError) {
          console.error(reason);
        } else {
          console.error("An unexpected error happened:", reason);
        }
      }
    }
  };

  return (
    <>
      {user && user.isLoggedIn && (
        <TipxmrWallet
          balance={balance}
          isSynced={isDone && !isSyncing}
          height={syncHeight}
          percentDone={progress}
          endHeight={syncEndHeight}
        ></TipxmrWallet>
      )}
      {isDone ? <Transaction wallet={myWallet} /> : null}

      <Button
        disabled={!myWallet && !isSyncing}
        variant="contained"
        color="primary"
        onClick={generateAddress}
      >
        Generate new Subaddress
      </Button>
      {currentAddress && <Subaddress address={String(currentAddress)} />}
    </>
  );
};

export default WalletPage;
