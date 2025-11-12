import { redirect } from "next/navigation";
import { getSession } from "@/lib/supabase/server";

export default async function HomePage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  } else {
    redirect("/auth/login");
  }
}
