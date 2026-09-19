import {GTProvider} from "gt-react";
import {translations} from "./i18n";
import {type ReactNode, useEffect, useState} from "react";


export function TranslationProvider({ children }: { children: ReactNode }) {
    const [locale, setLocale] = useState("en");

    useEffect(() => {
        // Match static English shell while hydrating, then restore user lang
        const savedLocale = localStorage.getItem("famiglia-locale") || localStorage.getItem("i18nextLng");
        setLocale([savedLocale, ...navigator.languages]
            .map(locale => locale?.split("-")[0])
            .find(locale => locale === "en" || locale === "fr") || "en");
    }, []);

    return (
        <GTProvider
            locale={locale}
            translations={{ [locale]: translations[locale] }}
            _reload={({ locale }) => {
                localStorage.setItem("famiglia-locale", locale);
                setLocale(locale);
            }}
        >
            {children}
        </GTProvider>
    );
}
