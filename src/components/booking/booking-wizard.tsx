"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Service } from "@prisma/client";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { createAppointment } from "@/lib/actions/booking";
import type { ClientDetailsInput } from "@/lib/validation";
import { StepService } from "./steps/step-service";
import { StepDateTime } from "./steps/step-datetime";
import { StepDetails } from "./steps/step-details";
import { StepConfirm } from "./steps/step-confirm";

const STEPS = ["טיפול", "תאריך ושעה", "פרטים אישיים", "אישור"] as const;

type WizardState = {
  service: Service | null;
  date: Date | null;
  time: string | null; // ISO
  client: ClientDetailsInput | null;
};

type SubmitResult = { success: true; appointmentId: string } | { success: false; error: string };

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -48 : 48, opacity: 0 }),
};

type BusinessInfo = { name: string; address: string };

export function BookingWizard({ services, businessInfo }: { services: Service[]; businessInfo: BusinessInfo }) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [state, setState] = useState<WizardState>({ service: null, date: null, time: null, client: null });
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<SubmitResult | null>(null);

  function goTo(next: number) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  }

  function handleSelectService(service: Service) {
    setState((s) => ({ ...s, service }));
    goTo(1);
  }

  function handleSelectDateTime(date: Date, time: string) {
    setState((s) => ({ ...s, date, time }));
    goTo(2);
  }

  function handleDetails(client: ClientDetailsInput) {
    setState((s) => ({ ...s, client }));
    goTo(3);
    setResult(null);
    const service = state.service;
    const time = state.time;
    if (!service || !time) return;
    startTransition(async () => {
      const res = await createAppointment({ serviceId: service.id, startTime: new Date(time), client });
      setResult(res);
    });
  }

  function reset() {
    setState({ service: null, date: null, time: null, client: null });
    setResult(null);
    goTo(0);
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <ol className="mb-10 flex items-center justify-between">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <motion.div
                animate={{
                  backgroundColor: i <= step ? "#cf6a85" : "#f3e7d8",
                  color: i <= step ? "#fffdfb" : "#a87f50",
                  scale: i === step ? 1.1 : 1,
                }}
                transition={{ duration: 0.3 }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold shadow-soft"
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </motion.div>
              <span className={cn("hidden text-xs font-medium sm:block", i <= step ? "text-ink" : "text-muted-foreground")}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="mx-2 h-px flex-1 bg-nude-200">
                <motion.div
                  className="h-px bg-primary"
                  initial={false}
                  animate={{ width: i < step ? "100%" : "0%" }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            )}
          </li>
        ))}
      </ol>

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 0 && <StepService services={services} onSelect={handleSelectService} />}
            {step === 1 && state.service && (
              <StepDateTime service={state.service} onSelect={handleSelectDateTime} onBack={() => goTo(0)} />
            )}
            {step === 2 && state.service && state.time && (
              <StepDetails onSubmit={handleDetails} onBack={() => goTo(1)} />
            )}
            {step === 3 && state.service && state.time && (
              <StepConfirm
                service={state.service}
                time={state.time}
                isPending={isPending}
                result={result}
                businessInfo={businessInfo}
                onRestart={reset}
                onBackToDateTime={() => goTo(1)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
