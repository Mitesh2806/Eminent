"use client";
import { Card } from '@/components/ui/card';
import React from 'react'
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { AudioWaveform, TestTube, Settings2, ArrowRight, LucideSpeaker } from 'lucide-react';
import { useState, useEffect } from 'react';

const tools = [
  {
    label: 'Viva Questionaire',
    href: '/speech-assignment/voice-questions',
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
    label: 'Daily Class Quiz',
    href: '/lecture-transcript',
    icon: TestTube,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
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
          Explore our speech assignments for aceing your viva
        </h2>
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
              <ArrowRight className='w-5 h-5 mr-2' />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default StudentDashboard;