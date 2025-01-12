import { Streamer } from "@prisma/client";
import { useQuery } from "react-query";
import fetchJson from "~/lib/fetchJson";

async function fetchStreamerByName(
  name: Streamer["name"] | string[] | undefined
): Promise<Streamer> {
  if (typeof name === "undefined")
    return Promise.reject(new Error("Invalname name"));

  const { data } = await fetchJson<any>(`/api/streamer/name/${name}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return data;
}

export default function useStreamerByName(
  name: Streamer["name"] | string[] | undefined
) {
  return useQuery(["streamer", name], () => fetchStreamerByName(name));
}
