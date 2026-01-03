import { motion } from 'motion/react';
import { useInView } from 'motion/react';
import { useRef, useState } from 'react';
import { Mail, MapPin, Linkedin, Github, Send, Phone } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';

export function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          from_name: formData.name,
          from_email: formData.email,
          message: formData.message,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      toast.success("Message sent! I'll get back to you soon.");
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" ref={ref} className="min-h-screen w-full bg-[#0a0a0a] px-4 sm:px-6 lg:px-8 py-20 flex items-center">
      <div className="max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-sm uppercase tracking-wider text-purple-400 mb-4">Get In Touch</h2>
          <h3 className="text-4xl sm:text-5xl mb-4 text-white">Let's Work Together</h3>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            From idea to production, I help teams build scalable, reliable systems. Let’s talk.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <h4 className="text-white mb-6">Contact Information</h4>
              
              <div className="space-y-4">
                <motion.a
                  href="mailto:rishabh.j.chaturvedi@gmail.com"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex items-center gap-4 p-4 bg-[#141414] border border-white/5 rounded-xl hover:border-purple-500/20 transition-colors group"
                >
                  <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mail className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-xs text-white/40">Email</div>
                    <div className="text-white/80">rishabh.j.chaturvedi@gmail.com</div>
                  </div>
                </motion.a>

                <motion.a
                  href="tel:+917045579215"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                  className="flex items-center gap-4 p-4 bg-[#141414] border border-white/5 rounded-xl 
                            hover:border-emerald-500/20 transition-colors group"
                >
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center 
                                  group-hover:scale-110 transition-transform">
                    <Phone className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xs text-white/40">Phone</div>
                    <div className="text-white/80">+91 70455 79215</div>
                  </div>
                </motion.a>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="flex items-center gap-4 p-4 bg-[#141414] border border-white/5 rounded-xl"
                >
                  <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-xs text-white/40">Location</div>
                    <div className="text-white/80">Mumbai, IN</div>
                  </div>
                </motion.div>
              </div>
            </div>

            <div>
              <h4 className="text-white mb-4">Connect With Me</h4>
              <div className="flex gap-3">
                <motion.a
                  href="https://github.com/RC-commit"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 bg-[#141414] border border-white/5 rounded-xl flex items-center justify-center hover:border-purple-500/20 transition-colors"
                >
                  <Github className="w-5 h-5 text-white/60" />
                </motion.a>
                <motion.a
                  href="https://linkedin.com/in/rishabhjchaturvedi"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 bg-[#141414] border border-white/5 rounded-xl flex items-center justify-center hover:border-cyan-500/20 transition-colors"
                >
                  <Linkedin className="w-5 h-5 text-white/60" />
                </motion.a>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="bg-[#141414] border border-white/5 rounded-2xl p-8 space-y-6">
              <div>
                <label htmlFor="name" className="block mb-2 text-white/80 text-sm">Name</label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-purple-500/50"
                />
              </div>

              <div>
                <label htmlFor="email" className="block mb-2 text-white/80 text-sm">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-purple-500/50"
                />
              </div>

              <div>
                <label htmlFor="message" className="block mb-2 text-white/80 text-sm">Message</label>
                <Textarea
                  id="message"
                  placeholder="Tell me about your experience..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  className="min-h-[150px] resize-none bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-purple-500/50"
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="group w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 
                          hover:from-purple-600 hover:to-pink-600 text-white border-0
                          disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center gap-2 transition-transform duration-200 group-hover:translate-x-1">
                  <Send className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
                  <span>{loading ? 'Sending...' : 'Send Message'}</span>
                </span>
              </Button>
            </form>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-20 pt-8 border-t border-white/5"
        >
          <p className="text-white/40 text-sm">
            © 2026 Rishabh Chaturvedi. Thoughtfully engineered.
          </p>
        </motion.div>
      </div>
    </section>
  );
}