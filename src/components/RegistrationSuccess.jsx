import React, { useEffect, useState } from "react";
import { CheckCircle, Clock, Users, Phone } from "lucide-react";
/* SAFE TRACK EVENT */
const trackEvent = (event) => {
    console.log("Event:", event);
};
const RegistrationSuccess = () => {
    const [autoRedirect, setAutoRedirect] = useState(true);
    const [countdown, setCountdown] = useState(10);
    const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/E6skNJ3A4RN5MpmTqUHwMN";
    const SUPPORT_NUMBERS = ["+91 63835 14285"];
    // ✅ Access fbq safely without TS errors
    const fbq = globalThis.fbq;
    // ✅ Meta Pixel: fire conversion + pageview immediately on success page
    useEffect(() => {
        fbq?.("track", "PageView");
        fbq?.("track", "CompleteRegistration");
        fbq?.("track", "Lead");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // ✅ Auto redirect countdown
    useEffect(() => {
        if (autoRedirect && countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown((c) => c - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
        if (autoRedirect && countdown === 0) {
            fbq?.("trackCustom", "AutoRedirectToWhatsAppGroup");
            openLink(WHATSAPP_GROUP_URL);
        }
    }, [autoRedirect, countdown, WHATSAPP_GROUP_URL, fbq]);
    const openLink = (url) => {
        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
    const handleJoinGroup = () => {
        fbq?.("trackCustom", "JoinWhatsAppGroup_Click");
        trackEvent("join_whatsapp_group");
        openLink(WHATSAPP_GROUP_URL);
    };
    const handleShareWhatsapp = () => {
        fbq?.("trackCustom", "Share_WhatsApp_Click");
        trackEvent("share_whatsapp");
        const text = encodeURIComponent("Just registered with FOCAS for CA Inter! Check them out: https://focasedu.com");
        openLink(`https://wa.me/?text=${text}`);
    };
    const handleShareTelegram = () => {
        fbq?.("trackCustom", "Share_Telegram_Click");
        trackEvent("share_telegram");
        const text = encodeURIComponent("Just registered with FOCAS for CA Inter!");
        openLink(`https://t.me/share/url?url=https://focasedu.com&text=${text}`);
    };
    return (<div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-50 px-3 py-4 lg:flex lg:items-center lg:justify-center">
      <div className="w-full max-w-5xl mx-auto">
        {/* MAIN CARD */}
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 mb-5">
          {/* LOGO */}
          <div className="text-center mb-5">
            <img src="/Focus-logo-tag.png" alt="FOCAS" className="mx-auto max-w-[160px] md:max-w-[190px]" loading="eager"/>
          </div>

          {/* CONTENT */}
          <div className="flex flex-col items-center text-center max-w-xl mx-auto">
            {/* SUCCESS */}
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <CheckCircle className="w-7 h-7 text-green-600"/>
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                Registration Successful!
              </h2>

              <p className="text-gray-600 text-sm md:text-base">
                Welcome to FOCAS. Our team will reach out to you shortly.
              </p>
            </div>

            {/* CTA BUTTONS */}
            <div className="w-full mt-2 space-y-3">
              <button type="button" onClick={handleJoinGroup} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md text-base">
                <Users className="w-5 h-5"/>
                Join Last Attempt Community
              </button>
            </div>

            {/* WHATSAPP PREVIEW IMAGE */}
            <div className="w-full flex justify-center mt-6">
              <img src="/focas_whatsapp.jpeg" alt="FOCAS WhatsApp Preview" className="rounded-2xl shadow-2xl w-[260px] sm:w-[300px] md:w-[340px]" loading="lazy"/>
            </div>

            {/* STEPS */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white"/>
                </div>
                <span className="font-semibold text-xs">Registered</span>
              </div>

              <div className="w-10 h-0.5 bg-gray-300"/>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 border-2 border-orange-500 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-orange-600"/>
                </div>
                <span className="font-semibold text-xs text-orange-600">
                  Join WhatsApp
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SHARE */}
        <div className="bg-white rounded-2xl shadow-md p-4 mb-4 text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Share FOCAS with Your CA Friends
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Help your friends discover quality CA education.
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" onClick={handleShareWhatsapp} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg text-sm">
              WhatsApp
            </button>

            <button type="button" onClick={handleShareTelegram} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg text-sm">
              Telegram
            </button>
          </div>
        </div>

        {/* AUTO REDIRECT */}
        <div className="bg-white rounded-xl shadow-sm p-3 mb-4">
          <label className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700">
              Auto redirect in {countdown}s
            </span>
            <input type="checkbox" checked={autoRedirect} onChange={(e) => {
            setAutoRedirect(e.target.checked);
            setCountdown(3);
            fbq?.("trackCustom", e.target.checked ? "AutoRedirect_On" : "AutoRedirect_Off");
        }} className="w-4 h-4 accent-green-600"/>
          </label>
        </div>

        {/* SUPPORT */}
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <Phone className="mx-auto mb-2 text-gray-700 w-5 h-5"/>
          <p className="text-xs font-semibold mb-1 text-red-500">Need Help?</p>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            {SUPPORT_NUMBERS.map((n, i) => (<a key={i} href={`tel:${n.replace(/\s/g, "")}`} className="text-blue-700 font-medium text-sm">
                {n}
              </a>))}
          </div>
        </div>
      </div>
    </div>);
};
export default RegistrationSuccess;
