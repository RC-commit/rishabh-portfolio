import { motion } from 'motion/react';
import { useRef } from 'react';
import { useInView } from 'motion/react';
import { Sparkles, ChevronDown } from 'lucide-react';

const technicalSkills = [
  {
    category: 'Languages',
    skills: [
      { name: 'Ruby', icon: 'devicon-ruby-plain' },
      { name: 'Python', icon: 'devicon-python-plain' },
      { name: 'JavaScript', icon: 'devicon-javascript-plain' },
      { name: 'Golang', icon: 'devicon-go-original-wordmark' }
    ],
    color: 'purple',
  },
  {
    category: 'Frameworks',
    skills: [
      { name: 'Rails', icon: 'devicon-rails-plain' },
      { name: 'Django', icon: 'devicon-django-plain' },
      { name: 'React', icon: 'devicon-react-original' },
      { name: 'Node.js', icon: 'devicon-nodejs-plain' }
    ],
    color: 'cyan',
  },
  {
    category: 'Cloud',
    skills: [
      { name: 'AWS', icon: 'devicon-amazonwebservices-plain-wordmark' },
      { name: 'Azure', icon: 'devicon-azure-plain' },
      { name: 'Heroku', icon: 'devicon-heroku-plain' }
    ],
    color: 'emerald',
  },
  {
    category: 'DevOps',
    skills: [
      { name: 'Docker', icon: 'devicon-docker-plain' },
      { name: 'Kubernetes', icon: 'devicon-kubernetes-plain' },
      { name: 'CI/CD', icon: 'devicon-githubactions-plain' }
    ],
    color: 'pink',
  },
  {
    category: 'Databases',
    skills: [
      { name: 'PostgreSQL', icon: 'devicon-postgresql-plain' },
      { name: 'MongoDB', icon: 'devicon-mongodb-plain' },
      { name: 'Redis', icon: 'devicon-redis-plain' }
    ],
    color: 'purple',
  },
  {
    category: 'Event Systems',
    skills: [
      { name: 'Kafka', icon: 'devicon-apachekafka-original' },
      { name: 'RabbitMQ', icon: 'devicon-rabbitmq-original' },
      { name: 'Sidekiq', icon: 'devicon-ruby-plain' }
    ],
    color: 'cyan',
  },
  {
    category: 'AI Tools',
    skills: [
      { name: 'Claude', icon: '🤖' },
      { name: 'Cursor', icon: 'devicon-vscode-plain' },
      { name: 'Copilot', icon: 'devicon-github-original' },
      { name: 'ChatGPT', icon: '🧑‍💻' }
    ],
    color: 'emerald',
  },
  {
    category: 'API & Auth',
    skills: [
      { name: 'REST', icon: 'devicon-fastapi-plain' },
      { name: 'GraphQL', icon: 'devicon-graphql-plain' },
      { name: 'OAuth2', icon: '🔐' },
      { name: 'JWT', icon: 'devicon-json-plain' }
    ],
    color: 'pink',
  },
];

const softSkills = [
  { name: 'System Thinking', icon: '🧠', color: 'purple' },
  { name: 'Technical Leadership', icon: '💬', color: 'cyan' },
  { name: 'Cross-Team Collaboration', icon: '👥', color: 'pink' },
  { name: 'Time Management', icon: '⏱️', color: 'emerald' },
  { name: 'Critical Thinking', icon: '🤔', color: 'purple' },
  { name: 'Adaptability', icon: '🔄', color: 'cyan' },
  { name: 'Decision Making', icon: '🎯', color: 'cyan' },
  { name: 'Mentorship', icon: '👥', color: 'cyan' }
];

export function Skills() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="skills" ref={ref} className="h-screen w-full bg-gradient-to-br from-[#0a0a0a] via-[#0f0a14] to-[#0a0a0a] px-8 py-16 flex items-center relative overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      
      {/* Floating orbs */}
      <div className="absolute top-1/4 left-10 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-7xl mx-auto w-full relative z-10 h-full flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3">
            <h2 className="text-4xl text-purple-400">Technical Expertise</h2>
            <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
          </div>
        </motion.div>

        <div className="flex gap-6 flex-1 min-h-0">
          {/* Left Side - Technical Skills (2/3) */}
          <div className="w-2/3 min-h-0">
            <div className="grid grid-cols-4 gap-4 h-full">
              {technicalSkills.map((skillGroup, groupIndex) => {
                const colorMap: Record<string, { 
                  bg: string; 
                  border: string; 
                  borderHover: string;
                  text: string;
                  iconBg: string;
                }> = {
                  purple: {
                    bg: 'from-purple-500/10 via-purple-500/5 to-transparent',
                    border: 'border-purple-500/20',
                    borderHover: 'hover:border-purple-500/40',
                    text: 'text-purple-400',
                    iconBg: 'bg-purple-500/20',
                  },
                  cyan: {
                    bg: 'from-cyan-500/10 via-cyan-500/5 to-transparent',
                    border: 'border-cyan-500/20',
                    borderHover: 'hover:border-cyan-500/40',
                    text: 'text-cyan-400',
                    iconBg: 'bg-cyan-500/20',
                  },
                  pink: {
                    bg: 'from-pink-500/10 via-pink-500/5 to-transparent',
                    border: 'border-pink-500/20',
                    borderHover: 'hover:border-pink-500/40',
                    text: 'text-pink-400',
                    iconBg: 'bg-pink-500/20',
                  },
                  emerald: {
                    bg: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
                    border: 'border-emerald-500/20',
                    borderHover: 'hover:border-emerald-500/40',
                    text: 'text-emerald-400',
                    iconBg: 'bg-emerald-500/20',
                  },
                };

                const colors = colorMap[skillGroup.color] || colorMap.purple;

                // Define grid spans - creative bento layout
                const getGridClass = (index: number) => {
                  if (index === 0 || index === 1) return 'col-span-2 row-span-2';
                  if (index === 2 || index === 3) return 'col-span-1 row-span-2';
                  return 'col-span-2 row-span-1';
                };

                return (
                  <motion.div
                    key={groupIndex}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: groupIndex * 0.08,
                      type: "spring",
                      stiffness: 100,
                    }}
                    className={`${getGridClass(groupIndex)} bg-gradient-to-br ${colors.bg} backdrop-blur-sm border ${colors.border} ${colors.borderHover} rounded-2xl p-4 transition-all duration-300 group relative overflow-hidden`}
                  >
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Floating particle */}
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse"></div>
                    
                    <div className="relative z-10 h-full flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className={`${colors.text} text-xs uppercase tracking-wide flex-1`}>
                          {skillGroup.category}
                        </h3>
                        <motion.div 
                          className="w-1.5 h-1.5 rounded-full bg-current"
                          animate={{ 
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>
                      
                      <div className="flex-1 flex flex-wrap gap-2 content-start">
                        {skillGroup.skills.map((skill, skillIndex) => (
                          <motion.div
                            key={skillIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                            transition={{ 
                              duration: 0.4, 
                              delay: groupIndex * 0.08 + skillIndex * 0.05 
                            }}
                            whileHover={{ 
                              scale: 1.08,
                              transition: { duration: 0.2 }
                            }}
                            className={`flex items-center gap-2 ${colors.iconBg} backdrop-blur-sm px-3 py-2 rounded-lg cursor-pointer`}
                          >
                            {skill.icon.startsWith('devicon-') ? (
                              <motion.i
                                className={`${skill.icon} colored text-xl`}
                                whileHover={{
                                  rotate: [0, -10, 10, 0],
                                  transition: { duration: 0.3 }
                                }}
                              />
                            ) : (
                              <motion.span
                                className="text-xl leading-none"
                                whileHover={{
                                  rotate: [0, -10, 10, 0],
                                  transition: { duration: 0.3 }
                                }}
                              >
                                {skill.icon}
                              </motion.span>
                            )}
                            <span className="text-xs text-white/90">{skill.name}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Side - Soft Skills (1/3) */}
          <div className="w-1/3 min-h-0">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="h-full bg-gradient-to-br from-[#141414] via-[#1a1a1a] to-[#0a0a0a] border border-white/10 rounded-2xl p-6 overflow-hidden relative backdrop-blur-sm"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>
              
              <h3 className="text-white text-sm mb-6 uppercase tracking-wide relative z-10 flex items-center gap-2">
                Soft Skills
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </motion.div>
              </h3>
              
              {/* Scrolling container */}
              <div className="relative h-[calc(100%-50px)] overflow-hidden">
                <div className="absolute inset-0">
                  <motion.div 
                    className="space-y-4"
                    animate={{ y: ['0%', '-50%'] }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    {[...softSkills, ...softSkills].map((skill, index) => {
                      const colorMap: Record<string, { gradient: string; border: string }> = {
                        purple: { 
                          gradient: 'from-purple-500/20 via-purple-500/10 to-transparent',
                          border: 'border-purple-500/20 hover:border-purple-500/40',
                        },
                        cyan: { 
                          gradient: 'from-cyan-500/20 via-cyan-500/10 to-transparent',
                          border: 'border-cyan-500/20 hover:border-cyan-500/40',
                        },
                        pink: { 
                          gradient: 'from-pink-500/20 via-pink-500/10 to-transparent',
                          border: 'border-pink-500/20 hover:border-pink-500/40',
                        },
                        emerald: { 
                          gradient: 'from-emerald-500/20 via-emerald-500/10 to-transparent',
                          border: 'border-emerald-500/20 hover:border-emerald-500/40',
                        },
                      };
                      
                      const colors = colorMap[skill.color];
                      
                      return (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.03, x: 5 }}
                          className={`flex items-center gap-4 bg-gradient-to-r ${colors.gradient} backdrop-blur-sm border ${colors.border} rounded-xl p-4 transition-all duration-300 group cursor-pointer relative overflow-hidden`}
                        >
                          {/* Shine effect */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: '100%' }}
                            transition={{ duration: 0.6 }}
                          />
                          
                          <motion.div 
                            className="text-3xl relative z-10"
                            whileHover={{ rotate: [0, -15, 15, 0], scale: 1.1 }}
                            transition={{ duration: 0.5 }}
                          >
                            {skill.icon}
                          </motion.div>
                          <span className="text-white/90 text-sm relative z-10">{skill.name}</span>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
                
                {/* Gradient masks */}
                <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#141414] via-[#141414]/50 to-transparent pointer-events-none z-10"></div>
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#141414] via-[#141414]/50 to-transparent pointer-events-none z-10"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - Below grid */}
      <motion.a
        href="#projects"
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