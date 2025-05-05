import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Heart, Globe, Users, ShieldCheck } from "lucide-react";

const Section = ({ icon: Icon, title, children }) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.98 }}
    className="bg-white shadow-md rounded-2xl p-6 transition-all duration-300 hover:shadow-xl"
  >
    <div className="flex items-center gap-3 mb-4 text-primary">
      <Icon className="w-6 h-6" />
      <h3 className="text-xl font-semibold">{title}</h3>
    </div>
    <p className="text-gray-600">{children}</p>
  </motion.div>
);

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-6 md:px-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold ">
          <span className="text-blue-600">Athr – أثر</span>
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          A sustainable donation platform built to create impact that lives on. Empowering transparent giving, real stories, and lasting change.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Section icon={Heart} title="Sustainable Giving">
          Every campaign aims to leave a lasting mark – from supporting patients to building schools.
        </Section>

        <Section icon={ShieldCheck} title="Verified & Transparent">
          All donations are licensed and reviewed with full visibility into fund usage and impact.
        </Section>

        <Section icon={Users} title="Real-Time Interaction">
          Donors can chat with beneficiaries, track progress, and feel connected to the change.
        </Section>

        <Section icon={Globe} title="Broad Impact">
          From Egypt to the Arab world – Athr brings trusted charity to every screen and heart.
        </Section>

        <Section icon={Sparkles} title="Inspiring Stories">
          We showcase before & after transformations like Roqaya’s to prove your donation matters.
        </Section>

        <Section icon={Heart} title="Smart Donation Flow">
          No random links, no confusion – just clear cases, verified needs, and fast action.
        </Section>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mt-16 bg-white rounded-2xl shadow-lg p-8 text-center max-w-4xl mx-auto"
      >
        <h2 className="text-2xl font-semibold mb-2 text-blue-600">“A Roqaya Story”</h2>
        <p className="text-gray-600 mb-4">
          Roqaya needed urgent treatment. If Athr had existed earlier, her case could’ve been solved faster with transparent support and easier access for donors.
        </p>
        <p className="italic text-gray-500">Let’s make sure future Roqayas get help in time.</p>
      </motion.div>

      
    </div>
  );
};

export default AboutUs;
