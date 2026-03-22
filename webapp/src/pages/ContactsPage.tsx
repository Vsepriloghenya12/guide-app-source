import { Link } from 'react-router-dom';
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
        badgeLabel="Контакты"
      />

      <section className="panel utility-hero-card">
        <div>
          <span className="eyebrow">{content.heroEyebrow}</span>
          <h2>{content.heroTitle}</h2>
          <p>{content.heroText}</p>
        </div>
        <div className="utility-hero-card__actions">
          <Link className="button button--ghost" to="/help">
            {content.helpButtonLabel}
          </Link>
        </div>
      </section>

      <section className="utility-grid utility-grid--channels">
        {content.contactChannels.map((channel) => (
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
          <strong>{content.emergencyTitle}</strong>
          <span>{content.emergencySubtitle}</span>
        </div>

        <div className="utility-grid utility-grid--emergency">
          {content.emergencyContacts.map((contact) => (
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
