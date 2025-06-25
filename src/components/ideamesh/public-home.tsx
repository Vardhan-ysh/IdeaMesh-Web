'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, BrainCircuit, Zap, Users, Check, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: <BrainCircuit className="h-7 w-7 text-primary" />,
    title: 'Visualize Your Thoughts',
    description: 'Transform abstract ideas into beautiful, dynamic graphs that evolve with your thinking.',
  },
  {
    icon: <Zap className="h-7 w-7 text-primary" />,
    title: 'AI-Powered Insights',
    description: 'Discover hidden links, summarize instantly, and let AI become your brainstorming partner.',
  },
  {
    icon: <Users className="h-7 w-7 text-primary" />,
    title: 'Team Up & Share',
    description: 'Create together, sync in real-time, and share your vision with the world effortlessly.',
  },
];

export default function PublicHomePage() {
  return (
    <main className="flex-1 bg-gradient-to-b from-background via-background/70 to-muted">
      {/* Hero Section */}
      <section className="w-full py-40 md:py-52 lg:py-60 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/5 via-background to-accent/5"></div>
        <div className="container mx-auto px-4 text-center md:px-8">
          <div className="mx-auto max-w-4xl animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <h1 className="text-5xl font-extrabold tracking-tight font-headline sm:text-6xl md:text-7xl text-foreground leading-tight">
              Map. Think. Evolve.
            </h1>
            <p className="mt-6 text-xl text-muted-foreground">
              Connect thoughts, uncover insights, and build your second brain â€” visually and intelligently.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link href="/auth">
                <Button size="lg">Start Free <ArrowRight className="ml-2 h-5 w-5" /></Button>
              </Link>
              <Link href="#features">
                <Button variant="ghost" size="lg">Explore Features</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Panel */}
      <section className="w-full py-24 md:py-32 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" /> Real-Time AI Interaction
              </div>
              <h2 className="text-4xl font-bold tracking-tight">From Prompt to Powerful Graph</h2>
              <p className="text-muted-foreground">
                Just type your thoughts â€” IdeaMeshâ€™s AI instantly converts them into visual networks, building structure from chaos.
              </p>
              <ul className="text-sm text-muted-foreground grid gap-2">
                <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 text-primary" /> Understand complexity at a glance</li>
                <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 text-primary" /> Modify and interact with your graph using plain language</li>
                <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 text-primary" /> Turn chaos into clarity with smart suggestions</li>
              </ul>
            </div>
            <Image
              src="/assets/images/real_example.png"
              alt="Graph Generated from Prompt"
              width={1000}
              height={600}
              className="rounded-xl shadow-2xl object-cover border border-border/10"
            />
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section id="features" className="w-full bg-background py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mb-16 text-center animate-fade-in-up">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-medium text-primary">
              Why IdeaMesh
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Smarter Thinking, Seamless Collaboration</h2>
            <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
              Whether you're brainstorming solo or building knowledge with others, IdeaMesh keeps your ideas alive and connected.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {features.map((feature, i) => (
              <Card 
                key={i} 
                className="flex h-full flex-col border-muted/20 hover:border-primary transition-all duration-300 shadow-sm hover:shadow-md animate-fade-in-up"
                style={{ animationDelay: `${800 + i * 150}ms` }}
              >
                <CardHeader className="items-center text-center">
                  <div className="mb-4 rounded-full bg-primary/10 p-3">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                  <p>{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full py-24 md:py-32 bg-gradient-to-br from-primary/5 via-background to-muted">
        <div className="container mx-auto px-4 text-center md:px-8 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
          <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl">Build Your Second Brain Today</h2>
          <p className="mt-4 max-w-xl mx-auto text-muted-foreground md:text-xl">
            Your thoughts deserve more than notes. Give them a home where they thrive and evolve.
          </p>
          <div className="mt-8">
            <Link href="/auth">
              <Button size="lg">Start Mapping <ArrowRight className="ml-2 h-5 w-5" /></Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
