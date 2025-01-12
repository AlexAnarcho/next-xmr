import { Streamer } from "@prisma/client";
import { useQuery } from "react-query";
import fetchJson from "~/lib/fetchJson";

async function fetchDonationSettings(
  name: Streamer["name"] | undefined
): Promise<Streamer> {
  if (typeof name === "undefined")
    return Promise.reject(new Error("Invalid name"));

  const { data } = await fetchJson<any>(`/api/donation-settings/${name}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  console.log({ data });
  return data;
}

export default function useDonationSettings(
  name: Streamer["name"] | undefined
) {
  console.log(`Trying to get the donation settings: `);
  return useQuery(["streamer", name], () => fetchDonationSettings(name));
}
