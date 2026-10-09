"use client";

import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WizardStep {
  id: number;
  title: string;
  icon: LucideIcon;
}

interface FormStepperProps {
  steps: WizardStep[];
  currentStep: number;
  onStepSelect?: (step: number) => void;
}

export function FormStepper({
  steps,
  currentStep,
  onStepSelect,
}: FormStepperProps) {
  return (
    <nav aria-label="Progresso do cadastro">
      <ol className="flex items-center gap-2 sm:gap-4">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isClickable = isCompleted && Boolean(onStepSelect);
          const Icon = step.icon;

          return (
            <li
              key={step.id}
              className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3"
            >
              <button
                type="button"
                disabled={!isClickable}
                aria-current={isCurrent ? "step" : undefined}
                onClick={() => {
                  if (isClickable) {
                    onStepSelect?.(step.id);
                  }
                }}
                className={cn(
                  "flex min-w-0 items-center gap-2 rounded-lg text-left",
                  isClickable ? "cursor-pointer" : "cursor-default",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium transition-colors",
                    isCurrent &&
                      "border-primary bg-primary text-primary-foreground",
                    isCompleted && "border-primary bg-primary/10 text-primary",
                    !isCurrent &&
                      !isCompleted &&
                      "border-border text-muted-foreground",
                  )}
                >
                  {isCompleted ? (
                    <Check className="size-4" />
                  ) : (
                    <Icon className="size-4" />
                  )}
                </span>

                <span className="hidden min-w-0 sm:block">
                  <span className="block text-xs text-muted-foreground">
                    Etapa {step.id}
                  </span>
                  <span
                    className={cn(
                      "block truncate text-sm font-medium",
                      !isCurrent && !isCompleted && "text-muted-foreground",
                    )}
                  >
                    {step.title}
                  </span>
                </span>
              </button>

              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-px flex-1",
                    isCompleted ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
