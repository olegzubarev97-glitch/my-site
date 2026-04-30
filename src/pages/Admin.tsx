import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useState } from "react";
import {
  LayoutDashboard,
  Utensils,
  Users,
  FileText,
  Settings,
  Image,
  LogOut,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { RationManager } from "@/components/admin/RationManager";
import { LeadManager } from "@/components/admin/LeadManager";
import { ContentManager } from "@/components/admin/ContentManager";
import { ConfigManager } from "@/components/admin/ConfigManager";
import { GalleryManager } from "@/components/admin/GalleryManager";

const TABS = [
  { id: "dashboard", label: "Обзор", icon: LayoutDashboard },
  { id: "rations", label: "Рационы", icon: Utensils },
  { id: "leads", label: "Заявки", icon: Users },
  { id: "content", label: "Контент", icon: FileText },
  { id: "gallery", label: "Галерея", icon: Image },
  { id: "config", label: "Настройки", icon: Settings },
];

export default function Admin() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const logoutMutation = trpc.auth.logout.useMutation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-[#6B7B5E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        window.location.href = "/";
      },
    });
  };

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab />;
      case "rations":
        return <RationManager />;
      case "leads":
        return <LeadManager />;
      case "content":
        return <ContentManager />;
      case "gallery":
        return <GalleryManager />;
      case "config":
        return <ConfigManager />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200 fixed h-screen">
        <div className="p-4 border-b border-gray-200">
          <div className="font-semibold text-[#1E1E1E]">
            in balance <span className="text-[#6B7B5E]">nutrition</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">Админ-панель</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  activeTab === tab.id
                    ? "bg-[#6B7B5E]/10 text-[#6B7B5E] font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3 px-3">
            <div className="w-8 h-8 rounded-full bg-[#6B7B5E]/10 flex items-center justify-center text-[#6B7B5E] text-sm font-medium">
              {user.name?.[0] || "A"}
            </div>
            <div className="text-sm truncate">{user.name || "Admin"}</div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-500 hover:text-red-600"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Выйти
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="font-semibold text-[#1E1E1E]">
          in balance <span className="text-[#6B7B5E]">nutrition</span>
        </div>
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <button className="p-2">
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[260px] p-0">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="text-sm font-medium">Меню</div>
            </div>
            <nav className="p-3 space-y-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      activeTab === tab.id
                        ? "bg-[#6B7B5E]/10 text-[#6B7B5E] font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
            <div className="p-3 border-t border-gray-200">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-500 hover:text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Выйти
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-64 pt-14 md:pt-0">
        <div className="p-6 max-w-6xl mx-auto">{renderTab()}</div>
      </main>
    </div>
  );
}

function DashboardTab() {
  const { data: stats } = trpc.lead.stats.useQuery();
  const { data: rationsData } = trpc.ration.adminList.useQuery();

  const cards = [
    { label: "Всего заявок", value: stats?.total ?? 0, color: "bg-blue-50 text-blue-700" },
    { label: "Новые заявки", value: stats?.new ?? 0, color: "bg-orange-50 text-orange-700" },
    { label: "В обработке", value: stats?.contacted ?? 0, color: "bg-yellow-50 text-yellow-700" },
    { label: "Активных рационов", value: rationsData?.filter((r) => r.isActive).length ?? 0, color: "bg-[#6B7B5E]/10 text-[#6B7B5E]" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#1E1E1E] mb-6">Обзор</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className={`rounded-xl p-5 ${card.color}`}>
            <div className="text-3xl font-bold mb-1">{card.value}</div>
            <div className="text-sm opacity-80">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Быстрые действия</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <a href="/admin" onClick={(e) => { e.preventDefault(); window.location.hash = "rations"; }} className="p-4 rounded-lg border border-gray-200 hover:border-[#6B7B5E] hover:bg-[#6B7B5E]/5 transition-colors">
            <Utensils className="w-5 h-5 text-[#6B7B5E] mb-2" />
            <div className="font-medium text-sm">Управление рационами</div>
          </a>
          <a href="/admin" onClick={(e) => { e.preventDefault(); window.location.hash = "leads"; }} className="p-4 rounded-lg border border-gray-200 hover:border-[#6B7B5E] hover:bg-[#6B7B5E]/5 transition-colors">
            <Users className="w-5 h-5 text-[#6B7B5E] mb-2" />
            <div className="font-medium text-sm">Просмотр заявок</div>
          </a>
          <a href="/admin" onClick={(e) => { e.preventDefault(); window.location.hash = "content"; }} className="p-4 rounded-lg border border-gray-200 hover:border-[#6B7B5E] hover:bg-[#6B7B5E]/5 transition-colors">
            <FileText className="w-5 h-5 text-[#6B7B5E] mb-2" />
            <div className="font-medium text-sm">Редактировать контент</div>
          </a>
        </div>
      </div>
    </div>
  );
}
