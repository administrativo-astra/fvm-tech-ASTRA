import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Admin client bypasses RLS — needed for user_organizations insert
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user needs org setup
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("organization_id")
          .eq("id", user.id)
          .single();

        // If no org, create one from signup metadata
        if (!profile?.organization_id) {
          const orgName = user.user_metadata?.org_name || "Minha Organização";
          const slug = orgName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")
            + "-" + Date.now().toString(36);

          const { data: org } = await supabase
            .from("organizations")
            .insert({ name: orgName, slug })
            .select()
            .single();

          if (org) {
            await supabase
              .from("profiles")
              .update({ 
                organization_id: org.id, 
                role: "owner",
                full_name: user.user_metadata?.full_name || user.email,
              })
              .eq("id", user.id);

            // Also insert into user_organizations for multi-org support
            // Must use admin client — RLS blocks insert for users with no existing membership
            const admin = getAdminClient();
            await admin
              .from("user_organizations")
              .upsert({
                user_id: user.id,
                organization_id: org.id,
                role: "owner",
              }, { onConflict: "user_id,organization_id" });
          }
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
