"use client";

import { createClient } from "@midday/supabase/client";
import { useEffect, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { SupportTicket } from "./use-support-tickets";

export type SupportMessage = {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_type: "customer" | "admin";
  content: string;
  created_at: string;
  read: boolean;
};

export function useSupportMessages(ticketId: string | null) {
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
        // Fetch ticket details
        const { data: ticketData, error: ticketError } = await supabase
          .from("support_tickets")
          .select("*")
          .eq("id", ticketId)
          .single();

        if (ticketError) {
          console.error("Error fetching ticket:", ticketError);
        } else {
          setTicket(ticketData);
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
          
          // Mark customer messages as read
          const unreadMessages = messagesData?.filter(
            (msg) => msg.sender_type === "admin" && !msg.read
          );
          
          if (unreadMessages && unreadMessages.length > 0) {
            await supabase
              .from("support_messages")
              .update({ read: true })
              .in(
                "id",
                unreadMessages.map((msg) => msg.id)
              );
          }
        }
      } catch (error) {
        console.error("Error in fetchTicketAndMessages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const setupRealtimeSubscription = () => {
      console.log(`[Realtime] Setting up subscription for ticket: ${ticketId}`);
      
      channel = supabase
        .channel(`support_messages_${ticketId}`, {
          config: {
            broadcast: { self: true },
          },
        })
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "support_messages",
            filter: `ticket_id=eq.${ticketId}`,
          },
          (payload) => {
            console.log("[Realtime] New message received:", payload);
            const newMessage = payload.new as SupportMessage;
            setMessages((prev) => [...prev, newMessage]);
            
            // Mark admin messages as read immediately
            if (newMessage.sender_type === "admin" && !newMessage.read) {
              supabase
                .from("support_messages")
                .update({ read: true })
                .eq("id", newMessage.id)
                .then();
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "support_tickets",
            filter: `id=eq.${ticketId}`,
          },
          (payload) => {
            console.log("[Realtime] Ticket updated:", payload);
            setTicket(payload.new as SupportTicket);
          }
        )
        .subscribe((status, err) => {
          console.log(`[Realtime] Subscription status: ${status}`, err);
          if (status === "SUBSCRIBED") {
            console.log("[Realtime] ✅ Successfully subscribed to changes");
          }
          if (status === "CHANNEL_ERROR") {
            console.error("[Realtime] ❌ Channel error:", err);
          }
          if (status === "TIMED_OUT") {
            console.error("[Realtime] ⏱️ Subscription timed out");
          }
        });
    };

    fetchTicketAndMessages();
    setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [ticketId, supabase]);

  const sendMessage = async (content: string) => {
    if (!ticketId) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase.from("support_messages").insert({
        ticket_id: ticketId,
        sender_id: user.id,
        sender_type: "customer",
        content,
        read: false,
      });

      if (error) {
        console.error("Error sending message:", error);
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
      console.error("Error in sendMessage:", error);
      throw error;
    }
  };

  return {
    messages,
    ticket,
    isLoading,
    sendMessage,
  };
}
