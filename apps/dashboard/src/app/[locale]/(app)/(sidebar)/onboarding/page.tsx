"use client";

import { useState, useEffect } from "react";
import { OnboardingSteps } from "@/components/onboarding/onboarding-steps";
import { StepCompanyProfile } from "@/components/onboarding/step-company-profile";
import { StepContracts } from "@/components/onboarding/step-contracts";
import { StepPayment } from "@/components/onboarding/step-payment";
import { StepChecklist } from "@/components/onboarding/step-checklist";
import { Button } from "@midday/ui/button";
import { Icons } from "@midday/ui/icons";

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedStep = localStorage.getItem("onboarding_current_step");
    const savedCompleted = localStorage.getItem("onboarding_completed_steps");

    if (savedStep) {
      setCurrentStep(parseInt(savedStep));
    }
    if (savedCompleted) {
      setCompletedSteps(JSON.parse(savedCompleted));
    }
    setIsLoaded(true);
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("onboarding_current_step", currentStep.toString());
      localStorage.setItem("onboarding_completed_steps", JSON.stringify(completedSteps));
    }
  }, [currentStep, completedSteps, isLoaded]);

  const handleNext = () => {
    setCompletedSteps((prev) => {
      const newCompleted = [...prev, currentStep];
      // Ensure unique values
      return Array.from(new Set(newCompleted));
    });
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Prevent hydration mismatch by not rendering until loaded
  if (!isLoaded) {
    return null; 
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-medium mb-2">
          {completedSteps.length > 0 ? "Welcome Back!" : "Welcome to Midday"}
        </h1>
        <p className="text-muted-foreground">
          {completedSteps.length > 0 
            ? `You have completed ${completedSteps.length} of 4 steps. Continue where you left off.`
            : "Complete these steps to get your account fully set up and ready to go."}
        </p>
      </div>

      <OnboardingSteps currentStep={currentStep} completedSteps={completedSteps} />

      <div className="mt-8">
        {currentStep === 1 && <StepCompanyProfile onNext={handleNext} />}
        {currentStep === 2 && <StepContracts onNext={handleNext} onBack={handleBack} />}
        {currentStep === 3 && <StepPayment onNext={handleNext} onBack={handleBack} />}
        {currentStep === 4 && <StepChecklist onBack={handleBack} />}
      </div>
    </div>
  );
}
