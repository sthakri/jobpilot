import { createInsforgeServer } from "@/lib/insforge-server";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { PostHogIdentify } from "@/providers/posthog-identify";

export default async function ProfilePage() {
  let user;

  try {
    const client = await createInsforgeServer();
    const { data, error } = await client.auth.getCurrentUser();
    if (error || !data?.user) redirect("/login");
    user = data.user;
  } catch {
    redirect("/login");
  }

  const fullName = user.metadata?.["full_name"];

  return (
    <div className="min-h-screen bg-surface">
      <PostHogIdentify userId={user.id} />
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-card">
          <h1 className="text-2xl font-bold text-text-primary">Profile</h1>
          <p className="mt-1 text-sm text-text-muted">
            You are signed in.
          </p>

          <div className="mt-8 space-y-4">
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
                Email
              </span>
              <p className="mt-1 text-text-primary">
                {user.email ?? "—"}
              </p>
            </div>

            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
                Name
              </span>
              <p className="mt-1 text-text-primary">
                {typeof fullName === "string" ? fullName : "—"}
              </p>
            </div>

            {user.profile?.avatar_url && (
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
                  Avatar
                </span>
                <img
                  src={user.profile.avatar_url}
                  alt="avatar"
                  className="mt-2 size-12 rounded-full"
                />
              </div>
            )}
          </div>

          <div className="mt-8">
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
