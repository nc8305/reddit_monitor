import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ActivityChart } from "../shared/ActivityChart";
import { RiskIndicator } from "../shared/RiskIndicator";
import { AlertTriangle, TrendingUp, Plus, X, ExternalLink, BookOpen, Phone, Heart } from "lucide-react";

export function TrendsCenter() {
  const [watchList, setWatchList] = useState([
    { id: 1, type: "subreddit", value: "r/selfharm", matches: 0 },
    { id: 2, type: "keyword", value: "suicide", matches: 2 },
    { id: 3, type: "keyword", value: "cutting", matches: 1 },
  ]);
  
  const [newWatchItem, setNewWatchItem] = useState("");

  const emergingTrends = [
    {
      id: 1,
      name: "Blackout Challenge",
      severity: "high" as const,
      communities: 12,
      mentions: 234,
      change: "+89%",
      description: "Dangerous viral challenge involving intentional oxygen deprivation",
      data: [
        { name: "Mon", value: 12 },
        { name: "Tue", value: 18 },
        { name: "Wed", value: 25 },
        { name: "Thu", value: 34 },
        { name: "Fri", value: 52 },
        { name: "Sat", value: 67 },
        { name: "Sun", value: 89 }
      ]
    },
    {
      id: 2,
      name: "Self-Harm Discussion Increase",
      severity: "medium" as const,
      communities: 8,
      mentions: 156,
      change: "+34%",
      description: "Significant rise in discussions about self-harm in teen communities",
      data: [
        { name: "Mon", value: 20 },
        { name: "Tue", value: 22 },
        { name: "Wed", value: 26 },
        { name: "Thu", value: 28 },
        { name: "Fri", value: 31 },
        { name: "Sat", value: 34 },
        { name: "Sun", value: 40 }
      ]
    },
  ];

  const conversationStarters = [
    {
      category: "General Online Safety",
      starters: [
        "What kind of things do you enjoy reading about on Reddit?",
        "Have you made any friends online? What are they like?",
        "Is there anything you've seen online lately that confused or worried you?",
      ]
    },
    {
      category: "Mental Health",
      starters: [
        "I noticed you've been spending time in some mental health communities. How are you feeling?",
        "It's okay to talk about difficult feelings. I'm here to listen without judgment.",
        "Have you thought about talking to a counselor? It can really help.",
      ]
    },
    {
      category: "Peer Pressure",
      starters: [
        "Sometimes people online try to pressure others into doing things. Has that happened to you?",
        "What would you do if someone asked you to do something that made you uncomfortable?",
        "Remember, real friends respect your boundaries and choices.",
      ]
    },
  ];

  const resources = [
    {
      icon: Phone,
      title: "Crisis Text Line",
      description: "Text HOME to 741741",
      link: "https://www.crisistextline.org/",
      type: "Emergency"
    },
    {
      icon: Phone,
      title: "National Suicide Prevention Lifeline",
      description: "Call 988",
      link: "https://988lifeline.org/",
      type: "Emergency"
    },
    {
      icon: BookOpen,
      title: "Common Sense Media",
      description: "Age-based social media guidance",
      link: "https://www.commonsensemedia.org/",
      type: "Educational"
    },
    {
      icon: Heart,
      title: "The Jed Foundation",
      description: "Teen mental health resources",
      link: "https://jedfoundation.org/",
      type: "Support"
    },
  ];

  const addToWatchList = () => {
    if (newWatchItem.trim()) {
      const type = newWatchItem.startsWith("r/") ? "subreddit" : "keyword";
      setWatchList([
        ...watchList,
        { id: Date.now(), type, value: newWatchItem.trim(), matches: 0 }
      ]);
      setNewWatchItem("");
    }
  };

  const removeFromWatchList = (id: number) => {
    setWatchList(watchList.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Risk & Trends Center</h1>
        <p className="text-muted-foreground">Monitor emerging threats and get guidance for conversations</p>
      </div>

      <Tabs defaultValue="watcher" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="watcher">Watcher List</TabsTrigger>
          <TabsTrigger value="trends">Emerging Trends</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="watcher" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Watch List</CardTitle>
              <CardDescription>
                Monitor specific subreddits or keywords across all your children's accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter subreddit (e.g., r/teenagers) or keyword..."
                  value={newWatchItem}
                  onChange={(e) => setNewWatchItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addToWatchList()}
                />
                <Button onClick={addToWatchList}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              <div className="space-y-2">
                {watchList.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant={item.type === "subreddit" ? "default" : "secondary"}>
                        {item.type}
                      </Badge>
                      <span>{item.value}</span>
                      {item.matches > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          {item.matches} new matches
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromWatchList(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {watchList.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No items in your watch list yet.</p>
                  <p className="text-sm">Add subreddits or keywords to monitor.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {emergingTrends.map((trend) => (
            <Card key={trend.id} className={trend.severity === "high" ? "border-[#dc3545]" : "border-[#ffc107]"}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle>{trend.name}</CardTitle>
                      <RiskIndicator level={trend.severity} showIcon={true} />
                    </div>
                    <CardDescription>{trend.description}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="ml-4">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {trend.change}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Communities</p>
                    <p>{trend.communities} subreddits</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Mentions</p>
                    <p>{trend.mentions} posts</p>
                  </div>
                </div>

                <ActivityChart
                  title="Trend Growth (Last 7 Days)"
                  data={trend.data}
                  type="line"
                  color={trend.severity === "high" ? "#dc3545" : "#ffc107"}
                />
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversation Starters</CardTitle>
              <CardDescription>
                Use these prompts to open meaningful dialogue with your child
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {conversationStarters.map((section, index) => (
                <div key={index} className="space-y-3">
                  <h3 className="text-sm text-primary">{section.category}</h3>
                  <ul className="space-y-2">
                    {section.starters.map((starter, idx) => (
                      <li key={idx} className="flex gap-2 text-sm">
                        <span className="text-primary mt-1">•</span>
                        <span className="flex-1 p-2 bg-muted/50 rounded">{starter}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Support Resources</CardTitle>
              <CardDescription>
                Professional help and educational materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {resources.map((resource, index) => {
                  const Icon = resource.icon;
                  return (
                    <div
                      key={index}
                      className="p-4 border rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm truncate">{resource.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {resource.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {resource.description}
                          </p>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto"
                            onClick={() => window.open(resource.link, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Learn More
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
