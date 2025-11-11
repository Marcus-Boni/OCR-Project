import { redirect } from "next/navigation";
import { getSession } from "@/lib/supabase/server";

export default async function HomePage() {
  const session = await getSession();

  // Redirect to dashboard if logged in, otherwise to login
  if (session) {
    redirect("/dashboard");
  } else {
    redirect("/auth/login");
  }
}
