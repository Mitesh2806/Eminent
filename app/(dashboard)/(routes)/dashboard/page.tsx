"use client";
import { Card } from '@/components/ui/card';
import React from 'react'
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { AudioWaveform, TestTube, Settings2, ArrowRight, LucideSpeaker, LucideVideotape, LucideBookImage } from 'lucide-react';
import { useState, useEffect } from 'react';

const tools = [
  {
    label: 'Speech Test',
    href: '/speech-assignment',
    icon: AudioWaveform,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  // {
  //   label: 'Chat',
  //   href: '/chat',
  //   icon: LucideSpeaker,
  //   color: 'text-blue-500',
  //   bgColor: 'bg-blue-500/10'
  // },
  {
    label: 'CreateCourse',
    href: '/create',
    icon: TestTube,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  {
    label: "Concept Visualizer",
    href: "/visualize",
    color: 'text-blue-500',
    bgColor: 'text-blue-500/10',
    icon: LucideVideotape
},
{
  label: "Learn with PDF",
  href: "/learnwithpdf",
  color: 'text-blue-500',
  bgColor: 'text-blue-500/10',
  icon: LucideBookImage
},
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  }
]

const StudentDashboard = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) return null;
  
  return (
    <div>
      <div className='mb-8 space-y-4'>
        <h2 className='text-2xl font-bold md:text-4xl text-center'>
          Explore our Calenter and drown in the sea of knowledge
        </h2>
        <p className='text-muted-foreground font-light text-sm md:text-lg text-center'>
          Your one-stop destination for all your educational
          needs. Dive in and explore the world of knowledge.
        </p>
      </div>
      <div className='px-4 md:px-20 lg:px-32 space-y-4'>
        {tools.map((tool) => (
          <Card
            onClick={() => router.push(tool.href)}
            key={tool.href}
            className='border-black/5 cursor-pointer'
          >
            <div className='flex items-center justify-between p-4'>
              <div className='flex items-center gap-x-4'>
                <div className={cn(tool.bgColor, 'p-2 rounded-md')}>
                  <tool.icon className={cn(tool.color, 'h-8 w-8')} />
                </div>
                <div className='font-semibold text-lg'>
                  {tool.label}
                </div>
              </div>
              <ArrowRight className='w-5 h-5' />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default StudentDashboard;