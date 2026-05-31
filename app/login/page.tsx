"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess("נשלח אליך מייל אישור. אנא בדוק את תיבת הדואר ואשר את החשבון.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("Invalid login credentials")) {
        setError("פרטי הכניסה שגויים. בדוק אימייל וסיסמא.");
      } else if (msg.includes("already registered") || msg.includes("already been registered")) {
        setError("כתובת האימייל כבר רשומה. נסה להתחבר.");
      } else {
        setError(`שגיאה: ${msg || "שגיאה לא ידועה"}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4"
      dir="rtl"
    >
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-2xl">🏕️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Trend &amp; Fan</h1>
          <p className="text-gray-500 text-sm mt-1">פלטפורמת קייטנות וחוגים לילדים</p>
        </div>

        <Card className="shadow-xl border-0 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-l from-indigo-600 to-blue-500 text-white p-6">
            <CardTitle className="text-lg font-bold">
              {mode === "login" ? "כניסה לחשבון" : "יצירת חשבון חדש"}
            </CardTitle>
            <CardDescription className="text-blue-100 text-sm mt-1">
              {mode === "login"
                ? "הזן את פרטיך כדי להיכנס"
                : "הצטרף לפלטפורמה בחינם"}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 block">
                  כתובת אימייל
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  dir="ltr"
                  className="text-left"
                  disabled={loading}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700 block">
                  סיסמא
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="לפחות 6 תווים"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  dir="ltr"
                  className="text-left"
                  disabled={loading}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                  <span className="flex-shrink-0">⚠️</span>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-2">
                  <span className="flex-shrink-0">✅</span>
                  <p className="text-green-700 text-sm">{success}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-12 rounded-xl text-base"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {mode === "login" ? "נכנס..." : "יוצר חשבון..."}
                  </span>
                ) : mode === "login" ? (
                  "כניסה"
                ) : (
                  "יצירת חשבון"
                )}
              </Button>
            </form>

            <div className="mt-5 text-center border-t pt-4">
              <p className="text-sm text-gray-500">
                {mode === "login" ? "אין לך חשבון עדיין?" : "כבר יש לך חשבון?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "login" ? "signup" : "login");
                    setError(null);
                    setSuccess(null);
                  }}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  {mode === "login" ? "הרשמה" : "כניסה"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
