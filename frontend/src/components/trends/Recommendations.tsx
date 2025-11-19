import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  BookOpen,
  Heart,
  Phone,
  ExternalLink,
  MessageCircleHeart,
  ShieldAlert,
  LifeBuoy,
} from "lucide-react";

export function Recommendations() {
  const conversationStarters = [
    {
      category: "General Online Safety",
      icon: ShieldAlert,
      starters: [
        "What kind of things do you enjoy reading about on Reddit?",
        "Have you made any friends online? What are they like?",
        "Is there anything you've seen online lately that confused or worried you?",
      ],
    },
    {
      category: "Mental Health",
      icon: MessageCircleHeart,
      starters: [
        "I noticed you've been spending time in some mental health communities. How are you feeling?",
        "It's okay to talk about difficult feelings. I'm here to listen without judgment.",
        "Have you thought about talking to a counselor? It can really help.",
      ],
    },
    {
      category: "Peer Pressure",
      icon: LifeBuoy,
      starters: [
        "Sometimes people online try to pressure others into doing things. Has that happened to you?",
        "What would you do if someone asked you to do something that made you uncomfortable?",
        "Remember, real friends respect your boundaries and choices.",
      ],
    },
  ];

  const resources = [
    {
      icon: Phone,
      title: "Crisis Text Line",
      description: "Text HOME to 741741",
      link: "https://www.crisistextline.org/",
      type: "Emergency",
      color: "bg-red-100 text-red-700 border-red-200",
    },
    {
      icon: Phone,
      title: "Suicide Prevention Lifeline",
      description: "Call 988",
      link: "https://988lifeline.org/",
      type: "Emergency",
      color: "bg-red-100 text-red-700 border-red-200",
    },
    {
      icon: BookOpen,
      title: "Common Sense Media",
      description: "Age-based social media guidance",
      link: "https://www.commonsensemedia.org/",
      type: "Educational",
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      icon: Heart,
      title: "The Jed Foundation",
      description: "Teen mental health resources",
      link: "https://jedfoundation.org/",
      type: "Support",
      color: "bg-rose-50 text-rose-700 border-rose-200",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 space-y-6">
        <Card className="h-full shadow-sm border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-950">
              <BookOpen className="h-5 w-5 text-red-500" />
              Conversation Starters
            </CardTitle>
            <CardDescription>
              Approachable ways to discuss digital safety without conflict
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {conversationStarters.map((section, index) => {
              const Icon = section.icon;
              return (
                <div key={index} className="space-y-3">
                  <h3 className="text-sm font-bold text-red-600 uppercase tracking-wider flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {section.category}
                  </h3>
                  <ul className="space-y-3">
                    {section.starters.map((starter, idx) => (
                      <li
                        key={idx}
                        className="flex gap-3 text-base p-4 rounded-xl bg-red-50/50 border border-red-100 hover:bg-red-50 hover:border-red-200 transition-all group"
                      >
                        <div className="h-2 w-2 rounded-full bg-red-400 mt-2 shrink-0 group-hover:bg-red-600 transition-colors" />
                        <span className="leading-relaxed text-slate-700 group-hover:text-slate-900">
                          {starter}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="shadow-sm bg-gradient-to-b from-white to-red-50/30 border-red-100 dark:bg-slate-900/50 dark:border-red-900/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <Heart className="h-5 w-5 fill-red-500 text-red-500 animate-pulse" />
              Support Resources
            </CardTitle>
            <CardDescription>Professional help available 24/7</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {resources.map((resource, index) => {
              const Icon = resource.icon;
              return (
                <div
                  key={index}
                  className="relative overflow-hidden p-4 border bg-white dark:bg-slate-950 rounded-xl hover:shadow-md hover:border-red-300 transition-all group cursor-pointer"
                  onClick={() => window.open(resource.link, "_blank")}
                >
                  <div className="flex items-start gap-3 relative z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                        resource.type === "Emergency"
                          ? "bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white"
                          : "bg-slate-100 text-slate-600 group-hover:bg-slate-800 group-hover:text-white"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-bold truncate text-slate-900 dark:text-slate-100 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors">
                          {resource.title}
                        </h4>
                        <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] mb-2 h-5 border-0 ${resource.color}`}
                      >
                        {resource.type}
                      </Badge>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {resource.description}
                      </p>
                    </div>
                  </div>
                  {/* Subtle red glow on hover */}
                  <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/[0.02] transition-colors duration-300" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
