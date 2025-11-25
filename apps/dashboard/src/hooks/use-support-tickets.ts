"use client";

import { createClient } from "@midday/supabase/client";
import { useEffect, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type SupportTicket = {
  id: string;
  user_id: string;
  team_id: string;
  subject: string | null;
  status: "open" | "in_progress" | "resolved" | "closed";
  created_at: string;
  updated_at: string;
  last_message: string | null;
  unread_count: number;
};

export function useSupportTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let channel: RealtimeChannel;

    const fetchTickets = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("support_tickets")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false });

        if (error) {
          console.error("Error fetching tickets:", error);
        } else {
          setTickets(data || []);
        }
      } catch (error) {
        console.error("Error in fetchTickets:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const setupRealtimeSubscription = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      channel = supabase
        .channel("support_tickets_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "support_tickets",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.eventType === "INSERT") {
              const newTicket = payload.new as SupportTicket;
              // Check if ticket already exists to avoid duplicates
              setTickets((prev) => {
                const exists = prev.some((t) => t.id === newTicket.id);
                if (exists) {
                  return prev; // Don't add duplicate
                }
                return [newTicket, ...prev];
              });
            } else if (payload.eventType === "UPDATE") {
              setTickets((prev) =>
                prev.map((ticket) =>
                  ticket.id === payload.new.id
                    ? (payload.new as SupportTicket)
                    : ticket
                )
              );
            } else if (payload.eventType === "DELETE") {
              setTickets((prev) =>
                prev.filter((ticket) => ticket.id !== payload.old.id)
              );
            }
          }
        )
        .subscribe();
    };

    fetchTickets();
    setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [supabase]);

  const createNewTicket = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      // Try to get team_id from existing tickets first (most reliable)
      const { data: existingTickets, error: ticketsError } = await supabase
        .from("support_tickets")
        .select("team_id")
        .eq("user_id", user.id)
        .limit(1);

      console.log("Existing tickets check:", { existingTickets, ticketsError });

      let teamId: string | undefined;

      if (existingTickets && existingTickets.length > 0) {
        teamId = existingTickets[0].team_id;
        console.log("Got team_id from existing tickets:", teamId);
      } else {
        // If no existing tickets, try to get from users_on_team
        const { data: userTeamData, error: teamError } = await supabase
          .from("users_on_team")
          .select("team_id")
          .eq("user_id", user.id)
          .limit(1);

        console.log("users_on_team query result:", { userTeamData, teamError });

        if (userTeamData && userTeamData.length > 0) {
          teamId = userTeamData[0].team_id;
          console.log("Got team_id from users_on_team:", teamId);
        }
      }

      if (!teamId) {
        // Last resort: try from session metadata
        const { data: sessionData } = await supabase.auth.getSession();
        teamId = sessionData?.session?.user?.user_metadata?.team_id;
        console.log("Session metadata team_id:", teamId);
      }

      console.log("Final team_id:", teamId);

      if (!teamId) {
        throw new Error(
          "Could not determine your team. Please contact support or ensure you are part of a team."
        );
      }

      const { data, error } = await supabase
        .from("support_tickets")
        .insert({
          user_id: user.id,
          team_id: teamId,
          subject: "New Support Request",
          status: "open",
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating ticket:", error);
        throw error;
      }

      return data as SupportTicket;
    } catch (error) {
      console.error("Error in createNewTicket:", error);
      return null;
    }
  };

  return {
    tickets,
    isLoading,
    createNewTicket,
  };
}
