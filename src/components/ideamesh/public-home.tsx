'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, BrainCircuit, Zap, Users, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: <BrainCircuit className="h-8 w-8 text-primary" />,
    title: 'Visualize Your Thoughts',
    description: 'Create beautiful, interactive knowledge graphs. Map out concepts, brainstorm ideas, and see the bigger picture.',
  },
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: 'AI-Powered Insights',
    description: 'Let our AI assistant help you find hidden connections, suggest new links, and summarize complex graphs into digestible insights.',
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'Collaborate & Share',
    description: 'Work on graphs with your team in real-time or share your creations with the world. IdeaMesh makes it easy to build knowledge together.',
  },
];

export default function PublicHomePage() {
  return (
    <main className="flex-1 animate-fade-in bg-background">
      {/* Hero Section */}
      <section className="w-full py-20 md:py-32 lg:py-40 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-accent/10"></div>
        <div className="container mx-auto px-4 text-center md:px-6">
          <div className="mx-auto max-w-3xl animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <h1 className="text-4xl font-bold tracking-tight font-headline sm:text-5xl md:text-6xl text-foreground">
              Unlock Your Ideas with IdeaMesh
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              The intelligent way to visualize, connect, and grow your knowledge. Go from scattered notes to a crystal-clear map of your mind.
            </p>
            <div className="mt-10">
              <Link href="/auth">
                <Button size="lg">
                  Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Visual Feature Section */}
      <section className="w-full pb-20 md:pb-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <Image
              src="/assets/images/real_example.png"
              width={1200}
              height={800}
              alt="An example of a complex and beautiful IdeaMesh graph"
              className="rounded-xl shadow-2xl object-cover mx-auto border border-border/10"
              data-ai-hint="knowledge graph"
            />
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="w-full bg-card/50 py-20 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 flex flex-col items-center justify-center space-y-4 text-center animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Everything You Need</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">A New Way to Think</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              IdeaMesh provides the tools to not just capture your ideas, but to understand them on a deeper level.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl items-stretch gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="flex h-full flex-col animate-fade-in-up hover:border-primary/50"
                style={{ animationDelay: `${800 + index * 150}ms` }}
              >
                <CardHeader className="items-center text-center">
                  <div className="mb-4 rounded-full bg-primary/10 p-3">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 text-center">
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Alternating Feature Sections */}
      <section className="w-full py-20 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
            {/* AI Assistant Feature */}
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center mb-24">
                <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                    <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm text-primary font-semibold">AI Assistant</div>
                    <h2 className="text-3xl font-bold tracking-tighter">Your Creative Co-pilot</h2>
                    <p className="text-muted-foreground">
                        Our GraphAI assistant is more than just a chatbot. Give it a complex prompt, and watch it build entire systems, connect disparate ideas, or clean up your canvas. It understands the context of your graph to provide truly intelligent help.
                    </p>
                     <ul className="grid gap-2 py-2 text-sm text-muted-foreground">
                        <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 text-primary flex-shrink-0" /> Create nodes and relationships with natural language.</li>
                        <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 text-primary flex-shrink-0" /> Automatically rearrange your graph for clarity.</li>
                        <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 text-primary flex-shrink-0" /> Go from a simple prompt to a detailed, interconnected graph.</li>
                    </ul>
                </div>
                <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                    <div className="relative grid grid-cols-2 gap-4 items-start">
                        <div>
                            <p className="text-sm font-semibold text-center mb-2 text-muted-foreground">Your Prompt</p>
                            <Image
                                src="/assets/images/ai_working_preview.png"
                                width={800}
                                height={600}
                                alt="The AI Assistant panel in IdeaMesh, showing a chat interaction"
                                className="rounded-xl shadow-2xl object-cover border border-border/10"
                                data-ai-hint="chatbot interface"
                            />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-center mb-2 text-muted-foreground">AI-Generated Result</p>
                            <Image
                                src="/assets/images/real_example.png"
                                width={800}
                                height={600}
                                alt="A complex graph generated by the AI from the prompt"
                                className="rounded-xl shadow-2xl object-cover border border-border/10"
                                data-ai-hint="complex diagram"
                            />
                        </div>
                        <ArrowRight className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 text-primary bg-background/50 backdrop-blur-sm p-2 rounded-full hidden md:block" />
                    </div>
                </div>
            </div>

            {/* Build Knowledge Feature */}
             <div className="grid gap-10 md:grid-cols-2 md:items-center">
                <div className="animate-fade-in-up md:order-2" style={{ animationDelay: '400ms' }}>
                     <div className="space-y-4">
                        <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm text-primary font-semibold">Build Connections</div>
                        <h2 className="text-3xl font-bold tracking-tighter">From Idea to Insight</h2>
                        <p className="text-muted-foreground">
                            Stop losing great thoughts in a sea of linear notes. IdeaMesh lets you capture individual concepts and then visually link them to build a rich, interconnected knowledge base that grows with you.
                        </p>
                         <ul className="grid gap-2 py-2 text-sm text-muted-foreground">
                            <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 text-primary flex-shrink-0" /> See how your ideas relate to each other at a glance.</li>
                            <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 text-primary flex-shrink-0" /> Customize nodes with colors, shapes, and images.</li>
                            <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 text-primary flex-shrink-0" /> Uncover patterns and new insights you never saw before.</li>
                        </ul>
                    </div>
                </div>
                <div className="animate-fade-in-up md:order-1" style={{ animationDelay: '600ms' }}>
                  <Image
                    src="/assets/images/sample_graph.png"
                    width={800}
                    height={600}
                    alt="A sample graph showing interconnected nodes"
                    className="rounded-xl shadow-2xl object-cover border border-border/10"
                    data-ai-hint="idea map"
                  />
                </div>
            </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 md:py-24 bg-card/50">
        <div className="container mx-auto px-4 text-center md:px-6 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Ready to Map Your Mind?
          </h2>
          <p className="mx-auto mt-4 max-w-[600px] text-muted-foreground md:text-xl">
            Start building your second brain today. It's free to get started.
          </p>
          <div className="mt-8">
            <Link href="/auth">
              <Button size="lg">
                Sign Up Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
