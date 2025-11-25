"use client";

import { cn } from "@midday/ui/cn";
import { Icons } from "@midday/ui/icons";

interface OnboardingStepsProps {
  currentStep: number;
  completedSteps: number[];
}

const STEPS = [
  { id: 1, title: "Company Profile", icon: Icons.Description },
  { id: 2, title: "Sign Contracts", icon: Icons.Edit },
  { id: 3, title: "Payment", icon: Icons.ReceiptLong },
  { id: 4, title: "Final Checklist", icon: Icons.Match },
];

export function OnboardingSteps({ currentStep, completedSteps }: OnboardingStepsProps) {
  return (
    <div className="relative">
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -z-10 -translate-y-1/2" />
      
      <div className="flex justify-between">
        {STEPS.map((step) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center gap-2 bg-background px-2">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                  isCompleted
                    ? "bg-primary border-primary text-primary-foreground"
                    : isCurrent
                    ? "border-primary text-primary"
                    : "border-muted text-muted-foreground bg-background"
                )}
              >
                {isCompleted ? <Icons.Check size={16} /> : <Icon size={16} />}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  isCurrent ? "text-primary" : "text-muted-foreground"
                )}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
