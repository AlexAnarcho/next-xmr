import { NextPage } from "next";
import { useAtom } from "jotai";
import { useState, useEffect, FormEvent } from "react";
import { Register } from "~/components";
import { createWallet, getMnemonicHash } from "~/lib/xmr";
import { walletAtom } from "~/store";
import { useRouter } from "next/router";
import useUser from "~/lib/useUser";
import fetchJson, { FetchError } from "~/lib/fetchJson";
import { Streamer } from "@prisma/client";

const Home: NextPage = () => {
  const router = useRouter();
  const { user: session, mutateUser } = useUser();

  useEffect(() => {
    if (session && session.isLoggedIn) {
      router.push("/dashboard");
    }
  }, [session, router]);

  const [seedLang, setSeedLang] = useState("English");
  const [newWallet, setNewWallet] = useAtom(walletAtom);
  const [seedPhrase, setSeedPhrase] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = data.get("name") as string;
    const alias = data.get("alias") as string;
    const understood = data.get("understood");
    if (!understood) {
      // TODO validate this on the field
      alert("Sorry, you must agree to proceed");
      return;
    }

    // TODO create a new streamer in the tipxmr db with this
    const truncatedHashedSeed = getMnemonicHash(seedPhrase).slice(0, 11);

    try {
      const streamer = await fetchJson<Streamer>("/api/streamer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: truncatedHashedSeed,
          name: name,
          alias: alias,
          socket: "",
        }),
      });
    } catch (reason) {
      if (reason instanceof FetchError) {
        console.error(reason);
      } else {
        console.error("An unexpected error happened:", reason);
      }
    }
    /*
     *    const res = await fetchJson(`/api/streamer`, {
     *      method: "POST",
     *      body: JSON.stringify({
     *      }),
     *    });
     */
    // TODO navigate the streamer to the login
  };

  useEffect(() => {
    const walletCreator = async (seedLang: string) => {
      const seed = await createWallet(seedLang);
      setSeedPhrase(seed);
    };
    walletCreator(seedLang);
  }, [seedLang]);

  // TODO when the seed language changes, a new seed should be generated
  // TODO prepare the handeling for submit (ie. open the wallet with the seed, create a new streamer entry in the db, log the streamer in)

  return (
    <Register
      seedLang={seedLang}
      setSeedLang={setSeedLang}
      handleSubmit={handleSubmit}
      seedPhrase={seedPhrase}
      setSeedPhrase={setSeedPhrase}
    />
  );
};

export default Home;
