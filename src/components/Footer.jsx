import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";

const Footer = () => {
  return (
    <div className="bg-gradient-to-b from-[#13bd7d] to-transparent ">
      <section className="py-20 text-center">
        <h2 className="text-4xl font-bold mb-4">Ready to try PeerShare?</h2>
        <p className="mb-8 text-lg">Send files, chat, or video call — all without servers.</p>
        <Link to="/create-room">
          <Button variant="default">Start Sharing</Button>
        </Link>
      </section>

      <footer className="border-t mt-12 ">
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-xl font-semibold mb-2">Your Files, Your Way.</h3>
            <p className="text-muted-foreground mb-4">Experience fast, secure, and private sharing with PeerShare.</p>
            <img src={logo} alt="PeerShare Logo" className="w-8 mb-4" />
          </div>

          {/* Links */}
          {/* Links */}
          <div>
            <h4 className="text-sm font-medium mb-3">Resources</h4>
            <div className="grid grid-cols-2 gap-x-6 text-sm text-muted-foreground">
              <ul className="space-y-2">
                <li><Link to="/about" className="hover:text-primary">About</Link></li>
                <li><Link to="/faq" className="hover:text-primary">FAQ</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-primary">Privacy Policy</Link></li>
              </ul>
              <ul className="space-y-2">
                <li><Link to="/terms-of-service" className="hover:text-primary">Terms of Service</Link></li>
                <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
                <li><Link to="/report-bug" className="hover:text-primary">Report a bug</Link></li>
              </ul>
            </div>
          </div>


          {/* Subscribe */}
          <div>
            <h4 className="text-sm font-medium mb-3">Stay in the loop</h4>
            <p className="text-muted-foreground text-sm mb-4">Get the latest updates and features.</p>
            <form className="flex flex-col sm:flex-row gap-2">
              <Input type="email" placeholder="Enter your email" />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t text-center text-sm text-muted-foreground py-4">
          &copy; {new Date().getFullYear()} PeerShare. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Footer;
