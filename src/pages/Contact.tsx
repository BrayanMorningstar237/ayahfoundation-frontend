import {
  Phone,
  Mail,
  MapPin,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  MessageCircle
} from "lucide-react";

import logoimg from "../assets/images/logo/AyahFoundation.jpeg";
import { useSiteSettings } from "../services/useSiteSettings";

const Contact = () => {
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

  const whatsappLink = phone
    ? `https://wa.me/${phone.replace(/\D/g, "")}`
    : null;

  return (
    <section className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-14">
          <img
            src={logoimg}
            alt={siteName}
            className="w-20 h-20 mx-auto rounded-full mb-4"
          />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Contact {siteName || "Ayah Foundation"}
          </h1>
          <p className="text-gray-600 mt-3 max-w-xl mx-auto">
            We’d love to hear from you. Reach out through any of the channels below.
          </p>
        </div>

        {/* CONTENT */}
        <div className="bg-white rounded-3xl shadow-sm p-8 sm:p-12 space-y-8">

          {/* CONTACT METHODS */}
          <div className="grid sm:grid-cols-2 gap-6">

            {/* ADDRESS */}
            {address && (
              <div className="flex gap-4">
                <MapPin className="w-6 h-6 text-blue-600 shrink-0" />
                <p className="text-gray-700">{address}</p>
              </div>
            )}

            {/* PHONE */}
            {phone && (
              <a
                href={`tel:${phone}`}
                className="flex gap-4 text-gray-700 hover:text-blue-600 transition"
              >
                <Phone className="w-6 h-6 text-blue-600 shrink-0" />
                {phone}
              </a>
            )}

            {/* EMAIL */}
            {email && (
              <a
                href={`mailto:${email}`}
                className="flex gap-4 text-gray-700 hover:text-blue-600 transition"
              >
                <Mail className="w-6 h-6 text-blue-600 shrink-0" />
                {email}
              </a>
            )}

            {/* WEBSITE */}
            {/* WEBSITE */}
{website && (() => {
  const normalizedWebsite =
    website.startsWith("http://") || website.startsWith("https://")
      ? website
      : `https://${website}`;

  return (
    <a
      href={normalizedWebsite}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-4 text-gray-700 hover:text-blue-600 transition"
    >
      <Globe className="w-6 h-6 text-blue-600 shrink-0" />
      {website}
    </a>
  );
})()}

          </div>

          {/* WHATSAPP */}
          {whatsappLink && (
            <div className="pt-6 border-t">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-semibold transition"
              >
                <MessageCircle className="w-5 h-5" />
                Chat with us on WhatsApp
              </a>
            </div>
          )}

          {/* SOCIALS */}
          <div className="pt-6 border-t">
            <h3 className="text-lg font-bold mb-4 text-gray-900">
              Follow Us
            </h3>

            <div className="flex gap-4 flex-wrap">
              {socials.map(({ name, icon: Icon, url }) =>
                url ? (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-gray-100 hover:bg-blue-600 hover:text-white rounded-full flex items-center justify-center transition"
                    aria-label={name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ) : null
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Contact;
