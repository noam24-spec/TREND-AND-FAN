"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, ChevronRight, Baby } from "lucide-react";

// Israeli ID validation (Luhn-based algorithm)
function validateIsraeliId(id: string): boolean {
  if (!/^\d{9}$/.test(id)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let digit = parseInt(id[i]) * ((i % 2) + 1);
    if (digit > 9) digit -= 9;
    sum += digit;
  }
  return sum % 10 === 0;
}

interface FormData {
  full_name: string;
  id_number: string;
  date_of_birth: string;
  allergies: string;
  health_notes: string;
}

interface FieldErrors {
  full_name?: string;
  id_number?: string;
  date_of_birth?: string;
  confirmed?: string;
}

export default function AddChildPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    id_number: "",
    date_of_birth: "",
    allergies: "",
    health_notes: "",
  });

  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const validate = (): boolean => {
    const errors: FieldErrors = {};

    if (!formData.full_name.trim())
      errors.full_name = "שם מלא הוא שדה חובה";

    if (!formData.id_number.trim()) {
      errors.id_number = "תעודת זהות היא שדה חובה";
    } else if (!validateIsraeliId(formData.id_number)) {
      errors.id_number = "תעודת זהות אינה תקינה — נא להזין 9 ספרות תקינות";
    }

    if (!formData.date_of_birth)
      errors.date_of_birth = "תאריך לידה הוא שדה חובה";

    if (!confirmed)
      errors.confirmed = "נדרש אישור ההצהרה הרפואית להמשך";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("לא נמצא משתמש מחובר. אנא התחבר מחדש למערכת.");
        return;
      }

      const { error: insertError } = await supabase.from("children").insert({
        parent_id: user.id,
        full_name: formData.full_name.trim(),
        id_number: formData.id_number.trim(),
        date_of_birth: formData.date_of_birth,
        allergies: formData.allergies.trim() || null,
        health_notes: formData.health_notes.trim() || null,
      });

      if (insertError) throw insertError;

      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "שגיאה לא ידועה";
      setError(`שגיאה בשמירת הנתונים: ${message}. אנא נסה שוב.`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-start justify-center py-8 px-4"
      dir="rtl"
    >
      <div className="w-full max-w-2xl">
        {/* Back navigation */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 transition-colors font-medium"
        >
          <ChevronRight className="w-4 h-4" />
          חזרה ללוח הבקרה
        </button>

        <Card className="shadow-xl border-0 rounded-2xl overflow-hidden">
          {/* Gradient header */}
          <CardHeader className="bg-gradient-to-l from-indigo-600 to-blue-500 text-white p-7">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Baby className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">
                  הוספת ילד/ה לפרופיל
                </CardTitle>
                <CardDescription className="text-blue-100 text-sm mt-1">
                  מלא את הפרטים הבאים כדי להוסיף ילד/ה לחשבונך
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-7">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>

              {/* Full Name */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="full_name"
                  className="text-sm font-semibold text-gray-700 block"
                >
                  שם מלא של הילד/ה{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="full_name"
                  type="text"
                  placeholder="למשל: יוסי כהן"
                  value={formData.full_name}
                  onChange={(e) => handleChange("full_name", e.target.value)}
                  className={`text-right ${
                    fieldErrors.full_name
                      ? "border-red-400 focus-visible:ring-red-400"
                      : ""
                  }`}
                  disabled={loading}
                  autoComplete="off"
                />
                {fieldErrors.full_name && (
                  <p className="text-red-500 text-xs">{fieldErrors.full_name}</p>
                )}
              </div>

              {/* ID Number */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="id_number"
                  className="text-sm font-semibold text-gray-700 block"
                >
                  תעודת זהות <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="id_number"
                  type="text"
                  inputMode="numeric"
                  placeholder="000000000"
                  maxLength={9}
                  value={formData.id_number}
                  onChange={(e) =>
                    handleChange(
                      "id_number",
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  dir="ltr"
                  className={`text-left tracking-widest font-mono ${
                    fieldErrors.id_number
                      ? "border-red-400 focus-visible:ring-red-400"
                      : ""
                  }`}
                  disabled={loading}
                  autoComplete="off"
                />
                {fieldErrors.id_number && (
                  <p className="text-red-500 text-xs">{fieldErrors.id_number}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="date_of_birth"
                  className="text-sm font-semibold text-gray-700 block"
                >
                  תאריך לידה <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) =>
                    handleChange("date_of_birth", e.target.value)
                  }
                  max={today}
                  dir="ltr"
                  className={`text-left ${
                    fieldErrors.date_of_birth
                      ? "border-red-400 focus-visible:ring-red-400"
                      : ""
                  }`}
                  disabled={loading}
                />
                {fieldErrors.date_of_birth && (
                  <p className="text-red-500 text-xs">
                    {fieldErrors.date_of_birth}
                  </p>
                )}
              </div>

              {/* Health section divider */}
              <div className="pt-2 pb-1">
                <div className="flex items-center gap-3">
                  <div className="flex-1 border-t border-gray-200" />
                  <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                    מידע בריאותי — אופציונלי
                  </span>
                  <div className="flex-1 border-t border-gray-200" />
                </div>
              </div>

              {/* Allergies */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="allergies"
                  className="text-sm font-semibold text-gray-700 block"
                >
                  אלרגיות ורגישויות למזון
                </Label>
                <Textarea
                  id="allergies"
                  placeholder="לדוגמה: אלרגיה לאגוזים, רגישות ללקטוז, אסתמה..."
                  value={formData.allergies}
                  onChange={(e) => handleChange("allergies", e.target.value)}
                  className="text-right resize-none"
                  rows={3}
                  disabled={loading}
                />
              </div>

              {/* Health Notes */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="health_notes"
                  className="text-sm font-semibold text-gray-700 block"
                >
                  הצהרת בריאות והערות רפואיות
                </Label>
                <Textarea
                  id="health_notes"
                  placeholder="הערות רפואיות, מגבלות פעילות גופנית, תרופות קבועות, מצבים רפואיים מיוחדים..."
                  value={formData.health_notes}
                  onChange={(e) => handleChange("health_notes", e.target.value)}
                  className="text-right resize-none"
                  rows={4}
                  disabled={loading}
                />
              </div>

              {/* Medical Confirmation Checkbox */}
              <div
                className={`rounded-xl p-4 border-2 transition-colors ${
                  fieldErrors.confirmed
                    ? "bg-red-50 border-red-300"
                    : confirmed
                    ? "bg-green-50 border-green-300"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => {
                      setConfirmed(e.target.checked);
                      if (fieldErrors.confirmed) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          confirmed: undefined,
                        }));
                      }
                    }}
                    className="mt-0.5 w-4 h-4 accent-indigo-600 cursor-pointer flex-shrink-0"
                    disabled={loading}
                  />
                  <span
                    className={`text-sm font-medium leading-relaxed ${
                      fieldErrors.confirmed ? "text-red-700" : "text-amber-800"
                    }`}
                  >
                    אני מאשר/ת כי כל הפרטים הרפואיים נכונים ומדויקים{" "}
                    <span className="text-red-500">*</span>
                  </span>
                </label>
                {fieldErrors.confirmed && (
                  <p className="text-red-500 text-xs mt-2 pr-7">
                    {fieldErrors.confirmed}
                  </p>
                )}
              </div>

              {/* Global Error Banner */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <span className="text-red-500 flex-shrink-0 text-base">⚠️</span>
                  <p className="text-red-700 text-sm font-medium leading-relaxed">
                    {error}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-12 rounded-xl text-base transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      שומר פרטים...
                    </span>
                  ) : (
                    "הוספת ילד/ה לפרופיל"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-5">
          המידע מאובטח ומוצפן · מדיניות פרטיות
        </p>
      </div>
    </div>
  );
}
