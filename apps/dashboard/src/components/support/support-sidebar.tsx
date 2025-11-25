"use client";

import { useSupportTickets } from "@/hooks/use-support-tickets";
import { cn } from "@midday/ui/cn";
import { Icons } from "@midday/ui/icons";
import { Button } from "@midday/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";

export function SupportSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTicketId = searchParams.get("ticketId");
  const { tickets, isLoading, createNewTicket } = useSupportTickets();

  const handleCreateTicket = async () => {
    const newTicket = await createNewTicket();
    if (newTicket) {
      router.push(`/support?ticketId=${newTicket.id}`);
    }
  };

  const handleSelectTicket = (ticketId: string) => {
    router.push(`/support?ticketId=${ticketId}`);
  };

  return (
    <div className="w-80 border-r border-border bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Support</h2>
          <Button
            size="sm"
            onClick={handleCreateTicket}
            className="gap-2"
          >
            <Icons.Add size={16} />
            New Ticket
          </Button>
        </div>
      </div>

      {/* Tickets List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading tickets...
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <Icons.Support size={48} className="text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No support tickets yet
              </p>
              <p className="text-xs text-muted-foreground">
                Create a new ticket to get started
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                type="button"
                onClick={() => handleSelectTicket(ticket.id)}
                className={cn(
                  "w-full p-4 text-left hover:bg-accent transition-colors",
                  selectedTicketId === ticket.id && "bg-accent"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-sm line-clamp-1">
                    {ticket.subject || "New Support Request"}
                  </h3>
                  {ticket.status && (
                    <span
                      className={cn(
                        "px-2 py-0.5 text-xs rounded-full shrink-0",
                        ticket.status === "open" &&
                          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                        ticket.status === "in_progress" &&
                          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                        ticket.status === "resolved" &&
                          "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
                        ticket.status === "closed" &&
                          "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                      )}
                    >
                      {ticket.status}
                    </span>
                  )}
                </div>
                {ticket.last_message && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {ticket.last_message}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {ticket.created_at &&
                      formatDistanceToNow(new Date(ticket.created_at), {
                        addSuffix: true,
                      })}
                  </span>
                  {ticket.unread_count > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                      {ticket.unread_count}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
