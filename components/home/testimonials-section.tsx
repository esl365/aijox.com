'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  school?: string;
  location: string;
  avatar?: string;
}

interface TestimonialsSectionProps {
  testimonials?: Testimonial[];
  autoplay?: boolean;
  autoplayDelay?: number;
}

const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    quote: 'Global Educator Nexus transformed my job search. Within weeks, I had multiple offers from top international schools in Asia.',
    author: 'Sarah Chen',
    role: 'IB English Teacher',
    school: 'International School of Bangkok',
    location: 'Thailand',
  },
  {
    id: '2',
    quote: 'The AI matching is incredible. It found candidates that perfectly matched our school culture and teaching philosophy.',
    author: 'James Martinez',
    role: 'Head of Recruitment',
    school: 'British School of Beijing',
    location: 'China',
  },
  {
    id: '3',
    quote: 'I love the visa sponsorship filter. It made my international job search so much easier knowing which schools can sponsor.',
    author: 'Emma Thompson',
    role: 'Primary School Teacher',
    school: 'Dubai International Academy',
    location: 'UAE',
  },
  {
    id: '4',
    quote: 'The one-click apply feature saved me hours. I applied to 20 schools in a single afternoon.',
    author: 'Michael Park',
    role: 'STEM Coordinator',
    school: 'Singapore American School',
    location: 'Singapore',
  },
];

export function TestimonialsSection({
  testimonials = defaultTestimonials,
  autoplay = true,
  autoplayDelay = 5000,
}: TestimonialsSectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center' },
    autoplay ? [Autoplay({ delay: autoplayDelay, stopOnInteraction: false })] : []
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            What our community says
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join thousands of educators who found their perfect international teaching position.
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className="flex-[0_0_100%] min-w-0 px-4"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{
                      opacity: selectedIndex === index ? 1 : 0.5,
                      scale: selectedIndex === index ? 1 : 0.95,
                    }}
                    transition={{ duration: 0.3 }}
                    className="relative p-8 md:p-12 rounded-3xl bg-white dark:bg-gray-900 shadow-xl"
                  >
                    {/* Quote Icon */}
                    <Quote className="absolute top-6 left-6 h-12 w-12 text-gray-200 dark:text-gray-800" />

                    {/* Quote Text */}
                    <blockquote className="relative z-10 text-xl md:text-2xl text-gray-700 dark:text-gray-300 font-medium leading-relaxed mb-8">
                      "{testimonial.quote}"
                    </blockquote>

                    {/* Author Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#5865F2] to-[#4ECDC4] flex items-center justify-center text-white font-bold text-lg">
                        {testimonial.author
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {testimonial.author}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {testimonial.role}
                          {testimonial.school && ` at ${testimonial.school}`}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                          {testimonial.location}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 rounded-full shadow-lg"
            onClick={scrollPrev}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 rounded-full shadow-lg"
            onClick={scrollNext}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                selectedIndex === index
                  ? 'bg-gray-900 dark:bg-white w-8'
                  : 'bg-gray-300 dark:bg-gray-700'
              }`}
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
