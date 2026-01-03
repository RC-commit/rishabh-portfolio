import { Github, Linkedin, Mail, Phone, Briefcase, Download, MapPin, TrendingUp, Users, Zap, BarChart3, ChevronDown } from 'lucide-react';
import { motion, useInView } from 'motion/react';
import { ImageWithFallback } from './ui/ImageWithFallback';
import { useState, useEffect, useRef } from 'react';

// Counter animation component with loop
function AnimatedCounter({ end, suffix = '', prefix = '', loop = false }: { end: number; suffix?: string; prefix?: string; loop?: boolean }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false });

  useEffect(() => {
    if (!isInView) return;
    
    const animate = () => {
      let start = 0;
      const duration = 2000;
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
          
          if (loop) {
            setTimeout(() => {
              setCount(0);
              animate();
            }, 3000);
          }
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      
      return () => clearInterval(timer);
    };
    
    animate();
  }, [isInView, end, loop]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// Typewriter component
function TypewriterText({ lines }: { lines: string[] }) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  useEffect(() => {
    if (currentLineIndex >= lines.length) {
      setTimeout(() => {
        setCurrentLineIndex(0);
        setCurrentText('');
        setCurrentCharIndex(0);
      }, 2000);
      return;
    }

    const currentLine = lines[currentLineIndex];
    
    if (currentCharIndex < currentLine.length) {
      const timer = setTimeout(() => {
        setCurrentText(prev => prev + currentLine[currentCharIndex]);
        setCurrentCharIndex(prev => prev + 1);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1);
        setCurrentText('');
        setCurrentCharIndex(0);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentCharIndex, currentLineIndex, lines]);

  return (
    <div className="space-y-1">
      {lines.map((line, index) => (
        <div key={index} className="text-white/70 text-sm h-5">
          {index < currentLineIndex ? line : index === currentLineIndex ? currentText : ''}
        </div>
      ))}
    </div>
  );
}

export function Hero() {
  const [isOrbitalHovered, setIsOrbitalHovered] = useState(false);
  const techStack = [
    // Core
    { name: 'Ruby on Rails', icon: 'devicon-rails-plain', orbit: 1, size: 'xl', angle: 0 },
    { name: 'PostgreSQL', icon: 'devicon-postgresql-plain', orbit: 1, size: 'xl', angle: 90 },
    { name: 'AWS', icon: 'devicon-amazonwebservices-plain-wordmark', orbit: 1, size: 'xl', angle: 180 },
    { name: 'APIs & Systems', icon: 'devicon-nodejs-plain', orbit: 1, size: 'xl', angle: 270 },

    // Secondary
    { name: 'React', icon: 'devicon-react-original', orbit: 2, size: 'lg', angle: 30 },
    { name: 'Python', icon: 'devicon-python-plain', orbit: 2, size: 'lg', angle: 150 },
    { name: 'Redis', icon: 'devicon-redis-plain', orbit: 2, size: 'lg', angle: 270 },

    // Supporting
    { name: 'Docker', icon: 'devicon-docker-plain', orbit: 3, size: 'md', angle: 0 },
    { name: 'Kubernetes', icon: 'devicon-kubernetes-plain', orbit: 3, size: 'md', angle: 120 },
    { name: 'Kafka', icon: 'devicon-apachekafka-original', orbit: 3, size: 'md', angle: 240 },
  ];

  return (
    <section className="relative min-h-screen w-full bg-[#0a0a0a] px-8 pt-4 pb-8 flex items-center overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000,transparent)]"></div>
      
      {/* Enhanced floating orbs with new color theme */}
      <motion.div 
        className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-indigo-500/10 to-orange-500/10 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-emerald-500/5 via-indigo-500/5 to-orange-500/5 rounded-full blur-3xl"
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      <div className="max-w-7xl mx-auto w-full h-full flex items-center relative z-10">
        {/* 3 Column Layout */}
        <div className="grid grid-cols-12 gap-4 w-full" style={{ height: '85vh' }}>
          
          {/* ========== COLUMN 1 (Left) - 3 cols ========== */}
          <div className="col-span-3 flex flex-col gap-4">
            
            {/* Available for opportunities */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-emerald-500/10 to-[#141414] border border-emerald-500/20 rounded-2xl px-4 py-2 flex items-center gap-2 hover:border-emerald-500/40 transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <motion.div 
                className="w-2 h-2 bg-emerald-400 rounded-full"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-xs text-emerald-400 relative z-10">Available for Lead Roles</span>
            </motion.div>

            {/* Name + Title + Tagline */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ scale: 1.01 }}
              className="relative flex-1 bg-gradient-to-br from-emerald-500/10 via-[#141414] to-indigo-500/5 border border-emerald-500/20 rounded-2xl p-6 hover:border-emerald-500/40 transition-all duration-500 group relative overflow-hidden flex flex-col justify-center"
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              />
              
              {/* Particle effects */}
              <motion.div
                className="absolute top-4 right-4 w-2 h-2 bg-emerald-400/50 rounded-full"
                animate={{ 
                  y: [0, -20, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              />
              <motion.div
                className="absolute bottom-4 left-4 w-2 h-2 bg-indigo-400/50 rounded-full"
                animate={{ 
                  y: [0, 20, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
              />
              
              <div className="relative z-10">
                <motion.h1 
                  className="text-5xl text-white mb-2 tracking-tight"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  Rishabh
                </motion.h1>
                <motion.h1 
                  className="text-5xl text-white mb-4 tracking-tight"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  Chaturvedi
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="text-xl text-emerald-400 mb-6"
                >
                  Lead Software Engineer
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <TypewriterText lines={['Engineering scalable systems.', 'Leading reliable delivery.']} />
                </motion.div>
              </div>
            </motion.div>

            {/* Location */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-indigo-500/10 to-[#141414] border border-indigo-500/20 rounded-2xl px-4 py-2 hover:border-indigo-500/40 transition-all duration-500 group relative overflow-hidden flex items-center gap-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span className="text-xs text-white/80 truncate relative z-10">Mumbai, India</span>
            </motion.div>
          </div>

          {/* ========== COLUMN 2 (Middle) - 5 cols ========== */}
          <div className="col-span-5 flex flex-col gap-4">
            
            {/* Experience & Projects */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="bg-gradient-to-br from-emerald-500/10 to-[#141414] border border-emerald-500/20 rounded-2xl p-5 hover:border-emerald-500/40 transition-all duration-500 group relative overflow-hidden flex flex-col items-center justify-center"
              >
                <motion.div 
                  className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="relative z-10 text-center"
                >
                  <Briefcase className="w-10 h-10 text-emerald-400 mb-2 mx-auto" />
                  <div className="text-5xl text-white mb-1">
                    <AnimatedCounter end={7} suffix="+" loop={true} />
                  </div>
                  <div className="text-xs text-white/60">Years Experience</div>
                </motion.div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="bg-gradient-to-br from-indigo-500/10 to-[#141414] border border-indigo-500/20 rounded-2xl p-5 hover:border-indigo-500/40 transition-all duration-500 group relative overflow-hidden flex flex-col items-center justify-center"
              >
                <motion.div 
                  className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                />
                <motion.div
                  whileHover={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="relative z-10 text-center"
                >
                  <TrendingUp className="w-10 h-10 text-indigo-400 mb-2 mx-auto" />
                  <div className="text-5xl text-white mb-1">
                    <AnimatedCounter end={30} suffix="+" loop={true} />
                  </div>
                  <div className="text-xs text-white/60">Projects Delivered</div>
                </motion.div>
              </motion.div>
            </div>

            {/* Key Impact & Metrics */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              whileHover={{ scale: 1.01 }}
              className="flex-1 bg-gradient-to-br from-emerald-500/10 to-[#141414] border border-emerald-500/20 rounded-2xl p-6 hover:border-emerald-500/40 transition-all duration-500 group relative overflow-hidden flex flex-col justify-center"
            >
              {/* Animated background waves */}
              <motion.div 
                className="absolute inset-0"
                animate={{
                  background: [
                    'radial-gradient(circle at 0% 0%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)',
                    'radial-gradient(circle at 100% 100%, rgba(99, 102, 241, 0.05) 0%, transparent 50%)',
                    'radial-gradient(circle at 0% 100%, rgba(249, 115, 22, 0.05) 0%, transparent 50%)',
                    'radial-gradient(circle at 100% 0%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)',
                    'radial-gradient(circle at 0% 0%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)',
                  ]
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              
              <div className="flex items-center justify-center gap-2 mb-5 relative z-10">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg text-emerald-400">Key Impact & Metrics</h3>
              </div>

              <div className="space-y-3 relative z-10">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  whileHover={{ x: 5 }}
                  className="flex items-center justify-between px-4 py-2 bg-emerald-500/10 rounded-lg backdrop-blur-sm border border-emerald-500/10"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-white text-sm">Scaled systems for users</span>
                  </div>
                  <span className="text-emerald-400 text-lg"><AnimatedCounter end={3} suffix="Mn+ MAU" loop={true} /></span>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  whileHover={{ x: 5 }}
                  className="flex items-center justify-between px-4 py-2 bg-indigo-500/10 rounded-lg backdrop-blur-sm border border-indigo-500/10"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-indigo-400" />
                    </div>
                    <span className="text-white text-sm">Cloud Cost Optimization</span>
                  </div>
                  <span className="text-indigo-400 text-lg"><AnimatedCounter prefix="↓ " end={61} suffix="% infra spend" loop={true} /></span>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  whileHover={{ x: 5 }}
                  className="flex items-center justify-between px-4 py-2 bg-orange-500/10 rounded-lg backdrop-blur-sm border border-orange-500/10"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-orange-400" />
                    </div>
                    <span className="text-white text-sm">Performance boost</span>
                  </div>
                  <span className="text-orange-400 text-lg"><AnimatedCounter end={6} suffix="× API throughput" loop={true} /></span>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                  whileHover={{ x: 5 }}
                  className="flex items-center justify-between px-4 py-2 bg-emerald-500/10 rounded-lg backdrop-blur-sm border border-emerald-500/10"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-white text-sm">Engineers mentored</span>
                  </div>
                  <span className="text-emerald-400 text-lg"><AnimatedCounter end={20} suffix="+" loop={true} /></span>
                </motion.div>
              </div>
            </motion.div>

            {/* Social Icons - 2x2 Grid */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                whileHover={{ scale: 1.05, y: -3 }}
                className="bg-gradient-to-br from-emerald-500/10 to-[#141414] border border-emerald-500/20 rounded-2xl hover:border-emerald-500/40 transition-all duration-500 group relative overflow-hidden"
              >
                <a href="https://github.com/RC-commit" target="_blank" rel="noopener noreferrer" className="w-full h-full flex items-center justify-center gap-3 p-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                    <Github className="w-6 h-6 text-white/60 group-hover:text-emerald-400 transition-colors relative z-10" />
                  </motion.div>
                  <span className="text-sm text-white/60 group-hover:text-emerald-400 transition-colors relative z-10">GitHub</span>
                </a>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.75 }}
                whileHover={{ scale: 1.05, y: -3 }}
                className="bg-gradient-to-br from-indigo-500/10 to-[#141414] border border-indigo-500/20 rounded-2xl hover:border-indigo-500/40 transition-all duration-500 group relative overflow-hidden"
              >
                <a href="https://linkedin.com/in/rishabhjchaturvedi" target="_blank" rel="noopener noreferrer" className="w-full h-full flex items-center justify-center gap-3 p-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                    <Linkedin className="w-6 h-6 text-white/60 group-hover:text-indigo-400 transition-colors relative z-10" />
                  </motion.div>
                  <span className="text-sm text-white/60 group-hover:text-indigo-400 transition-colors relative z-10">LinkedIn</span>
                </a>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                whileHover={{ scale: 1.05, y: -3 }}
                className="bg-gradient-to-br from-orange-500/10 to-[#141414] border border-orange-500/20 rounded-2xl hover:border-orange-500/40 transition-all duration-500 group relative overflow-hidden"
              >
                <a href="mailto:rishabh.j.chaturvedi@gmail.com" className="w-full h-full flex items-center justify-center gap-3 p-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                    <Mail className="w-6 h-6 text-white/60 group-hover:text-orange-400 transition-colors relative z-10" />
                  </motion.div>
                  <span className="text-sm text-white/60 group-hover:text-orange-400 transition-colors relative z-10">Email</span>
                </a>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.85 }}
                whileHover={{ scale: 1.05, y: -3 }}
                className="bg-gradient-to-br from-emerald-500/10 to-[#141414] border border-emerald-500/20 rounded-2xl hover:border-emerald-500/40 transition-all duration-500 group relative overflow-hidden"
              >
                <a href="tel:+917045579215" className="w-full h-full flex items-center justify-center gap-3 p-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                    <Phone className="w-6 h-6 text-white/60 group-hover:text-emerald-400 transition-colors relative z-10" />
                  </motion.div>
                  <span className="text-sm text-white/60 group-hover:text-emerald-400 transition-colors relative z-10">Phone</span>
                </a>
              </motion.div>
            </div>
          </div>

          {/* ========== COLUMN 3 (Right) - 4 cols ========== */}
          <div className="col-span-4 flex flex-col gap-4">
            
            {/* Profile Picture */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              className="h-48 bg-gradient-to-br from-emerald-500/10 via-[#141414] to-indigo-500/10 border border-emerald-500/20 rounded-2xl overflow-hidden relative group hover:border-emerald-500/40 transition-all duration-500 flex items-center justify-center"
            >
              <motion.div
                className="absolute inset-0 border-2 border-emerald-500/10 rounded-full"
                animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                style={{ width: '90%', height: '90%', margin: 'auto' }}
              />
              <motion.div
                className="absolute inset-0 border-2 border-indigo-500/10 rounded-full"
                animate={{ rotate: -360, scale: [1, 1.1, 1] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                style={{ width: '95%', height: '95%', margin: 'auto' }}
              />
              
              <motion.div 
                className="relative z-10"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-orange-500 p-[3px] -m-[3px]"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <div className="w-full h-full rounded-full bg-[#141414]"></div>
                </motion.div>
                
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[#141414]">
                  <ImageWithFallback 
                    src="/profile.png"
                    alt="Rishabh Chaturvedi"
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            </motion.div>

            {/* Tech Stack - Fixed & Enlarged Orbital System */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              whileHover={{ scale: 1.01 }}
              className="flex-1 bg-gradient-to-br from-indigo-500/10 to-[#141414] border border-indigo-500/20 rounded-2xl p-6 hover:border-indigo-500/40 transition-all duration-500 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="text-white/80 text-xs mb-4 uppercase tracking-wider relative z-10 text-center">Core Technologies</div>
              
              {/* Fixed & Enlarged orbital system */}
              <div 
                className="relative flex items-center justify-center h-[calc(100%-2rem)]"
                onMouseEnter={() => setIsOrbitalHovered(true)}
                onMouseLeave={() => setIsOrbitalHovered(false)}
              >
                {/* Center core */}
                <div className="absolute w-20 h-20 bg-gradient-to-br from-indigo-400/20 via-emerald-500/20 to-orange-400/20 rounded-full flex items-center justify-center backdrop-blur-sm z-20 border-2 border-emerald-500/30">
                  <motion.span 
                    className="text-2xl"
                    animate={isOrbitalHovered ? {} : { rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  >
                    ⚡
                  </motion.span>
                </div>
                
                {/* Larger Orbital rings */}
                <div className="absolute border border-dashed border-emerald-500/30 rounded-full" style={{ width: '140px', height: '140px' }} />
                <div className="absolute border border-dashed border-indigo-500/25 rounded-full" style={{ width: '210px', height: '210px' }} />
                <div className="absolute border border-dashed border-orange-500/20 rounded-full" style={{ width: '280px', height: '280px' }} />

                {/* Orbiting tech icons - PROPERLY ROTATING IN ORBIT */}
                {techStack.map((tech, index) => {
                  const orbitRadius = tech.orbit === 1 ? 70 : tech.orbit === 2 ? 105 : 140;
                  const duration = tech.orbit === 1 ? 18 : tech.orbit === 2 ? 24 : 30;
                  const iconSize = tech.size === 'xl' ? 'text-3xl' : tech.size === 'lg' ? 'text-2xl' : 'text-xl';
                  
                  return (
                    <motion.div
                      key={`tech-${index}`}
                      className="absolute z-30 will-change-transform"
                      style={{
                        left: '50%',
                        top: '50%',
                        x: '-50%',
                        y: '-50%',
                      }}
                      animate={isOrbitalHovered ? {} : {
                        rotate: [tech.angle, tech.angle + 360],
                      }}
                      transition={{
                        duration: duration,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <motion.div
                        className="flex flex-col items-center gap-1 cursor-pointer"
                        style={{
                          x: orbitRadius,
                        }}
                        animate={isOrbitalHovered ? {} : {
                          rotate: [-tech.angle, -tech.angle - 360],
                        }}
                        transition={{ duration, repeat: Infinity, ease: "linear" }}
                        whileHover={{ scale: 1.3 }}
                      >
                        <i className={`${tech.icon} colored ${iconSize} drop-shadow-lg`}></i>
                        <div className="text-[8px] text-white/70 whitespace-nowrap text-center max-w-[60px] leading-tight">{tech.name}</div>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Contact & Resume */}
            <div className="grid grid-cols-2 gap-4">
              <a
                href="https://drive.google.com/file/d/17S3KrTKnlXqrYLb9XXHHy_pBA58DFPHw/view"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  whileHover={{ scale: 1.05, y: -3 }}
                  className="bg-gradient-to-br from-orange-500/10 to-[#141414] border border-orange-500/20 rounded-2xl p-4 hover:border-orange-500/40 transition-all duration-500 cursor-pointer group relative overflow-hidden flex flex-col items-center justify-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <motion.div 
                    className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-2 relative z-10"
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Download className="w-6 h-6 text-orange-400" />
                  </motion.div>

                  <div className="text-white text-xs relative z-10">
                    Resume
                  </div>
                </motion.div>
              </a>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.95 }}
                whileHover={{ scale: 1.05, y: -3 }}
                className="bg-gradient-to-br from-emerald-500/10 to-[#141414] border border-emerald-500/20 rounded-2xl p-4 hover:border-emerald-500/40 transition-all duration-500 cursor-pointer group relative overflow-hidden flex flex-col items-center justify-center"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <a href="#contact" className="flex flex-col items-center relative z-10">
                  <motion.div 
                    className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-2"
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Mail className="w-6 h-6 text-emerald-400" />
                  </motion.div>
                  <div className="text-white text-xs">Contact</div>
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - Below grid */}
      <motion.a
        href="#about"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        whileHover={{ scale: 1.1 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-6 h-6 text-emerald-400/80" />
        </motion.div>
      </motion.a>
    </section>
  );
}