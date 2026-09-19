import en from "./translations/en.json";
import fr from "./translations/fr.json";
import type {ComponentProps} from "react";
import config from "../../../../gt.config.json";
import {GTProvider, initializeGT} from "gt-react";


// JSON imports widen literal tags in GT’s generated JSX format
export const translations = { en, fr } as ComponentProps<typeof GTProvider>["translations"];


initializeGT({
    ...config,
    cacheUrl: null,
    runtimeUrl: null,
    loadTranslations: async locale => translations[locale],
});
