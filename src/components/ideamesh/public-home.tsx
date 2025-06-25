'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, BrainCircuit, Zap, Users, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: <BrainCircuit className="h-10 w-10 text-primary" />,
    title: 'Visualize Your Thoughts',
    description: 'Create beautiful, interactive knowledge graphs. Map out concepts, brainstorm ideas, and see the bigger picture with our intuitive drag-and-drop interface.',
  },
  {
    icon: <Zap className="h-10 w-10 text-primary" />,
    title: 'AI-Powered Insights',
    description: 'Let our AI assistant help you find hidden connections, suggest new links, and summarize complex graphs into digestible insights. Supercharge your thinking.',
  },
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: 'Collaborate & Share',
    description: 'Work on graphs with your team in real-time or share your creations with the world. IdeaMesh makes it easy to build knowledge together.',
  },
];

export default function PublicHomePage() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="w-full py-20 md:py-32 lg:py-40 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-card/10"></div>
        <div className="container mx-auto px-4 text-center md:px-6">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight font-headline sm:text-5xl md:text-6xl">
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

      {/* Features Section */}
      <section className="w-full py-20 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Everything You Need to Think Clearly</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              IdeaMesh provides the tools to not just capture your ideas, but to understand them on a deeper level.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-12 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="flex h-full flex-col">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Feature Section */}
      <section className="w-full bg-card/10 py-20 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-10 md:grid-cols-2 md:items-center">
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold tracking-tighter">See Your Knowledge Come to Life</h2>
                    <p className="text-muted-foreground">
                        Our interactive graph visualization isn't just pretty to look atâ€”it's a powerful tool for discovery. Drag nodes, create connections, and watch as your personal knowledge base grows and evolves.
                    </p>
                     <ul className="grid gap-2 py-2 text-sm text-muted-foreground">
                        <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Drag-and-drop interface</li>
                        <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Customizable nodes and links</li>
                        <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> AI-powered link suggestions</li>
                    </ul>
                </div>
                <div>
                  <Image
                    src="https://placehold.co/800x600.png"
                    width={800}
                    height={600}
                    alt="An example of the IdeaMesh graph interface"
                    className="rounded-xl shadow-lg"
                    data-ai-hint="knowledge graph interface"
                  />
                </div>
            </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 md:py-24">
        <div className="container mx-auto px-4 text-center md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Ready to Map Your Mind?
          </h2>
          <p className="mx-auto mt-4 max-w-[600px] text-muted-foreground md:text-xl">
            Stop losing great ideas in a sea of notes. Start building your second brain today. It's free to get started.
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
