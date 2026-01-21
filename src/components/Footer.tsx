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
} from "lucide-react";
import logoimg from "../assets/images/logo/AyahFoundation.jpeg";
import { useSiteSettings } from "../services/useSiteSettings";

const Footer = () => {
  const settings = useSiteSettings();

  if (!settings) return null;

  const {
    siteName,
    address,
    email,
    phone,
    website,
    socialLinks = {}
  } = settings;

  const socials = [
    { name: "Facebook", icon: Facebook, url: socialLinks.facebook },
    { name: "Twitter", icon: Twitter, url: socialLinks.twitter },
    { name: "Instagram", icon: Instagram, url: socialLinks.instagram },
    { name: "LinkedIn", icon: Linkedin, url: socialLinks.linkedin },
    { name: "YouTube", icon: Youtube, url: socialLinks.youtube }
  ];

  const placeholder = (text: string) => (
    <span className="italic text-gray-500">
      {text} (add in site settings)
    </span>
  );

  return (
    <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8" id="contact">
      <div className="max-w-7xl mx-auto">

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* BRAND */}
          <div>
            <div className="flex items-center mb-6">
              <img src={logoimg} className="w-10 h-10 rounded" />
              <span className="ml-3 text-2xl font-bold">
                {siteName || "Ayah Foundation"}
              </span>
            </div>

            <p className="text-gray-400 mb-6 leading-relaxed">
              Empowering communities through care, compassion, and action.
            </p>

            <div className="flex gap-4">
              {socials.map(({ name, icon: Icon, url }) =>
                url ? (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ) : (
                  <div
                    key={name}
                    title={`Add ${name} link in site settings`}
                    className="w-10 h-10 bg-gray-800/50 text-gray-500 rounded-full flex items-center justify-center cursor-not-allowed"
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                )
              )}
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="text-lg font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {[
                ["/about", "About Us"],
                ["/campaigns", "Campaigns"],
                ["/news", "News"],
                ["/campaigns", "Success Stories"],
                ["/contact", "Contact"]
              ].map(([href, label]) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-gray-400 hover:text-white inline-flex items-center group"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="text-lg font-bold mb-6">Contact Us</h3>
            <ul className="space-y-4 text-gray-400">

              <li className="flex">
                <MapPin className="w-5 h-5 mr-3 text-blue-400" />
                {address || placeholder("Address not set")}
              </li>

              <li className="flex">
                <Phone className="w-5 h-5 mr-3 text-blue-400" />
                {phone || placeholder("Phone number not set")}
              </li>

              <li className="flex">
                <Mail className="w-5 h-5 mr-3 text-blue-400" />
                {email || placeholder("Email not set")}
              </li>

              <li className="flex">
                <Globe className="w-5 h-5 mr-3 text-blue-400" />
                {website || placeholder("Website not set")}
              </li>

            </ul>
          </div>

          {/* NEWSLETTER */}
          <div>
            <h3 className="text-lg font-bold mb-6">Stay Connected</h3>
            <p className="text-gray-400 mb-4">
              Subscribe to get latest updates and inspiring stories
            </p>

            <input
              type="email"
              placeholder="Your email address"
              className="w-full px-4 py-3 rounded-full bg-gray-800 border border-gray-700 mb-3"
            />
            <button className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-full font-semibold transition">
              Subscribe
            </button>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400">
          <p>
            © {new Date().getFullYear()} {siteName || "Ayah Foundation"}. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a className="hover:text-white" href="#">Privacy Policy</a>
            <a className="hover:text-white" href="#">Terms of Service</a>
            <a className="hover:text-white" href="#">Transparency Report</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
