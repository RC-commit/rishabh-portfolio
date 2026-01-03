import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { Rocket, Code, Award, Zap, ChevronDown } from 'lucide-react';

const journeyData = [
  {
    title: 'Senior Software Engineer',
    company: 'Blackstraw Technologies Pvt Ltd',
    period: 'July 2022 - Present',
    location: 'Mumbai, India',
    icon: Rocket,
    color: 'purple',
    achievements: [
      'Led zero-downtime infrastructure migration from Heroku to Azure, reducing cloud costs by 61% while improving system reliability',
      'Architected and optimized ElasticSearch-based search systems, achieving 6× faster query performance (900ms → 150ms)',
      'Owned and scaled the Survey Sampling & Demographics engine, serving 100K+ monthly active users',
      'Designed CI/CD pipelines and release automation, cutting deployment cycles by 70% and reducing production issues',
      'Recognized as a top performer for driving scalability, performance, and engineering best practices',
    ],
  },
  {
    title: 'Software Developer',
    company: 'PropertyPistol Realty Pvt Ltd',
    period: 'Feb 2021 - July 2022',
    location: 'Navi Mumbai, India',
    icon: Code,
    color: 'cyan',
    achievements: [
      'Built and maintained Ruby on Rails APIs powering HRMS, ERP, and CRM platforms used across internal teams',
      'Developed the Glitz CRM platform from scratch, increasing sales engagement and operational efficiency by over 50%',
      'Improved application performance by 40% through query optimization, caching strategies, and API refactoring',
      'Collaborated closely with product, design, and sales teams to ship user-centric features at scale',
    ],
  },
  {
    title: 'Full Stack Developer → Founding Member',
    company: 'PurpleMonks Technology Pvt Ltd',
    period: 'Sep 2018 - Feb 2021',
    location: 'Mumbai, India',
    icon: Award,
    color: 'pink',
    achievements: [
      'Joined as a junior developer and grew into a founding engineer, contributing across product, tech, and strategy',
      'Led end-to-end development of multiple platforms including KaryaMitr, KaushalMitr, and ChayanMitr',
      'Launched an innovative Video Resume feature, onboarding 2,000+ profiles within the first 3 months',
      'Redesigned onboarding flows, reducing incomplete registrations by 70% and improving user activation',
      'Worked across frontend, backend, and deployments, laying the technical foundation for early-stage growth',
    ],
  },
];

export function Journey() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="journey" ref={containerRef} className="min-h-screen w-full bg-gradient-to-br from-[#0a0a0a] via-[#0f0a14] to-[#0a0a0a] px-4 sm:px-6 lg:px-8 py-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-4xl text-purple-400 mb-4">My Journey</h2>
          <p className="text-white/60 text-xl whitespace-nowrap">
            Building scalable systems, owning critical platforms, and growing from early-stage startups to large-scale products
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline container */}
          <div className="flex gap-8">
            {/* Left side - Vertical animated line (1/3rd) */}
            <div className="w-1/3 flex justify-center relative py-8">
              <div className="relative flex flex-col items-center">
                {/* Background line */}
                <div className="absolute top-0 w-1 bg-white/10 rounded-full" style={{ height: `${journeyData.length * 400}px` }}></div>
                
                {/* Animated progress line */}
                <motion.div 
                  className="absolute top-0 w-1 bg-gradient-to-b from-purple-500 via-cyan-500 to-pink-500 rounded-full"
                  style={{ 
                    height: lineHeight,
                    boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)'
                  }}
                />
                
                {/* Icon points */}
                {journeyData.map((item, index) => {
                  const colorMap: Record<string, { bg: string; text: string; glow: string }> = {
                    purple: { bg: 'bg-purple-500', text: 'text-purple-400', glow: 'rgba(139, 92, 246, 0.5)' },
                    cyan: { bg: 'bg-cyan-500', text: 'text-cyan-400', glow: 'rgba(6, 182, 212, 0.5)' },
                    pink: { bg: 'bg-pink-500', text: 'text-pink-400', glow: 'rgba(236, 72, 153, 0.5)' },
                  };
                  
                  const colors = colorMap[item.color];
                  const Icon = item.icon;
                  const iconProgress = useTransform(
                    scrollYProgress,
                    [index / journeyData.length, (index + 0.5) / journeyData.length],
                    [0, 1]
                  );

                  return (
                    <motion.div
                      key={index}
                      className="relative flex items-center justify-center z-10"
                      style={{ 
                        marginTop: index === 0 ? '0' : '350px',
                      }}
                    >
                      <motion.div
                        className={`w-16 h-16 ${colors.bg} rounded-full flex items-center justify-center border-4 border-[#0a0a0a]`}
                        style={{
                          opacity: iconProgress,
                          scale: iconProgress,
                          boxShadow: `0 0 30px ${colors.glow}`,
                        }}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </motion.div>
                    </motion.div>
                  );
                })}

                {/* Animated glowing dot at the end */}
                <motion.div
                  className="absolute w-4 h-4 bg-white rounded-full"
                  style={{
                    top: lineHeight,
                    boxShadow: '0 0 20px rgba(255, 255, 255, 0.8)',
                  }}
                />
              </div>
            </div>

            {/* Right side - Cards (2/3rd) */}
            <div className="w-2/3 space-y-12">
              {journeyData.map((item, index) => {
                const colorMap: Record<string, { border: string; bg: string; text: string }> = {
                  purple: { 
                    border: 'border-purple-500/30 hover:border-purple-500/50', 
                    bg: 'from-purple-500/10 to-transparent',
                    text: 'text-purple-400',
                  },
                  cyan: { 
                    border: 'border-cyan-500/30 hover:border-cyan-500/50', 
                    bg: 'from-cyan-500/10 to-transparent',
                    text: 'text-cyan-400',
                  },
                  pink: { 
                    border: 'border-pink-500/30 hover:border-pink-500/50', 
                    bg: 'from-pink-500/10 to-transparent',
                    text: 'text-pink-400',
                  },
                };

                const colors = colorMap[item.color];
                const cardProgress = useTransform(
                  scrollYProgress,
                  [(index - 0.2) / journeyData.length, (index + 0.3) / journeyData.length],
                  [0, 1]
                );

                return (
                  <motion.div
                    key={index}
                    className={`bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-3xl p-8 transition-all duration-500 relative overflow-hidden group`}
                    style={{
                      opacity: cardProgress,
                      x: useTransform(cardProgress, [0, 1], [50, 0]),
                    }}
                  >
                    {/* Hover gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-3xl text-white mb-2">{item.title}</h3>
                          <p className={`text-xl ${colors.text} mb-1`}>{item.company}</p>
                          <p className="text-white/40">{item.location}</p>
                        </div>
                        <div className={`px-4 py-2 bg-white/5 border ${colors.border} rounded-full`}>
                          <span className="text-sm text-white/60">{item.period}</span>
                        </div>
                      </div>

                      <div className="space-y-3 mt-6">
                        {item.achievements.map((achievement, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.1 }}
                            className="flex items-start gap-3"
                          >
                            <Zap className={`w-5 h-5 ${colors.text} mt-0.5 flex-shrink-0`} />
                            <span className="text-white/70 leading-relaxed">{achievement}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - Below grid */}
      <motion.a
        href="#skills"
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