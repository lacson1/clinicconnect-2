import { useState } from "react";
import { Bell, Globe, Moon, Sun, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useRole } from "@/components/role-guard";
import OfflineIndicator from "@/components/offline-indicator";

export default function TopBar() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState("EN");
  const { user } = useRole();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const toggleLanguage = () => {
    setLanguage(language === "EN" ? "HA" : "EN");
  };

  return (
    <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      {/* Search & Breadcrumbs */}
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold text-slate-800">Dashboard</h2>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-4">
        {/* Language Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLanguage}
          className="text-slate-600 hover:text-slate-800"
        >
          <Globe className="w-4 h-4 mr-2" />
          {language}
        </Button>

        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleDarkMode}
          className="text-slate-600 hover:text-slate-800"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* Offline Status Indicator */}
        <OfflineIndicator />



        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-slate-600 hover:text-slate-800">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="text-white w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium">{user?.username}</div>
                <div className="text-xs text-slate-500 capitalize">{user?.role}</div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}