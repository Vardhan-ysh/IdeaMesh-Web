
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
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth" className="w-full max-w-xs sm:w-auto">
                <Button size="lg" className="w-full">Start Free <ArrowRight className="ml-2 h-5 w-5" /></Button>
              </Link>
              <Link href="#features" className="w-full max-w-xs sm:w-auto">
                <Button variant="ghost" size="lg" className="w-full">Explore Features</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Panel */}
      <section className="w-full py-24 md:py-32 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 md:px-8">
          <div className="space-y-6 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" /> Real-Time AI Interaction
            </div>
            <h2 className="text-4xl font-bold tracking-tight">From Prompt to Powerful Graph</h2>
            <p className="text-muted-foreground">
              Just type your thoughts â€” IdeaMeshâ€™s AI instantly converts them into visual networks, building structure from chaos.
            </p>
          </div>
          
          <div className="relative mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-semibold text-muted-foreground text-center">Your Prompt</p>
                  <Image
                    src="/assets/images/ai_working_preview.png"
                    alt="A user's prompt to the AI"
                    width={1000}
                    height={600}
                    className="rounded-xl shadow-2xl object-cover border border-border/10"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-semibold text-muted-foreground text-center">AI-Generated Result</p>
                  <Image
                    src="/assets/images/real_example.png"
                    alt="Graph Generated from Prompt"
                    width={1000}
                    height={600}
                    className="rounded-xl shadow-2xl object-cover border border-border/10"
                  />
                </div>
            </div>
            <ArrowRight className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 text-primary/50 hidden lg:block" />
          </div>

           <ul className="text-sm text-muted-foreground grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8 text-center">
              <li className="flex flex-col items-center gap-2"><Check className="mr-2 mt-1 h-4 w-4 text-primary" /> Understand complexity at a glance</li>
              <li className="flex flex-col items-center gap-2"><Check className="mr-2 mt-1 h-4 w-4 text-primary" /> Modify with plain language</li>
              <li className="flex flex-col items-center gap-2"><Check className="mr-2 mt-1 h-4 w-4 text-primary" /> Turn chaos into clarity</li>
            </ul>
        </div>
      </section>

      {/* Redesigned Visual Organization Section */}
      <section className="w-full py-24 md:py-32 bg-background">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 xl:gap-24 items-center animate-fade-in-up">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <BrainCircuit className="h-4 w-4" /> Visual Organization
              </div>
              <h2 className="text-4xl font-bold tracking-tight">Go From Scattered Notes to a Clear Map</h2>
              <p className="text-lg text-muted-foreground">
                Stop losing great thoughts in a sea of linear notes. IdeaMesh gives your ideas a home where they can connect, grow, and form a bigger picture.
              </p>
              <ul className="space-y-4">
                <li>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="mt-1 h-5 w-5 text-primary" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-foreground">Map relationships</p>
                      <p className="text-muted-foreground text-sm">Visually connect concepts to see how they fit together.</p>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="mt-1 h-5 w-5 text-primary" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-foreground">Customize everything</p>
                      <p className="text-muted-foreground text-sm">Use colors, shapes, and images to make your graph unique.</p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl blur-2xl opacity-50 animate-pulse-glow" style={{animationDuration: '10s'}}></div>
              <Image
                src="/assets/images/sample_graph.png"
                alt="A sample knowledge graph showing interconnected ideas."
                width={1000}
                height={600}
                className="relative rounded-xl shadow-2xl object-cover border border-border/10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section id="features" className="w-full bg-background/50 py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mb-16 text-center animate-fade-in-up">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-medium text-primary">
              Why IdeaMesh
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">The Ultimate Thinking Tool</h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
              IdeaMesh combines intuitive visual mapping with powerful AI assistance to help you connect ideas, find clarity, and unlock your best thinking.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {features.map((feature, i) => (
              <Card 
                key={i} 
                className="flex h-full flex-col animate-fade-in-up bg-card/50"
                style={{ animationDelay: `${600 + i * 150}ms` }}
              >
                <CardHeader className="items-start">
                  <div className="mb-4 rounded-lg bg-primary/10 p-3 w-auto self-start">{feature.icon}</div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground pt-0 flex-1">
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
