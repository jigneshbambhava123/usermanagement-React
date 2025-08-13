import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from '../src/locales/en.json';
import hi from '../src/locales/hi.json';
import bn from '../src/locales/bn.json';
import de from '../src/locales/de.json';

i18n.use(initReactI18next).init({
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    resources: {
        en: { translation: en },
        hi: { translation: hi },
        bn: { translation: bn },
        de: { translation: de },
    },
})

export default i18n;