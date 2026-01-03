import { Hero } from './components/Hero';
import { About } from './components/About';
import { Journey } from './components/Journey';
import { Skills } from './components/Skills';
import { Projects } from './components/Projects';
import { Contact } from './components/Contact';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <div className="bg-[#0a0a0a] text-white">
      <Hero />
      <About />
      <Journey />
      <Skills />
      <Projects />
      <Contact />
      <Toaster position="bottom-right" theme="dark" />
    </div>
  );
}