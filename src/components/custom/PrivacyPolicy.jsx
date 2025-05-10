// src/pages/PrivacyPolicy.jsx
import React from 'react';
import { useLanguage } from "@/context/LanguageContext";
import Footer from '@/components/custom/Footer';

const PrivacyPolicy = () => {
  const { translate, language } = useLanguage();
  const isRTL = language === "he";

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-700 pt-20" style={{ direction: isRTL ? "rtl" : "ltr" }}>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-100">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-6">
              <h1 className="text-4xl font-bold text-white text-center">
                {translate("privacyPolicy.title")}
              </h1>
            </div>
            
            <div className="p-8">
              {/* Introduction Section */}
              <section className="mb-10 hover:bg-gray-50 rounded-xl p-6 transition-all">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                  {translate("privacyPolicy.introduction.title")}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {translate("privacyPolicy.introduction.content")}
                </p>
              </section>

              {/* Data Collection Section */}
              <section className="mb-10 hover:bg-gray-50 rounded-xl p-6 transition-all">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                  {translate("privacyPolicy.dataCollection.title")}
                </h2>
                <ul className="list-disc pl-5 text-gray-600 space-y-2">
                  <li>{translate("privacyPolicy.dataCollection.item1")}</li>
                  <li>{translate("privacyPolicy.dataCollection.item2")}</li>
                  <li>{translate("privacyPolicy.dataCollection.item3")}</li>
                  <li>{translate("privacyPolicy.dataCollection.item4")}</li>
                </ul>
              </section>

              {/* Data Use Section */}
              <section className="mb-10 hover:bg-gray-50 rounded-xl p-6 transition-all">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                  {translate("privacyPolicy.dataUse.title")}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {translate("privacyPolicy.dataUse.content")}
                </p>
              </section>

              {/* Security Section */}
              <section className="mb-10 hover:bg-gray-50 rounded-xl p-6 transition-all">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                  {translate("privacyPolicy.security.title")}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {translate("privacyPolicy.security.content")}
                </p>
              </section>

              {/* Cookies Section */}
              <section className="mb-10 hover:bg-gray-50 rounded-xl p-6 transition-all">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                  {translate("privacyPolicy.cookies.title")}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {translate("privacyPolicy.cookies.content")}
                </p>
              </section>

              {/* Contact Section */}
              <section className="mb-10 hover:bg-gray-50 rounded-xl p-6 transition-all">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                  {translate("privacyPolicy.contact.title")}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {translate("privacyPolicy.contact.content")}
                  <a 
                    href="mailto:majdad@post.jce.ac.il"
                    className="text-blue-600 hover:text-blue-700 transition-colors ml-1 font-medium"
                  >
                    majdad@post.jce.ac.il
                  </a>
                </p>
              </section>

              {/* Updates Section */}
              <section className="mb-10 hover:bg-gray-50 rounded-xl p-6 transition-all">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                  {translate("privacyPolicy.updates.title")}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {translate("privacyPolicy.updates.content")}
                </p>
              </section>

              {/* Last Updated Footer */}
              <div className="mt-12 pt-6 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500">
                  <span>
                    {translate("privacyPolicy.lastUpdated")}: {formatDate(new Date().toLocaleDateString())}
                  </span>
                  <a 
                    href="mailto:majdad@post.jce.ac.il"
                    className="text-blue-600 hover:text-blue-700 transition-colors mt-2 sm:mt-0"
                  >
                    majdad@post.jce.ac.il
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <Footer /> */}
    </>
  );
};

export default PrivacyPolicy;