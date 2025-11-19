import { useState } from "react";

import { Search, UserPlus } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export function TrendsHeader() {
  const [childAccountInput, setChildAccountInput] = useState("");

  const handleAddChild = () => {
    // Logic to add child would go here
    console.log("Searching for:", childAccountInput);
    setChildAccountInput("");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="text-3xl font-bold tracking-tight text-red-500">
          Risk & Trends Center
        </h1>
        <p className="text-muted-foreground mt-1 text-lg">
          Monitor emerging threats, manage keywords, and find guidance.
        </p>
      </div>

      {/* New Account Search Bar */}
      <Card className="bg-red-500/5 border-red-800/20 border-2 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3 text-red-400 font-medium">
            <UserPlus className="h-4 w-4" />
            <span>Connect Child Account</span>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Reddit u/username"
                className="pl-9 bg-white dark:bg-slate-950 border-primary/20 focus-visible:ring-primary/30"
                value={childAccountInput}
                onChange={(e) => setChildAccountInput(e.target.value)}
              />
            </div>
            <Button
              onClick={handleAddChild}
              size="sm"
              className="bg-red-500 text-white hover:bg-primary/90 shadow-sm"
            >
              Add
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
