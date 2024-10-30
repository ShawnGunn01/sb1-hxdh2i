import React from 'react';
import { useTranslation } from 'react-i18next';
import AccessibleButton from './AccessibleButton';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex space-x-2" role="group" aria-label={t('languageSwitcher.label')}>
      <AccessibleButton
        onClick={() => changeLanguage('en')}
        ariaLabel={t('languageSwitcher.english')}
        className={`px-2 py-1 rounded ${i18n.language === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
      >
        EN
      </AccessibleButton>
      <AccessibleButton
        onClick={() => changeLanguage('es')}
        ariaLabel={t('languageSwitcher.spanish')}
        className={`px-2 py-1 rounded ${i18n.language === 'es' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
      >
        ES
      </AccessibleButton>
    </div>
  );
};

export default LanguageSwitcher;