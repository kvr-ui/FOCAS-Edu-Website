import { motion } from "framer-motion";
import logo from "../../public/focas.jpeg";
const Header = () => {
    return (<motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-center">
        <motion.span className="text-2xl font-bold font-sora text-primary tracking-wide cursor-pointer" whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
          <img src={logo} alt="" className="h-16 w-32 sm:w-18 object-cover rounded-full sm:rounded-none"/>
        </motion.span>
      </div>
    </motion.header>);
};
export default Header;
