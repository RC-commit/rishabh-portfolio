import { motion } from 'motion/react';
import { useInView } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import { Terminal, Lightbulb, Users, Rocket, ChevronDown } from 'lucide-react';

export function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });
  const [animationKey, setAnimationKey] = useState(0);

  const terminalLines = [
    { delay: 0.5, text: '$ whoami', color: 'text-cyan-400' },
    { delay: 1.0, text: '> Staff-Level Full Stack Engineer', color: 'text-white' },

    { delay: 1.6, text: '$ cat profile.txt', color: 'text-cyan-400' },
    { delay: 2.1, text: '> ✓ System Thinker', color: 'text-emerald-400' },
    { delay: 2.4, text: '> ✓ Strong Ownership', color: 'text-emerald-400' },
    { delay: 2.7, text: '> ✓ Product-Minded Engineer', color: 'text-emerald-400' },
    { delay: 3.0, text: '> ✓ Mentors & Unblocks Teams', color: 'text-emerald-400' },

    { delay: 3.6, text: '$ git log --oneline', color: 'text-cyan-400' },
    { delay: 4.1, text: '> 100+ production features shipped', color: 'text-purple-400' },
    { delay: 4.4, text: '> Led multiple critical system modules', color: 'text-purple-400' },
    { delay: 4.7, text: '> Designed for scale & reliability', color: 'text-purple-400' },

    { delay: 5.3, text: '$ █', color: 'text-white animate-pulse' },
  ];

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        setAnimationKey(prev => prev + 1);
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [isInView, animationKey]);

  return (
    <section id="about" ref={ref} className="h-screen w-full bg-gradient-to-br from-[#0a0a0a] via-[#0f0a14] to-[#0a0a0a] px-8 py-16 flex items-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-1/4 right-10 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 left-10 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
      
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-4xl text-purple-400">About Me</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-4xl mb-6 text-white leading-tight">
                Building digital experiences with passion
              </h3>
              <p className="text-white/60 mb-4 text-base leading-relaxed">
                Full Stack Engineer with 7+ years of experience in designing, developing, and optimizing 
                scalable, high-performance applications. Proven track record of end-to-end feature ownership.
              </p>
              <p className="text-white/60 mb-6 text-base leading-relaxed">
                From architecting cloud-native systems to crafting pixel-perfect interfaces, I'm 
                driven by the challenge of turning complex problems into elegant solutions.
              </p>

              <div className="grid grid-cols-4 gap-3">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex flex-col items-center bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-xl p-3 hover:border-purple-500/40 transition-all hover:scale-105"
                >
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-2">
                    <Lightbulb className="w-5 h-5 text-purple-400" />
                  </div>
                  <h4 className="text-white text-xs text-center">Systems Thinker</h4>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-col items-center bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-xl p-3 hover:border-cyan-500/40 transition-all hover:scale-105"
                >
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-2">
                    <Users className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h4 className="text-white text-xs text-center">Team Leadership</h4>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex flex-col items-center bg-gradient-to-br from-pink-500/10 to-transparent border border-pink-500/20 rounded-xl p-3 hover:border-pink-500/40 transition-all hover:scale-105"
                >
                  <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center mb-2">
                    <Terminal className="w-5 h-5 text-pink-400" />
                  </div>
                  <h4 className="text-white text-xs text-center">Reliable Execution</h4>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="flex flex-col items-center bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-xl p-3 hover:border-emerald-500/40 transition-all hover:scale-105"
                >
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-2">
                    <Rocket className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h4 className="text-white text-xs text-center">Design to Scale</h4>
                </motion.div>
              </div>
            </div>

            <motion.div
              key={animationKey}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {/* Laptop mockup */}
              <div className="relative bg-gradient-to-br from-[#1a1a1a] to-[#141414] border border-white/10 rounded-xl overflow-hidden shadow-2xl hover:border-purple-500/30 transition-all duration-500">
                {/* Laptop screen bezel */}
                <div className="border-4 border-[#0a0a0a] rounded-xl">
                  {/* Terminal window */}
                  <div className="bg-[#0a0a0a] p-3">
                    {/* Terminal header */}
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                      </div>
                      <div className="text-xs text-white/40 ml-2">bash — personality.sh</div>
                    </div>
                    
                    {/* Terminal content */}
                    <div className="font-mono text-xs space-y-1.5 h-[240px] overflow-hidden">
                      {terminalLines.map((line, index) => (
                        <motion.div
                          key={`${animationKey}-${index}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                          transition={{ duration: 0.3, delay: line.delay }}
                          className={line.color}
                        >
                          {line.text}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Laptop base */}
                <div className="h-2 bg-gradient-to-r from-[#141414] via-[#1a1a1a] to-[#141414]"></div>
              </div>
              
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-pink-500/10 blur-2xl -z-10 opacity-50"></div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator - Below grid */}
      <motion.a
        href="#journey"
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
