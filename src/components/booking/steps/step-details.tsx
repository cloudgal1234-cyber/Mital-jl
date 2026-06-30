"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { clientDetailsSchema, type ClientDetailsInput } from "@/lib/validation";

export function StepDetails({
  onSubmit,
  onBack,
}: {
  onSubmit: (client: ClientDetailsInput) => void;
  onBack: () => void;
}) {
  const [values, setValues] = useState({ fullName: "", phone: "", email: "", notes: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof values, string>>>({});

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = clientDetailsSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof typeof values;
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    onSubmit(parsed.data);
  }

  return (
    <div>
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-ink">
        <ArrowRight className="h-4 w-4" /> חזרה לבחירת מועד
      </button>
      <h2 className="mb-1 font-display text-2xl font-semibold text-ink">פרטים אישיים</h2>
      <p className="mb-6 text-sm text-muted-foreground">נשתמש בפרטים אלו לאישור התור ותזכורות בלבד</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">שם מלא</Label>
          <Input
            id="fullName"
            value={values.fullName}
            onChange={(e) => setValues((v) => ({ ...v, fullName: e.target.value }))}
            placeholder="לדוגמה: מיטל כהן"
          />
          {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">טלפון נייד</Label>
          <Input
            id="phone"
            dir="ltr"
            value={values.phone}
            onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
            placeholder="050-1234567"
          />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">אימייל (אופציונלי)</Label>
          <Input
            id="email"
            dir="ltr"
            type="email"
            value={values.email}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
            placeholder="name@example.com"
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes">הערות, אלרגיות או העדפות (אופציונלי)</Label>
          <Textarea
            id="notes"
            value={values.notes}
            onChange={(e) => setValues((v) => ({ ...v, notes: e.target.value }))}
            placeholder="לדוגמה: רגישות לאצטון, מועדפת ג'ל בלבד"
          />
        </div>

        <Button type="submit" size="lg" className="w-full">
          המשך לאישור התור
        </Button>
      </form>
    </div>
  );
}
