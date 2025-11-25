"use client";

import { SupportChatInterface } from "./support-chat-interface";
import { SupportSidebar } from "./support-sidebar";

export function SupportView() {
  return (
    <>
      <SupportSidebar />
      <SupportChatInterface />
    </>
  );
}
