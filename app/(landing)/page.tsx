import Link from 'next/link'
import React from 'react'
import { Button } from '@/components/ui/button'
import HeroButton from '@/components/Hero-button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from 'next/image'
import faqData from '@/public/data/faqData.json'

const LandingPage = () => {
  return (
    <div className="w-full bg-[#f7f7f5]">
      
      <nav className="flex items-center justify-between sticky top-4 bg-white/80 z-50 max-w-7xl w-full shadow-md rounded-2xl p-4 mx-auto">
        <Link 
          href="/" 
          className="font-semibold text-[#151313] text-2xl font-kodchasan" 
          
        >
          CalenterAI
        </Link>
        <div className="flex gap-2">
          <Button variant="ghost" className="text-[#151313] hover:text-[#ff5734]" asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button className="bg-[#ff5734] hover:bg-[#ff5734]/90 text-white" asChild>
            <Link href="/sign-up">Sign up</Link>
          </Button>
        </div>
      </nav>
      
      
      <div className="relative min-h-screen py-16">
        
        <div className="flex flex-col md:flex-row items-center justify-between h-full relative z-10 max-w-7xl mx-auto px-4">
          <div className="flex-1 text-left mb-8 md:mb-0">
            <h1 
              className="text-6xl font-bold mb-6 text-[#151313]" 
              style={{ fontFamily: 'Kodchasan, sans-serif' }}
            >
              Find the <span className="text-[#ff5734]">right</span> <br />
              course <span className="text-[#151313]">for you</span>
            </h1>
            <p 
              className="text-xl mt-4 max-w-lg text-[#151313]/80" 
              style={{ fontFamily: 'Kodchasan, sans-serif' }}
            >
              See your personalized recommendations <br />
              based on your interests and goals
            </p>
            <div className="mt-8 flex gap-4">
              <Button 
                className="bg-[#ff5734] hover:bg-[#ff5734]/90 text-white text-lg px-8 py-6 rounded-full" 
                style={{ fontFamily: 'Kodchasan, sans-serif' }}
              >
                Start learning
              </Button>
              {/* <Button 
                variant="outline" 
                className="border-[#151313] text-[#151313] hover:text-[#ff5734] text-lg px-6 py-6 rounded-full flex items-center gap-2" 
                style={{ fontFamily: 'Kodchasan, sans-serif' }}
              >
                View our blog
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Button> */}
            </div>
          </div>
          
          <div className="flex-1 justify-center hidden md:flex">
            <div className="relative w-full h-96">
              <Image 
                src="/book.svg"
                alt="Student learning"
                layout="fill"
                objectFit="contain"
                className="transform translate-y-4"
              />
            
            </div>
          </div>
        </div>
       
        {/* <div className="max-w-7xl mx-auto px-4 mt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="bg-[#be94f5]/20 inline-block px-3 py-1 rounded-full text-sm mb-4">
                Education
              </div>
              <p className="text-sm text-[#151313]/70">subjects</p>
              <h3 className="text-5xl font-bold text-[#151313]">+40</h3>
            </div>
            
            <div className="bg-[#be94f5]/10 rounded-xl p-6 shadow-sm">
              <div className="bg-[#fccc42] inline-block px-3 py-1 rounded-full text-sm mb-4">
                Online
              </div>
              <p className="text-sm text-[#151313]/70">courses</p>
              <h3 className="text-5xl font-bold text-[#151313]">+120</h3>
            </div>
            
            <div className="bg-[#fccc42]/10 rounded-xl p-6 shadow-sm">
              <div className="flex items-center bg-white px-3 py-1 rounded-full text-sm mb-4">
                <div className="flex">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#fccc42">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#fccc42">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#fccc42">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#fccc42">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#fccc42">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </div>
                <span className="ml-1">5.0</span>
              </div>
              <p className="text-sm text-[#151313]/70">learner reviews</p>
              <h3 className="text-5xl font-bold text-[#151313]">+180k</h3>
            </div>
          </div>
        </div>
      </div> */}
      </div>
      {/* Pricing Section */}
      <div className=" bg-gradient-to-b from-[#f7f7f5] to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl font-bold mb-4 text-[#151313] font-kodchasan" 
              
            >
              Simple, Transparent Pricing
            </h2>
            <p 
              className="text-xl text-[#151313]/70 max-w-2xl mx-auto font-kodchasan" 
              
            >
              Choose the plan that works best for your learning goals
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Basic Plan */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#f7f7f5] flex flex-col h-full hover:shadow-xl transition-shadow">
              <div className="mb-8">
                <h3 
                  className="text-2xl font-bold mb-2 text-[#151313]" 
                  style={{ fontFamily: 'Kodchasan, sans-serif' }}
                >
                  Basic
                </h3>
                <p className="text-[#151313]/70">Perfect for getting started</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#151313]">$9</span>
                <span className="text-[#151313]/70">/month</span>
              </div>
              <ul className="mb-8 flex-grow space-y-4">
                <li className="flex items-center">
                  <span className="mr-2 text-[#ff5734]">✓</span>
                  Access to foundational AI tutors
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-[#ff5734]">✓</span>
                  5 study sessions per week
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-[#ff5734]">✓</span>
                  Basic progress tracking
                </li>
              </ul>
              <Button 
                className="w-full bg-white hover:bg-[#f7f7f5] text-[#151313] border border-[#151313]" 
                style={{ fontFamily: 'Kodchasan, sans-serif' }}
              >
                Get Started
              </Button>
            </div>
            
            {/* Pro Plan */}
            <div className="bg-[#151313] text-white rounded-2xl shadow-lg p-8 border border-[#151313] flex flex-col h-full relative">
              <div 
                className="absolute -top-4 right-0 left-0 mx-auto w-max px-4 py-1 bg-[#fccc42] text-[#151313] font-medium rounded-full" 
                style={{ fontFamily: 'Kodchasan, sans-serif' }}
              >
                Most Popular
              </div>
              <div className="mb-8">
                <h3 
                  className="text-2xl font-bold mb-2" 
                  style={{ fontFamily: 'Kodchasan, sans-serif' }}
                >
                  Pro
                </h3>
                <p className="text-white/70">For dedicated learners</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">$19</span>
                <span className="text-white/70">/month</span>
              </div>
              <ul className="mb-8 flex-grow space-y-4">
                <li className="flex items-center">
                  <span className="mr-2 text-[#ff5734]">✓</span>
                  Access to all AI tutors
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-[#ff5734]">✓</span>
                  Unlimited study sessions
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-[#ff5734]">✓</span>
                  Advanced progress tracking
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-[#ff5734]">✓</span>
                  Personal study plan
                </li>
              </ul>
              <Button 
                className="w-full bg-[#ff5734] hover:bg-[#ff5734]/90 text-white" 
                style={{ fontFamily: 'Kodchasan, sans-serif' }}
              >
                Get Started
              </Button>
            </div>
            
            {/* Enterprise Plan */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#f7f7f5] flex flex-col h-full hover:shadow-xl transition-shadow">
              <div className="mb-8">
                <h3 
                  className="text-2xl font-bold mb-2 text-[#151313]" 
                  style={{ fontFamily: 'Kodchasan, sans-serif' }}
                >
                  Enterprise
                </h3>
                <p className="text-[#151313]/70">For teams and organizations</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#151313]">$49</span>
                <span className="text-[#151313]/70">/month</span>
              </div>
              <ul className="mb-8 flex-grow space-y-4">
                <li className="flex items-center">
                  <span className="mr-2 text-[#ff5734]">✓</span>
                  Everything in Pro
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-[#ff5734]">✓</span>
                  Team collaboration tools
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-[#ff5734]">✓</span>
                  Custom learning paths
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-[#ff5734]">✓</span>
                  Priority support
                </li>
              </ul>
              <Button 
                className="w-full bg-white hover:bg-[#f7f7f5] text-[#151313] border border-[#151313]" 
                style={{ fontFamily: 'Kodchasan, sans-serif' }}
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl font-bold mb-4 text-[#151313]" 
              style={{ fontFamily: 'Kodchasan, sans-serif' }}
            >
              Frequently Asked Questions
            </h2>
            <p 
              className="text-xl text-[#151313]/70" 
              style={{ fontFamily: 'Kodchasan, sans-serif' }}
            >
              Everything you need to know about CalenterAI
            </p>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            {faqData.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index + 1}`} 
                className="bg-white rounded-lg shadow-sm border-none"
              >
                <AccordionTrigger 
                  className="px-6 py-4 text-left font-medium text-[#151313]" 
                  style={{ fontFamily: 'Kodchasan, sans-serif' }}
                >
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 pt-0 text-[#151313]/70">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-[#151313] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 
                className="text-xl font-bold mb-4" 
                style={{ fontFamily: 'Kodchasan, sans-serif' }}
              >
                CalenterAI
              </h3>
              <p className="text-white/60">
                Next-generation AI tutoring for lifelong learners. Personalized, adaptive, and effective.
              </p>
            </div>
            
            <div>
              <h4 
                className="text-lg font-medium mb-4" 
                style={{ fontFamily: 'Kodchasan, sans-serif' }}
              >
                Company
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-white/60 hover:text-[#ff5734] transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-white/60 hover:text-[#ff5734] transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-white/60 hover:text-[#ff5734] transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-white/60 hover:text-[#ff5734] transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 
                className="text-lg font-medium mb-4" 
                style={{ fontFamily: 'Kodchasan, sans-serif' }}
              >
                Resources
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/help" className="text-white/60 hover:text-[#ff5734] transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/tutorials" className="text-white/60 hover:text-[#ff5734] transition-colors">
                    Tutorials
                  </Link>
                </li>
                <li>
                  <Link href="/community" className="text-white/60 hover:text-[#ff5734] transition-colors">
                    Community
                  </Link>
                </li>
                <li>
                  <Link href="/webinars" className="text-white/60 hover:text-[#ff5734] transition-colors">
                    Webinars
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 
                className="text-lg font-medium mb-4" 
                style={{ fontFamily: 'Kodchasan, sans-serif' }}
              >
                Legal
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/terms" className="text-white/60 hover:text-[#ff5734] transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-white/60 hover:text-[#ff5734] transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-white/60 hover:text-[#ff5734] transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60 text-sm">
              © {new Date().getFullYear()} CalenterAI. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-white/60 hover:text-[#ff5734] transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link href="#" className="text-white/60 hover:text-[#ff5734] transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="#" className="text-white/60 hover:text-[#ff5734] transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
