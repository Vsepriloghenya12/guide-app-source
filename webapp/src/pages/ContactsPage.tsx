import { useEffect, useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { defaultSupportContent, fetchSupportContent, type SupportContentStore } from '../data/supportContent';
import { recordGuideAnalytics } from '../utils/analytics';
import { usePageMeta } from '../hooks/usePageMeta';

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
  const [content, setContent] = useState<SupportContentStore>(defaultSupportContent);

  useEffect(() => {
    let active = true;
    fetchSupportContent()
      .then((next) => {
        if (active) {
          setContent(next);
        }
      })
      .catch(() => {
        // fallback stays on defaults
      });

    return () => {
      active = false;
    };
  }, []);

  usePageMeta({
    title: 'Контакты',
    description: 'Мессенджеры, телефон и важные контакты для поездки.'
  });

  return (
    <div className="page-stack utility-page utility-page--contacts">
      <PageHeader
        title="Контакты"
        subtitle="Основные каналы связи, мессенджеры, телефон и важные номера, которые могут пригодиться в поездке."
        showBack
        badgeLabel="Контакты"
      />

      <section className="utility-simple-section">
        <h2>{content.heroTitle}</h2>
        <p>{content.heroText}</p>
      </section>

      <section className="utility-simple-section">
        <h3>Каналы связи</h3>
        <ul className="utility-simple-list">
          {content.contactChannels.map((channel) => (
            <li key={channel.id}>
              <strong>{channel.title} ({getChannelBadge(channel.kind)}):</strong>{' '}
              <a
                className="utility-simple-link"
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
                {channel.value}
              </a>
              {channel.subtitle ? <span className="utility-simple-note"> — {channel.subtitle}</span> : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="utility-simple-section">
        <h3>{content.emergencyTitle}</h3>
        <p>{content.emergencySubtitle}</p>
        <ul className="utility-simple-list">
          {content.emergencyContacts.map((contact) => (
            <li key={contact.id}>
              <strong>{contact.title}:</strong>{' '}
              <a
                className="utility-simple-link"
                href={contact.href}
                onClick={() =>
                  recordGuideAnalytics({
                    kind: 'phone-click',
                    label: `Emergency · ${contact.title}`,
                    path: contact.href
                  })
                }
              >
                {contact.value}
              </a>
              {contact.description ? <span className="utility-simple-note"> — {contact.description}</span> : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
