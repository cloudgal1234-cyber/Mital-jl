"use client";

import { useState, useTransition, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { loginAdmin } from "@/lib/actions/auth";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await loginAdmin(password);
      if (res && !res.success) setError(res.error);
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-pearl-100 px-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="w-full max-w-sm p-8">
          <div className="mb-6 flex flex-col items-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold-dark">
              <Lock className="h-5 w-5" />
            </div>
            <h1 className="font-display text-xl font-semibold text-ink">כניסת מנהלת</h1>
            <p className="text-sm text-muted-foreground">לוח הבקרה של מיטל ג&apos;ל</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">סיסמה</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={isPending}>
              {isPending ? "מתחברת..." : "כניסה"}
            </Button>
          </form>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3 text-gold" /> מיטל ג&apos;ל
          </p>
        </Card>
      </motion.div>
    </main>
  );
}
