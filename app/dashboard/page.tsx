import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">לוח הבקרה</h1>
        <Link
          href="/dashboard/children/new"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          + הוספת ילד/ה
        </Link>
      </div>
    </div>
  );
}
