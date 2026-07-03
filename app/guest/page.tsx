import type { Metadata } from "next";
import GuestOverviewClient from "./GuestOverviewClient";

export const metadata: Metadata = {
  title: "Guest Overview",
  description: "Public overview of bills and transactions.",
};

export default function GuestPage() {
  return <GuestOverviewClient />;
}