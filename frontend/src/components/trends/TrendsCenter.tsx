import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { TrendsHeader } from "./TrendsHeader";
import { TrendsList } from "./TrendsList";
import { Recommendations } from "./Recommendations";

export function TrendsCenter() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Account Search */}
      <TrendsHeader />

      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 h-16 p-2 bg-muted/80 rounded-xl">
          <TabsTrigger
            value="trends"
            className="rounded-lg data-[state=active]:bg-red-500 data-[state=active]:text-white  data-[state=active]:shadow-sm transition-all h-full"
          >
            Emerging Trends
          </TabsTrigger>

          <TabsTrigger
            value="recommendations"
            className="rounded-lg h-full data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
          >
            Recommendations
          </TabsTrigger>
        </TabsList>

        {/* TRENDS TAB */}
        <TabsContent value="trends" className="space-y-6 mt-0">
          <TrendsList />
        </TabsContent>

        {/* RECOMMENDATIONS TAB */}
        <TabsContent value="recommendations" className="space-y-6 mt-0">
          <Recommendations />
        </TabsContent>
      </Tabs>
    </div>
  );
}
