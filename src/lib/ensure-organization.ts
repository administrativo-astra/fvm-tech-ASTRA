import { SupabaseClient } from "@supabase/supabase-js";

export async function ensureOrganization(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, role, full_name")
    .eq("id", user.id)
    .single();

  // If profile exists and has org, we're good
  if (profile?.organization_id) return profile.organization_id;

  // If no profile at all (trigger may not have fired), create it
  if (!profile) {
    await supabase
      .from("profiles")
      .insert({
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email,
        role: "owner",
      });
  }

  // Create organization from user metadata
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

    return org.id;
  }

  return null;
}
