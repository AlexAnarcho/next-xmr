import Container from "@mui/material/Container";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import Head from "next/head";
import { Streamer } from "../data/types";
import prisma from "../lib/prisma";

type Props = {
  streamers: Streamer[];
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const streamers = await prisma.streamer.findMany({});
  return { props: { streamers } };
};

type ServerSideProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const Home: NextPage<ServerSideProps> = ({ streamers }) => {
  return (
    <Container>
      <Head>
        <title>TipXMR</title>
      </Head>
      <List>
        {streamers.map((streamer) => (
          <ListItem key={streamer.id} disablePadding>
            <ListItemButton>
              <ListItemText primary={streamer.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default Home;
