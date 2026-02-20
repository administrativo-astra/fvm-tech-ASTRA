"use client";

import { useEffect, useState } from "react";
import type { Organization, Profile } from "@/lib/types";

interface UseOrganizationReturn {
  organization: Organization | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useOrganization(): UseOrganizationReturn {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchOrg() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/organization");
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Erro ao buscar organização");
        return;
      }

      setOrganization(json.data);
      setProfile(json.profile);
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrg();
  }, []);

  return { organization, profile, loading, error, refetch: fetchOrg };
}
