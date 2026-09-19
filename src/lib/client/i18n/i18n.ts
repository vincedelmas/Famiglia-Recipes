import i18next from "i18next";
import {initReactI18next} from "react-i18next";
import {formatDateTime} from "~/lib/utils/helpers";
import enTranslations from "./translations/en.json";
import frTranslations from "./translations/fr.json";
import LanguageDetector from "i18next-browser-languagedetector";


const detectionOptions = {
    lookupCookie: "i18next",
    lookupQuerystring: "lng",
    lookupLocalStorage: "i18nextLng",
    caches: ["localStorage", "cookie"],
    order: ["localStorage", "navigator", "querystring", "cookie", "htmlTag"],
};


i18next
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        debug: false,
        fallbackLng: "en",
        detection: detectionOptions,
        resources: {
            en: { translation: enTranslations },
            fr: { translation: frTranslations },
        },
        interpolation: {
            escapeValue: false,
        },
        react: {
            useSuspense: true,
        },
    })
    .then(() => {
        i18next.services.formatter?.add("datetime", (value, lang, options) => formatDateTime(value, lang, options));
    }).catch((err) => {
    console.error("i18n init failed", err);
});


export default i18next;
