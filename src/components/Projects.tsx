import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import { useInView } from 'motion/react';
import { Sparkles, ArrowRight, Code2, ChevronDown } from 'lucide-react';

const ImageWithFallback = ({ src, alt, className }: { src: string; alt: string; className: string }) => {
  const [error, setError] = useState(false);
  
  if (error) {
    return (
      <div className={`${className} bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 flex items-center justify-center`}>
        <Code2 className="w-12 h-12 text-white/40" />
      </div>
    );
  }
  
  return <img src={src} alt={alt} className={className} onError={() => setError(true)} />;
};

const projects = [
  {
    title: 'PepsiCo Survey Platform',
    description: 'Developed comprehensive survey management system for PepsiCo with advanced analytics and reporting capabilities',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxkYXRhJTIwcGlwZWxpbmV8ZW58MXx8fHwxNzU5OTQxMzkzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['Django', 'Rails', 'Analytics', 'Enterprise', 'PostgreSQL'],
    color: 'indigo',
    metrics: { scale: 'Enterprise', insights: '50K+', uptime: '99.9%' }
  },
  {
    title: 'Consumption Survey Platform',
    description: 'Built end-to-end consumption tracking module with real-time data processing, visualization dashboards and reporting capabilities',
    image: 'https://images.unsplash.com/photo-1666875753105-c63a6f3bdc86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmFseXRpY3MlMjBkYXNoYm9hcmR8ZW58MXx8fHwxNzU5OTQxMzkzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['Django', 'Rails', 'Real-time', 'Dashboards', 'PostgreSQL'],
    color: 'emerald',
    metrics: { users: '100K+', data: '1M+', speed: '3x' }
  },
  {
    title: 'Survey Sampling Platform',
    description: 'End-to-end development of Survey Sampling module impacting 100k+ users with Rails on Azure',
    image: 'https://images.unsplash.com/photo-1665470909939-959569b20021?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBhcHBsaWNhdGlvbiUyMGRhc2hib2FyZHxlbnwxfHx8fDE3NTk4NjYwODZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['Django', 'Rails', 'Azure', 'PostgreSQL'],
    color: 'orange',
    metrics: { users: '100K+', impact: '50%', performance: '3x' }
  },
  {
    title: 'Cloud Migration',
    description: 'Reduced cloud expenses by 61% migrating applications from Heroku to Azure with infrastructure optimization',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw4fHxjbG91ZCUyMGluZnJhc3RydWN0dXJlfGVufDF8fHx8MTc1OTk0MTM5M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['Azure', 'Heroku', 'DevOps', 'Cost Optimization'],
    color: 'indigo',
    metrics: { savings: '61%', migration: '100%', downtime: '0hr' }
  },
  {
    title: 'Glitz CRM',
    description: 'Developed CRM from scratch contributing to 50% increase in user engagement with Rails APIs',
    image: 'https://images.unsplash.com/photo-1643906226799-59eab234e41d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY29tbWVyY2UlMjBtb2JpbGUlMjBhcHB8ZW58MXx8fHwxNzU5OTEwMTQ1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['Ruby on Rails', 'React', 'CRM', 'APIs'],
    color: 'emerald',
    metrics: { engagement: '50%', users: '5K+', features: '20+' }
  },
  {
    title: 'IGR Insights',
    description: 'Built analytics platform from scratch for real estate insights with Rails microservices architecture',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmFseXRpY3N8ZW58MXx8fHwxNzU5OTQxMzkzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['Rails', 'Analytics', 'Microservices', 'Real Estate'],
    color: 'orange',
    metrics: { insights: '1M+', queries: '5K/day', accuracy: '95%' }
  },
  {
    title: 'ChayanMitr Platform',
    description: 'Developed recruitment and talent management platform with advanced matching algorithms and workflow automation',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw2fHx0ZWFtJTIwd29ya3xlbnwxfHx8fDE3NTk5NDEzOTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['Ruby on Rails', 'Recruitment', 'AWS'],
    color: 'indigo',
    metrics: { matches: '5K+', accuracy: '90%', time: '40%' }
  },
  {
    title: 'KaryaMitr Platform',
    description: 'Built recruitment platform with Video Resume feature generating 2000+ profiles within 3 months',
    image: 'https://images.unsplash.com/photo-1669062897193-f8a4215c2033?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3ZWJzaXRlJTIwZGVzaWdufGVufDF8fHx8MTc1OTg5NTYzOXww&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['Ruby on Rails', 'Video Resume', 'AWS'],
    color: 'emerald',
    metrics: { profiles: '2000+', time: '3mo', growth: '120%' }
  },
];

// 3D Tilt Card Component
function TiltCard({ children }: { children: React.ReactNode}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="relative will-change-transform"
    >
      <div style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </motion.div>
  );
}

export function Projects() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const projectsPerPage = 4;
  const totalPages = Math.ceil(projects.length / projectsPerPage);

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 10000); // Change this number - 10000 = 10 seconds
    return () => clearInterval(interval);
  }, [totalPages]);

  const goToNextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const currentProjects = projects.slice(
    currentPage * projectsPerPage,
    (currentPage + 1) * projectsPerPage
  );

  const colorMap: Record<string, { 
    text: string; 
    border: string; 
    bg: string; 
    gradient: string;
    glow: string;
  }> = {
    emerald: { 
      text: 'text-emerald-400', 
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10',
      gradient: 'from-emerald-500/20 via-emerald-500/10 to-transparent',
      glow: 'shadow-emerald-500/50'
    },
    indigo: { 
      text: 'text-indigo-400', 
      border: 'border-indigo-500/30',
      bg: 'bg-indigo-500/10',
      gradient: 'from-indigo-500/20 via-indigo-500/10 to-transparent',
      glow: 'shadow-indigo-500/50'
    },
    orange: { 
      text: 'text-orange-400', 
      border: 'border-orange-500/30',
      bg: 'bg-orange-500/10',
      gradient: 'from-orange-500/20 via-orange-500/10 to-transparent',
      glow: 'shadow-orange-500/50'
    },
  };

  return (
    <section id="projects" ref={ref} className="min-h-screen w-full bg-gradient-to-br from-[#0a0a0a] via-[#0f0a14] to-[#0a0a0a] px-8 py-16 flex items-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      
      {/* Animated orbs */}
      <motion.div 
        className="absolute top-1/4 left-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-10 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
      />

      {/* Floating code particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-emerald-500/10 font-mono text-2xl pointer-events-none"
          initial={{ opacity: 0, x: i * 200, y: i * 100 }}
          animate={{
            opacity: [0, 0.5, 0],
            x: [i * 200, (i + 1) * 300],
            y: [i * 100, (i + 1) * 150],
          }}
          transition={{
            duration: 15 + i * 2,
            repeat: Infinity,
            delay: i * 2,
          }}
        >
          {['</', '/>', '{}', '[]', '()', '::'][i]}
        </motion.div>
      ))}

      <div className="max-w-7xl mx-auto w-full relative z-10 h-full flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-4xl text-emerald-400">Featured Projects</h2>
              <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
            </div>
            
            {/* Page indicators */}
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === currentPage 
                      ? 'bg-emerald-400 w-8' 
                      : 'bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Project Cards Grid with Navigation */}
        <div className="relative">
          {/* Left Arrow */}
          <motion.button
            onClick={goToPrevPage}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 z-20 bg-emerald-500/10 hover:bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-full p-3 transition-all duration-300"
            whileHover={{ scale: 1.1, x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowRight className="w-6 h-6 text-emerald-400 rotate-180" />
          </motion.button>

          {/* Right Arrow */}
          <motion.button
            onClick={goToNextPage}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 z-20 bg-emerald-500/10 hover:bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-full p-3 transition-all duration-300"
            whileHover={{ scale: 1.1, x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowRight className="w-6 h-6 text-emerald-400" />
          </motion.button>

          <motion.div 
            key={currentPage}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 gap-6 max-w-6xl mx-auto"
          >
            {currentProjects.map((project, index) => {
              const colors = colorMap[project.color] || colorMap.emerald;
              const isHovered = hoveredIndex === index;
              
              return (
                <TiltCard>
                  <motion.div
                    initial={{ opacity: 0, y: 50, rotateX: -15 }}
                    animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 50, rotateX: -15 }}
                    transition={{ duration: 0.8, delay: index * 0.2 }}
                    onHoverStart={() => setHoveredIndex(index)}
                    onHoverEnd={() => setHoveredIndex(null)}
                    className={`relative bg-gradient-to-br from-[#141414] to-[#0a0a0a] border ${colors.border} rounded-2xl overflow-hidden group cursor-pointer h-full`}
                  >
                    {/* Animated gradient background on hover */}
                    <motion.div 
                      className={`absolute inset-0 bg-gradient-to-br ${colors.gradient}`}
                      animate={{ opacity: isHovered ? 0.5 : 0 }}
                      transition={{ duration: 0.3 }}
                    />
                    
                    {/* Glow effect on hover */}
                    <motion.div
                      className={`absolute -inset-1 rounded-2xl ${colors.glow} blur-xl`}
                      animate={{ opacity: isHovered ? 0.3 : 0 }}
                      transition={{ duration: 0.3 }}
                    />

                    {/* Scan line effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent"
                      animate={isHovered ? {
                        y: ["-100%", "100%"],
                      } : {}}
                      transition={{
                        duration: 1.5,
                        repeat: isHovered ? Infinity : 0,
                        ease: "linear"
                      }}
                    />

                    {/* Content */}
                    <div className="relative z-10 p-4 h-full flex flex-col">
                      {/* Image Section with Parallax */}
                      <div className="relative h-32 -mx-4 -mt-4 mb-4 overflow-hidden">
                        <motion.div
                          className="w-full h-full"
                          animate={isHovered ? { scale: 1.15 } : { scale: 1 }}
                          transition={{ duration: 0.6 }}
                        >
                          <ImageWithFallback 
                            src={project.image}
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                        
                        {/* Gradient overlay with glitch effect */}
                        <div className={`absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/50 to-transparent`}></div>
                        
                        {/* Glitch layers on hover */}
                        {isHovered && (
                          <>
                            <motion.div
                              className="absolute inset-0 mix-blend-screen opacity-70"
                              animate={{
                                x: [0, -2, 2, -2, 0],
                                opacity: [0.7, 0.3, 0.7],
                              }}
                              transition={{ duration: 0.2, repeat: Infinity }}
                              style={{ background: `linear-gradient(90deg, transparent 0%, ${colors.gradient.split(' ')[0].replace('from-', '')} 50%, transparent 100%)` }}
                            />
                          </>
                        )}
                        
                        {/* Index badge with glowing effect */}
                        <motion.div 
                          className={`absolute top-4 right-4 w-12 h-12 ${colors.bg} backdrop-blur-sm border-2 ${colors.border} rounded-full flex items-center justify-center overflow-hidden`}
                          animate={isHovered ? { 
                            scale: [1, 1.1, 1],
                            rotate: [0, 360]
                          } : {}}
                          transition={{ duration: 0.8 }}
                        >
                          <motion.div
                            className={`absolute inset-0 bg-gradient-to-br ${colors.gradient}`}
                            animate={isHovered ? {
                              rotate: 360,
                            } : {}}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          />
                          <span className={`${colors.text} relative z-10`}>0{currentPage * projectsPerPage + index + 1}</span>
                        </motion.div>

                        {/* Floating code icon */}
                        <motion.div
                          className={`absolute top-4 left-4 ${colors.bg} backdrop-blur-sm border ${colors.border} rounded-lg p-2`}
                          animate={isHovered ? {
                            y: [0, -5, 0],
                          } : {}}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <Code2 className={`w-4 h-4 ${colors.text}`} />
                        </motion.div>
                      </div>

                      {/* Title & Description with staggered reveal */}
                      <div className="flex-1">
                        <motion.h3 
                          className="text-xl text-white mb-2 relative inline-block"
                          animate={isHovered ? {
                            x: [0, 2, 0],
                          } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          {project.title}
                          <motion.div
                            className={`absolute bottom-0 left-0 h-0.5 ${colors.bg}`}
                            animate={{ width: isHovered ? '100%' : '0%' }}
                            transition={{ duration: 0.3 }}
                          />
                        </motion.h3>
                        
                        <motion.p 
                          className="text-white/60 text-xs mb-3 line-clamp-2"
                          animate={isHovered ? { color: 'rgba(255, 255, 255, 0.8)' } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          {project.description}
                        </motion.p>

                        {/* Metrics and Tags in single line */}
                        <div className="flex items-center justify-between gap-3 mb-3">
                          {/* Metrics on the left */}
                          <div className="flex gap-2">
                            {Object.entries(project.metrics).map(([key, value], i) => (
                              <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                                transition={{ delay: index * 0.2 + 0.3 + i * 0.1 }}
                                whileHover={{ scale: 1.1, y: -3 }}
                                className={`${colors.bg} backdrop-blur-sm border ${colors.border} rounded-lg px-2 py-1.5 relative overflow-hidden`}
                              >
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                  animate={isHovered ? {
                                    x: ["-100%", "100%"],
                                  } : {}}
                                  transition={{
                                    duration: 1,
                                    repeat: isHovered ? Infinity : 0,
                                    delay: i * 0.2,
                                  }}
                                />
                                <div className="text-[9px] text-white/60 uppercase tracking-wide mb-0.5 relative z-10">{key}</div>
                                <div className={`text-xs ${colors.text} relative z-10`}>{value}</div>
                              </motion.div>
                            ))}
                          </div>

                          {/* Tags on the right */}
                          <div className="flex flex-wrap gap-1.5 justify-end">
                          {/* Tags on the right */}
                          <div className="flex flex-wrap gap-1.5 justify-end">
                            {project.tags.map((tag, i) => (
                              <motion.span
                                key={i}
                                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 10 }}
                                transition={{ delay: index * 0.2 + 0.4 + i * 0.05 }}
                                whileHover={{ 
                                  scale: 1.15, 
                                  y: -5,
                                  rotate: [0, -5, 5, 0]
                                }}
                                className={`px-2 py-0.5 bg-white/5 backdrop-blur-sm border ${colors.border} rounded-full text-[10px] ${colors.text} cursor-pointer`}
                              >
                                {tag}
                              </motion.span>
                            ))}
                          </div>
                        </div>
                        </div>
                      </div>
                    </div>

                    {/* Corner accent */}
                    <motion.div
                      className={`absolute bottom-0 right-0 w-20 h-20 ${colors.bg} opacity-30 blur-2xl`}
                      animate={isHovered ? {
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.6, 0.3],
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                </TiltCard>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator - Below grid */}
      <motion.a
        href="#contact"
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