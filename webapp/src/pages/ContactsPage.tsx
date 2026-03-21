import { Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { contactChannels, emergencyContacts } from '../data/supportContent';
import { recordGuideAnalytics } from '../utils/analytics';

function getChannelBadge(kind: string) {
  switch (kind) {
    case 'telegram':
      return 'Telegram';
    case 'whatsapp':
      return 'WhatsApp';
    case 'phone':
      return 'Телефон';
    case 'email':
      return 'Email';
    case 'instagram':
      return 'Instagram';
    default:
      return 'Контакт';
  }
}

export function ContactsPage() {
  return (
    <div className="page-stack utility-page utility-page--contacts">
      <PageHeader
        title="Контакты"
        subtitle="Основные каналы связи, мессенджеры, телефон и emergency contacts для туристической ситуации."
        badgeLabel="Contacts"
      />

      <section className="panel utility-hero-card">
        <div>
          <span className="eyebrow">На связи</span>
          <h2>Связаться с guide-командой и открыть быстрые контакты</h2>
          <p>
            Здесь собраны основные каналы связи, чтобы пользователь не искал телефон, Telegram
            или WhatsApp по всему приложению. Для критичных ситуаций ниже есть отдельный блок
            emergency contacts.
          </p>
        </div>
        <div className="utility-hero-card__actions">
          <Link className="button button--ghost" to="/help">
            Открыть помощь
          </Link>
        </div>
      </section>

      <section className="utility-grid utility-grid--channels">
        {contactChannels.map((channel) => (
          <a
            key={channel.id}
            className="panel utility-channel-card"
            href={channel.href}
            target={channel.href.startsWith('http') ? '_blank' : undefined}
            rel={channel.href.startsWith('http') ? 'noreferrer' : undefined}
            onClick={() =>
              recordGuideAnalytics({
                kind: channel.kind === 'phone' ? 'phone-click' : 'website-click',
                label: `Контакты · ${channel.title}`,
                path: channel.href
              })
            }
          >
            <span className="utility-channel-card__badge">{getChannelBadge(channel.kind)}</span>
            <strong>{channel.title}</strong>
            <p>{channel.subtitle}</p>
            <span className="utility-channel-card__value">{channel.value}</span>
          </a>
        ))}
      </section>

      <section className="panel utility-section-card">
        <div className="section-headline">
          <strong>Экстренные контакты</strong>
          <span>Полезно сохранить до поездки или держать под рукой в офлайн-режиме.</span>
        </div>

        <div className="utility-grid utility-grid--emergency">
          {emergencyContacts.map((contact) => (
            <a
              key={contact.id}
              className="utility-emergency-card"
              href={contact.href}
              onClick={() =>
                recordGuideAnalytics({
                  kind: 'phone-click',
                  label: `Emergency · ${contact.title}`,
                  path: contact.href
                })
              }
            >
              <strong>{contact.title}</strong>
              <p>{contact.description}</p>
              <span>{contact.value}</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
