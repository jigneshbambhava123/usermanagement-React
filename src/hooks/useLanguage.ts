import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useState, useEffect } from 'react';

const useLanguage = () => {
    const { t } = useTranslation();
    const [currentLanguage, setCurrentLanguage] = useState(
        localStorage.getItem('appLanguage') || i18n.language
    );

    useEffect(() => {
        const lang = localStorage.getItem('appLanguage');
        if (lang) {
            i18n.changeLanguage(lang);
        }

        const onLanguageChanged = (lng: string) => {
            setCurrentLanguage(lng);
            localStorage.setItem('appLanguage', lng);
        };

        i18n.on('languageChanged', onLanguageChanged);

        return () => {
            i18n.off('languageChanged', onLanguageChanged);
        };
    }, []);

    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
        // setCurrentLanguage(lang);
        // localStorage.setItem('appLanguage', lang);
    };

    return {
        t,
        changeLanguage,
        currentLanguage,
        setCurrentLanguage
    };
};

export default useLanguage; 
