import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { applyDocumentLocale } from '../../i18n'
import { LanguageSwitcher } from '../../i18n/LanguageSwitcher'
import layout from '../Privacy/PrivacyPage.module.css'
import {
  ACCOUNT_DELETION_EMAIL,
  accountDeletionCopy,
} from './accountDeletionContent'
import styles from './AccountDeletionPage.module.css'

export const AccountDeletionPage: React.FC = () => {
  const { i18n } = useTranslation()
  const copy = accountDeletionCopy(i18n.resolvedLanguage || i18n.language)

  useEffect(() => {
    const title = copy.title
    const apply = () => {
      document.title = title
    }
    apply()
    const timers = [0, 50, 400].map((delay) => window.setTimeout(apply, delay))
    return () => {
      timers.forEach((id) => window.clearTimeout(id))
    }
  }, [copy.title])

  useEffect(() => {
    return () => {
      applyDocumentLocale(i18n.language)
    }
  }, [i18n])

  return (
    <div className={layout.page}>
      <header className={layout.header}>
        <div className={layout.headerInner}>
          <Link to="/" className={layout.brand}>
            <img src="/landing/logo.jpg" alt="" className={layout.brandLogo} width={40} height={40} />
            <span>PAITZA</span>
          </Link>
          <div className={layout.headerActions}>
            <LanguageSwitcher />
            <Link to="/" className={layout.back}>
              {copy.back}
            </Link>
          </div>
        </div>
      </header>
      <main className={layout.main}>
        <h1 className={styles.title}>{copy.title}</h1>
        <section className={styles.section}>
          <h2>{copy.stepsTitle}</h2>
          <ol className={styles.steps}>
            {copy.steps.map((step, index) => (
              <li key={step} className={styles.step}>
                <span className={styles.num}>{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>
        <section className={styles.section}>
          <h2>{copy.emailTitle}</h2>
          <p>
            {copy.emailBefore}
            <a href={`mailto:${ACCOUNT_DELETION_EMAIL}`}>{ACCOUNT_DELETION_EMAIL}</a>
            {copy.emailAfter}
          </p>
        </section>
        <section className={styles.section}>
          <h2>{copy.deletedTitle}</h2>
          <ul>
            {copy.deleted.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section className={styles.section}>
          <h2>{copy.keptTitle}</h2>
          <ul>
            {copy.kept.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}

export default AccountDeletionPage
