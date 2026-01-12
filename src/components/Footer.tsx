import { 
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube
} from 'lucide-react';
import logoimg from "../assets/images/logo/AyahFoundation.jpeg";
const Footer = () => {
  return (
    <footer
      id="contact"
      className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center mb-6">
              <img src={logoimg} className="w-10 h-10 rounded text-blue-400 fill-blue-400" />
              <span className="ml-3 text-2xl font-bold">Ayah Foundation</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Empowering communities through care, compassion, and action. Together we build a better tomorrow.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-300"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {[
                ['#about', 'About Us'],
                ['#programs', 'Our Programs'],
                ['#campaigns', 'Campaigns'],
                ['#', 'Success Stories'],
                ['#', 'Get Involved'],
              ].map(([href, label]) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-gray-400 hover:text-white transition-colors duration-300 inline-flex items-center group"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start text-gray-400 hover:text-white">
                <MapPin className="w-5 h-5 mr-3 mt-1 text-blue-400" />
                Douala, Littoral Region, Cameroon
              </li>
              <li className="flex items-center text-gray-400 hover:text-white">
                <Phone className="w-5 h-5 mr-3 text-blue-400" />
                +237 6XXXXXXXX
              </li>
              <li className="flex items-center text-gray-400 hover:text-white">
                <Mail className="w-5 h-5 mr-3 text-blue-400" />
                info@ayahfoundation.org
              </li>
              <li className="flex items-center text-gray-400 hover:text-white">
                <Globe className="w-5 h-5 mr-3 text-blue-400" />
                www.ayahfoundation.org
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-bold mb-6">Stay Connected</h3>
            <p className="text-gray-400 mb-4">
              Subscribe to get latest updates and inspiring stories
            </p>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full px-4 py-3 rounded-full bg-gray-800 text-white border border-gray-700 focus:border-blue-500 outline-none"
              />
              <button className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-full font-semibold transition-transform hover:scale-105">
                Subscribe
              </button>
            </div>
            <p className="text-gray-500 text-xs mt-3">
              We respect your privacy. Unsubscribe anytime.
            </p>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-center md:text-left">
            © 2026 Ayah Foundation. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-white">Transparency Report</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
