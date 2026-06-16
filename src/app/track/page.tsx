"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ClipboardList,
  ShieldCheck,
  History,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TrackingSearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load search history from localStorage
    const history = localStorage.getItem("track_history");
    if (history) {
      try {
        setRecentSearches(JSON.parse(history));
      } catch (e) {
        console.error("Failed to parse search history", e);
      }
    }
  }, []);

  const handleSearch = (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setError("กรุณากรอกหมายเลขใบงานหรือเบอร์โทรศัพท์");
      return;
    }

    // Save to history
    const updatedHistory = [
      trimmed,
      ...recentSearches.filter((q) => q !== trimmed),
    ].slice(0, 5);
    setRecentSearches(updatedHistory);
    localStorage.setItem("track_history", JSON.stringify(updatedHistory));

    // Redirect to tracking page
    router.push(`/track/${encodeURIComponent(trimmed)}`);
  };

  const handleClearHistory = () => {
    localStorage.removeItem("track_history");
    setRecentSearches([]);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans antialiased flex flex-col justify-between">
      {/* Top Navigation */}
      <nav className="navbar bg-white/70 dark:bg-zinc-900/70 border-b border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xs">
        <div className="container mx-auto flex items-center justify-between py-3 px-4">
          <a
            href="/"
            className="text-lg font-bold tracking-tight text-blue-600 hover:text-blue-500 transition-colors"
          >
            rubphoneshop
          </a>
          <div className="flex items-center gap-4">
            <a
              href="/track"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              ติดตามงาน
            </a>
            <a
              href="/contact"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              ติดต่อเรา
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content Container */}
      <main className="grow shrink-0 flex flex-col w-full items-center justify-center px-4 py-12">
        <div className="w-full max-w-full sm:max-w-xl lg:max-w-2xl space-y-6 mx-auto">
          <div className="text-center space-y-2 flex flex-col items-center justify-center w-full">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              ติดตามงาน รับ-ส่ง
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
              กรอกหมายเลขงาน หรือเบอร์โทรศัพท์ของคุณเพื่อเช็คสถานะล่าสุด
            </p>
          </div>

          <Card className="w-full bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-6 shadow-lg backdrop-blur-xs">
            <CardHeader className="pb-3 w-full">
              <CardTitle className="text-base font-bold flex flex-wrap items-center gap-2">
                <Search className="size-4 text-blue-500" />
                ค้นหาข้อมูล
              </CardTitle>
              <CardDescription className="text-xs">
                รองรับรูปแบบเลขงาน เช่น{" "}
                <code className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1 rounded">
                  RP-xxxxxx
                </code>{" "}
                หรือ เบอร์โทรศัพท์ของผู้รับ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 w-full">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch(query);
                }}
                className="space-y-3 w-full"
              >
                <div className="relative w-full">
                  <Input
                    type="text"
                    placeholder="เลขงาน หรือ เบอร์โทรศัพท์  "
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      if (error) setError("");
                    }}
                    className="pr-10 h-12 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500"
                  />
                  <div className="absolute right-3 top-3.5 flex items-center gap-1.5 text-zinc-400">
                    <ClipboardList className="size-4" />
                  </div>
                </div>

                {error && (
                  <p className="text-xs font-semibold text-rose-500">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  ค้นหาสถานะ
                  <ArrowRight className="size-4" />
                </Button>
              </form>

              {/* Recent Searches / History */}
              {recentSearches.length > 0 && (
                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <History className="size-3" />
                      ค้นหาก่อนหน้า
                    </span>
                    <button
                      onClick={handleClearHistory}
                      className="hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                    >
                      ล้างประวัติ
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setQuery(item);
                          handleSearch(item);
                        }}
                        className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all text-zinc-700 dark:text-zinc-300"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="flex items-center justify-center gap-2 text-xs text-zinc-400 w-full">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>คุ้มครองและทำรายการผ่านระบบของ rubphoneshop ปลอดภัย 100%</span>
        </div>
        &copy; {new Date().getFullYear()} rubphoneshop. All rights reserved.
      </footer>
    </div>
  );
}
