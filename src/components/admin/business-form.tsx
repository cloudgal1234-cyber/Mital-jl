"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateBusinessInfo } from "@/lib/actions/business";

type BusinessInfo = {
  name: string;
  address: string;
  phone: string;
  instagram: string | null;
  facebook: string | null;
  whatsapp: string | null;
  about: string | null;
};

export function BusinessForm({ initial }: { initial: BusinessInfo }) {
  const [name, setName] = useState(initial.name);
  const [address, setAddress] = useState(initial.address);
  const [phone, setPhone] = useState(initial.phone);
  const [instagram, setInstagram] = useState(initial.instagram ?? "");
  const [facebook, setFacebook] = useState(initial.facebook ?? "");
  const [whatsapp, setWhatsapp] = useState(initial.whatsapp ?? "");
  const [about, setAbout] = useState(initial.about ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await updateBusinessInfo({ name, address, phone, instagram, facebook, whatsapp, about });
      if (res.success) {
        setSaved(true);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <Card className="max-w-xl space-y-4 p-5">
      <div className="space-y-1.5">
        <Label htmlFor="biz-name">שם העסק</Label>
        <Input id="biz-name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="biz-address">כתובת</Label>
        <Input id="biz-address" value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="biz-phone">טלפון</Label>
        <Input id="biz-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="biz-instagram">אינסטגרם</Label>
          <Input id="biz-instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@mital.nails" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="biz-whatsapp">וואטסאפ</Label>
          <Input id="biz-whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="050-0000000" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="biz-facebook">פייסבוק</Label>
        <Input id="biz-facebook" value={facebook} onChange={(e) => setFacebook(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="biz-about">קצת עלינו (אופציונלי)</Label>
        <Textarea id="biz-about" value={about} onChange={(e) => setAbout(e.target.value)} />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
      {saved && !error && <p className="text-xs text-emerald-600">הפרטים נשמרו בהצלחה</p>}

      <Button onClick={handleSave} disabled={isPending || !name.trim() || !address.trim() || !phone.trim()}>
        {isPending ? "שומר..." : "שמירת פרטי העסק"}
      </Button>
    </Card>
  );
}
