/**
 * ADMIN PANEL INTEGRATION EXAMPLE
 * 
 * This file shows how to integrate the support system into your admin panel.
 * Copy and adapt this code to your admin panel implementation.
 */

"use client";

import { createClient } from "@midday/supabase/client";
import { useEffect, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";

type SupportTicket = {
  id: string;
  user_id: string;
  team_id: string;
  subject: string | null;
  status: "open" | "in_progress" | "resolved" | "closed";
  created_at: string;
  updated_at: string;
  last_message: string | null;
  unread_count: number;
  user_email?: string; // Join with auth.users
};

type SupportMessage = {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_type: "customer" | "admin";
  content: string;
  created_at: string;
  read: boolean;
};

/**
 * Hook for admin to view all support tickets
 */
export function useAdminSupportTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let channel: RealtimeChannel;

    const fetchAllTickets = async () => {
      try {
        // Note: This requires admin RLS policy to be set up
        const { data, error } = await supabase
          .from("support_tickets")
          .select(`
            *,
            users!support_tickets_user_id_fkey (
              email
            )
          `)
          .order("updated_at", { ascending: false });

        if (error) {
          console.error("Error fetching tickets:", error);
        } else {
          const ticketsWithEmail = data?.map((ticket: any) => ({
            ...ticket,
            user_email: ticket.users?.email,
          }));
          setTickets(ticketsWithEmail || []);
        }
      } catch (error) {
        console.error("Error in fetchAllTickets:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const setupRealtimeSubscription = () => {
      channel = supabase
        .channel("admin_support_tickets")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "support_tickets",
          },
          (payload) => {
            if (payload.eventType === "INSERT") {
              // Fetch user email for new ticket
              supabase
                .from("users")
                .select("email")
                .eq("id", (payload.new as any).user_id)
                .single()
                .then(({ data }) => {
                  setTickets((prev) => [
                    { ...payload.new, user_email: data?.email } as SupportTicket,
                    ...prev,
                  ]);
                });
            } else if (payload.eventType === "UPDATE") {
              setTickets((prev) =>
                prev.map((ticket) =>
                  ticket.id === payload.new.id
                    ? { ...ticket, ...payload.new }
                    : ticket
                )
              );
            }
          }
        )
        .subscribe();
    };

    fetchAllTickets();
    setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [supabase]);

  const updateTicketStatus = async (
    ticketId: string,
    status: "open" | "in_progress" | "resolved" | "closed"
  ) => {
    try {
      const { error } = await supabase
        .from("support_tickets")
        .update({ status })
        .eq("id", ticketId);

      if (error) {
        console.error("Error updating ticket status:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in updateTicketStatus:", error);
      throw error;
    }
  };

  return {
    tickets,
    isLoading,
    updateTicketStatus,
  };
}

/**
 * Hook for admin to view and send messages for any ticket
 */
export function useAdminSupportMessages(ticketId: string | null) {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!ticketId) {
      setMessages([]);
      setTicket(null);
      setIsLoading(false);
      return;
    }

    let channel: RealtimeChannel;

    const fetchTicketAndMessages = async () => {
      setIsLoading(true);
      try {
        // Fetch ticket with user info
        const { data: ticketData, error: ticketError } = await supabase
          .from("support_tickets")
          .select(`
            *,
            users!support_tickets_user_id_fkey (
              email
            )
          `)
          .eq("id", ticketId)
          .single();

        if (ticketError) {
          console.error("Error fetching ticket:", ticketError);
        } else {
          setTicket({
            ...ticketData,
            user_email: ticketData.users?.email,
          });
        }

        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from("support_messages")
          .select("*")
          .eq("ticket_id", ticketId)
          .order("created_at", { ascending: true });

        if (messagesError) {
          console.error("Error fetching messages:", messagesError);
        } else {
          setMessages(messagesData || []);
        }
      } catch (error) {
        console.error("Error in fetchTicketAndMessages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const setupRealtimeSubscription = () => {
      channel = supabase
        .channel(`admin_support_messages_${ticketId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "support_messages",
            filter: `ticket_id=eq.${ticketId}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as SupportMessage]);
          }
        )
        .subscribe();
    };

    fetchTicketAndMessages();
    setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [ticketId, supabase]);

  const sendAdminMessage = async (content: string) => {
    if (!ticketId) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Admin not authenticated");
      }

      const { error } = await supabase.from("support_messages").insert({
        ticket_id: ticketId,
        sender_id: user.id,
        sender_type: "admin",
        content,
        read: false,
      });

      if (error) {
        console.error("Error sending admin message:", error);
        throw error;
      }

      // Update ticket's last_message and updated_at
      await supabase
        .from("support_tickets")
        .update({
          last_message: content.substring(0, 100),
          updated_at: new Date().toISOString(),
        })
        .eq("id", ticketId);
    } catch (error) {
      console.error("Error in sendAdminMessage:", error);
      throw error;
    }
  };

  return {
    messages,
    ticket,
    isLoading,
    sendAdminMessage,
  };
}

/**
 * REQUIRED SQL FOR ADMIN ACCESS
 * 
 * Add these policies to your Supabase database to allow admins to access all tickets:
 * 
 * -- First, ensure you have a role column in your users table
 * -- ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';
 * 
 * -- Policy: Admins can view all tickets
 * CREATE POLICY "Admins can view all tickets"
 *     ON support_tickets
 *     FOR SELECT
 *     USING (
 *         EXISTS (
 *             SELECT 1 FROM users
 *             WHERE users.id = auth.uid()
 *             AND users.role = 'admin'
 *         )
 *     );
 * 
 * -- Policy: Admins can update all tickets
 * CREATE POLICY "Admins can update all tickets"
 *     ON support_tickets
 *     FOR UPDATE
 *     USING (
 *         EXISTS (
 *             SELECT 1 FROM users
 *             WHERE users.id = auth.uid()
 *             AND users.role = 'admin'
 *         )
 *     );
 * 
 * -- Policy: Admins can view all messages
 * CREATE POLICY "Admins can view all messages"
 *     ON support_messages
 *     FOR SELECT
 *     USING (
 *         EXISTS (
 *             SELECT 1 FROM users
 *             WHERE users.id = auth.uid()
 *             AND users.role = 'admin'
 *         )
 *     );
 * 
 * -- Policy: Admins can send messages to any ticket
 * CREATE POLICY "Admins can send messages to any ticket"
 *     ON support_messages
 *     FOR INSERT
 *     WITH CHECK (
 *         EXISTS (
 *             SELECT 1 FROM users
 *             WHERE users.id = auth.uid()
 *             AND users.role = 'admin'
 *         )
 *         AND sender_id = auth.uid()
 *         AND sender_type = 'admin'
 *     );
 */
