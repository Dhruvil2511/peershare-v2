import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"; // Toggle between dark and light
    setTheme(newTheme);
  };

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme} className="relative">
      {/* Show Sun icon for Light mode */}
      {theme === "light" ? (
        <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
      ) : (
        // Show Moon icon for Dark mode
        <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
      )}

      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
