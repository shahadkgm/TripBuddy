import { motion } from 'framer-motion';

const Background = () => {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-white">
            {/* Extremely Soft Pastel Orbs - Near White */}
            <motion.div 
                animate={{
                    x: [0, 50, 0],
                    y: [0, -30, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-indigo-50/40 rounded-full blur-[140px]"
            />
            
            <motion.div 
                animate={{
                    x: [0, -40, 0],
                    y: [0, 60, 0],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] bg-blue-50/40 rounded-full blur-[140px]"
            />

            {/* Subtle light mesh pattern */}
            <div 
                className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `linear-gradient(#4f46e5 0.5px, transparent 0.5px), linear-gradient(90deg, #4f46e5 0.5px, transparent 0.5px)`,
                    backgroundSize: '80px 80px'
                }}
            />
            
            {/* Top lighting bloom */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[30vh] bg-gradient-to-b from-indigo-50/30 to-transparent blur-3xl" />
        </div>
    );
};

export default Background;
