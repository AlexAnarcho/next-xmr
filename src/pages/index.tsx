import { Grid, Typography, Box, Button } from "@mui/material";
import Container from "@mui/material/Container";
import { Streamer } from "@prisma/client";
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import Head from "next/head";
import { getStreamers } from "~/lib/db/streamer";
import HorizontalCenter from "~/components/helper/HorizontalCenter";
import {
  HeroUnit,
  InfoCard,
  IsOnlineBadge,
  LanguageSelector,
} from "~/components";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import useUser from "~/lib/useUser";

type Modify<T, R> = Omit<T, keyof R> & R;

type SerializedStreamer = Modify<
  Streamer,
  {
    updatedAt: string;
  }
>;

type Props = {
  streamers: SerializedStreamer[];
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const streamers = await getStreamers();
  const serialized = streamers.map(({ updatedAt, ...streamer }) => {
    return {
      ...streamer,
      updatedAt: updatedAt.toJSON(),
    };
  });

  return { props: { streamers: serialized } };
};

type ServerSideProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const Home: NextPage<ServerSideProps> = () => {
  const { user } = useUser({ redirectTo: "/dashboard", redirectIfFound: true });
  const [language, setLanguage] = useState("English");

  return (
    <>
      <Head>
        <title>TipXMR</title>
      </Head>

      <Container sx={{ py: 8 }}>
        <Grid container spacing={4}>
          <Grid item xs={6}>
            <HorizontalCenter>
              <Image
                alt="Landing"
                src="https://via.placeholder.com/150"
                width={150}
                height={150}
              />
            </HorizontalCenter>
          </Grid>

          <Grid item xs={6} sx={{ margin: "auto" }}>
            <HeroUnit
              title="TipXMR"
              text="Monetize your streams with Monero!"
            />
          </Grid>

          <Grid item xs={3}>
            <InfoCard>Online</InfoCard>
            <IsOnlineBadge isOnline />
          </Grid>

          <Grid item xs={3}>
            <LanguageSelector language={language} onChange={setLanguage} />
          </Grid>
        </Grid>

        <Box
          sx={{
            mt: 8,
          }}
        />

        <Link href={`/overview`} passHref>
          <Button component="a">See who&apos;s streaming</Button>
        </Link>

        <Box />

        <Link href={`/donate`} passHref>
          <Button component="a">Want to donate? Follow me</Button>
        </Link>
      </Container>
    </>
  );
};

export default Home;
