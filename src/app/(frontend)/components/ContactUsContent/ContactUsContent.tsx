import './ContactUsContent.css'
import RichTextRenderer from '../RichTextRenderer/RichTextRenderer'
import OptimizedImage from '../OptimizedImage/OptimizedImage'
import { getMediaUrl } from '@/lib/carousel'
import type { ContactUs, Media } from '@/payload-types'

type ContactCard = NonNullable<ContactUs['contactCards']>[number]
type GrievanceSection = NonNullable<ContactUs['grievanceSection']>
type SlaBox = NonNullable<GrievanceSection['slaBoxes']>[number]

type LegacyGrievanceSection = GrievanceSection & {
  acknowledgementLabel?: string | null
  acknowledgementTime?: string | null
  acknowledgementSub?: string | null
  resolutionLabel?: string | null
  resolutionTime?: string | null
  resolutionSub?: string | null
}

function getSlaBoxes(section: GrievanceSection): SlaBox[] {
  if (section.slaBoxes?.length) return section.slaBoxes

  const legacy = section as LegacyGrievanceSection
  const boxes: SlaBox[] = []

  if (legacy.acknowledgementTime) {
    boxes.push({
      id: 'legacy-acknowledgement',
      label: legacy.acknowledgementLabel || 'Acknowledgement',
      value: legacy.acknowledgementTime,
      subtitle: legacy.acknowledgementSub,
    })
  }

  if (legacy.resolutionTime) {
    boxes.push({
      id: 'legacy-resolution',
      label: legacy.resolutionLabel || 'Resolution',
      value: legacy.resolutionTime,
      subtitle: legacy.resolutionSub,
    })
  }

  return boxes
}

type Props = {
  pageTitle?: string | null
  responseCommitment?: string | null
  contactCards?: ContactUs['contactCards']
  grievanceSection?: GrievanceSection | null
  inlineIcons?: Record<string, string>
}

function DefaultContactIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  )
}

function ContactCardIcon({
  iconImage,
  title,
  inlineSrc,
  priority,
}: {
  iconImage?: ContactCard['iconImage']
  title?: string | null
  inlineSrc?: string
  priority?: boolean
}) {
  const media =
    iconImage && typeof iconImage === 'object' ? (iconImage as Media) : null
  const iconUrl = inlineSrc || getMediaUrl(media)

  return (
    <div className="contact-card-icon" aria-hidden={iconUrl ? undefined : true}>
      {iconUrl ? (
        <OptimizedImage
          src={iconUrl}
          alt={media?.alt || `${title || 'Contact'} icon`}
          width={20}
          height={20}
          className="contact-card-icon-image"
          priority={priority}
          fetchPriority={priority ? 'high' : 'auto'}
        />
      ) : (
        <DefaultContactIcon />
      )}
    </div>
  )
}

function shouldHighlightDetail(label?: string | null, highlightValue?: boolean | null, value?: string | null) {
  if (highlightValue) return true
  const normalizedLabel = label?.trim().toLowerCase() || ''
  return normalizedLabel === 'email' || Boolean(value?.includes('@'))
}

function ContactCardItem({
  card,
  inlineIcons,
  priorityIcon,
}: {
  card: ContactCard
  inlineIcons?: Record<string, string>
  priorityIcon?: boolean
}) {
  const media =
    card.iconImage && typeof card.iconImage === 'object' ? (card.iconImage as Media) : null
  const inlineSrc = media?.filename ? inlineIcons?.[media.filename] : undefined

  return (
    <article className="contact-card">
      <div className="contact-card-header">
        <ContactCardIcon
          iconImage={card.iconImage}
          title={card.title}
          inlineSrc={inlineSrc}
          priority={priorityIcon}
        />
        <h2 className="contact-card-title">{card.title}</h2>
      </div>
      {card.description ? <p className="contact-card-description">{card.description}</p> : null}
      {card.details?.length ? (
        <dl className="contact-card-details">
          {card.details.map((detail) => {
            const highlighted = shouldHighlightDetail(
              detail.label,
              detail.highlightValue,
              detail.value,
            )

            return (
              <div key={detail.id || `${detail.label}-${detail.value}`} className="contact-card-detail-row">
                <dt>{detail.label}</dt>
                <dd className={highlighted ? 'is-highlighted' : undefined}>{detail.value}</dd>
              </div>
            )
          })}
        </dl>
      ) : null}
      {card.footnote ? <p className="contact-card-footnote">{card.footnote}</p> : null}
    </article>
  )
}

function GrievancePanel({ section }: { section?: GrievanceSection | null }) {
  if (!section) return null

  const slaBoxes = getSlaBoxes(section)

  return (
    <section className="contact-grievance">
      <div className="contact-grievance-inner">
        <div className="contact-grievance-left">
          {section.title ? <h2 className="contact-grievance-title">{section.title}</h2> : null}
          {section.description ? (
            <div className="contact-grievance-description article-body-v2">
              <RichTextRenderer content={section.description} />
            </div>
          ) : null}
          {slaBoxes.length > 0 ? (
            <div className="contact-grievance-sla-row">
              {slaBoxes.map((box) => (
                <div key={box.id || `${box.label}-${box.value}`} className="contact-grievance-sla-box">
                  {box.label ? <span className="contact-grievance-sla-label">{box.label}</span> : null}
                  {box.value ? <span className="contact-grievance-sla-value">{box.value}</span> : null}
                  {box.subtitle ? <span className="contact-grievance-sla-sub">{box.subtitle}</span> : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="contact-grievance-right">
          {section.officerDetails?.length ? (
            <dl className="contact-grievance-details">
              {section.officerDetails.map((detail) => (
                <div key={detail.id || `${detail.label}-${detail.value}`} className="contact-grievance-detail-row">
                  <dt>{detail.label}</dt>
                  <dd>{detail.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {section.submissionNote ? (
            <p className="contact-grievance-note">{section.submissionNote}</p>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default function ContactUsContent({
  pageTitle,
  responseCommitment,
  contactCards,
  grievanceSection,
  inlineIcons,
}: Props) {
  const topCards = contactCards?.slice(0, 3) ?? []
  const bottomCards = contactCards?.slice(3) ?? []

  return (
    <div className="contact-page">
      <div className="contact-page-panel">
        <header className="contact-page-header">
          <div className="contact-page-title-row">
            <span className="contact-page-title-bar" aria-hidden="true" />
            <h1 className="contact-page-title">{pageTitle || 'Get in Touch with Us'}</h1>
          </div>
        </header>

        <div className="contact-page-body">
          {responseCommitment ? (
            <div className="contact-commitment-banner">{responseCommitment}</div>
          ) : null}

          <div className="contact-cards-stack">
            {topCards.length > 0 ? (
              <div className="contact-cards-grid contact-cards-grid--three">
                {topCards.map((card, index) => (
                  <ContactCardItem
                    key={card.id}
                    card={card}
                    inlineIcons={inlineIcons}
                    priorityIcon={index < 3}
                  />
                ))}
              </div>
            ) : null}

            {bottomCards.length > 0 ? (
              <div className="contact-cards-grid contact-cards-grid--two">
                {bottomCards.map((card) => (
                  <ContactCardItem key={card.id} card={card} inlineIcons={inlineIcons} />
                ))}
              </div>
            ) : null}
          </div>

          <GrievancePanel section={grievanceSection} />
        </div>
      </div>
    </div>
  )
}
