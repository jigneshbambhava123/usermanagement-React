import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useState } from 'react';

const useLanguage = () => {
    const { t } = useTranslation();
    const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
        setCurrentLanguage(lang);
    };

    return {
        t,
        changeLanguage,
        currentLanguage,
        setCurrentLanguage
    };
};

export default useLanguage; 
