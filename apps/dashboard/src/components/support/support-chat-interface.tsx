"use client";

import { useSupportMessages } from "@/hooks/use-support-messages";
import { cn } from "@midday/ui/cn";
import { Icons } from "@midday/ui/icons";
import {
  PromptInput,
  PromptInputBody,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@midday/ui/prompt-input";
import { formatDistanceToNow } from "date-fns";
import { useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export function SupportChatInterface() {
  const searchParams = useSearchParams();
  const ticketId = searchParams.get("ticketId");
  const { messages, isLoading, sendMessage, ticket } = useSupportMessages(ticketId);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message: { text?: string }) => {
    const text = message.text || messageText;
    if (!text.trim() || !ticketId || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(text.trim());
      setMessageText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  if (!ticketId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <Icons.Support size={64} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Ticket Selected</h3>
          <p className="text-sm text-muted-foreground">
            Select a ticket from the sidebar or create a new one
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {ticket?.subject || "Support Ticket"}
            </h2>
            {ticket?.status && (
              <p className="text-sm text-muted-foreground">
                Status:{" "}
                <span
                  className={cn(
                    "capitalize",
                    ticket.status === "open" && "text-green-600 dark:text-green-400",
                    ticket.status === "in_progress" && "text-blue-600 dark:text-blue-400",
                    ticket.status === "resolved" && "text-gray-600 dark:text-gray-400"
                  )}
                >
                  {ticket.status.replace("_", " ")}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Icons.Email size={48} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No messages yet. Start the conversation!
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isCustomer = message.sender_type === "customer";
              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    isCustomer ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[70%] rounded-lg p-3",
                      isCustomer
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent text-accent-foreground"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    <p
                      className={cn(
                        "text-xs mt-1",
                        isCustomer
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      )}
                    >
                      {formatDistanceToNow(new Date(message.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-background">
        <PromptInput onSubmit={handleSendMessage}>
          <PromptInputBody>
            <PromptInputTextarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  if (e.nativeEvent.isComposing) {
                    return;
                  }
                  e.preventDefault();
                  const form = e.currentTarget.form;
                  if (form) {
                    form.requestSubmit();
                  }
                }
              }}
              placeholder="Type your message..."
              disabled={isSending}
            />
          </PromptInputBody>
          <PromptInputToolbar>
            <PromptInputTools />
            <PromptInputTools>
              <PromptInputSubmit
                disabled={!messageText.trim() || isSending}
              />
            </PromptInputTools>
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
}
