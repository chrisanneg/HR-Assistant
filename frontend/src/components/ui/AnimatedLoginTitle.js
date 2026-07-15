import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import VariableProximity from './VariableProximity';

const AnimatedLoginTitle = ({ darkMode, className = "" }) => {
  const titleRef = useRef(null);

  return (
    <motion.div 
      ref={titleRef} 
      className={className}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <VariableProximity
        label="HR Policy Assistant"
        fromFontVariationSettings="'wght' 500, 'opsz' 14"
        toFontVariationSettings="'wght' 900, 'opsz' 72"
        containerRef={titleRef}
        radius={100}
        falloff="exponential"
        className="variable-proximity-enhanced transition-all duration-300 login-title-effect"
        style={{
          fontFamily: '"Roboto Flex", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1',
          letterSpacing: '-0.025em',
          textRendering: 'optimizeLegibility',
          color: 'white',
        }}
      />
    </motion.div>
  );
};

export default AnimatedLoginTitle;