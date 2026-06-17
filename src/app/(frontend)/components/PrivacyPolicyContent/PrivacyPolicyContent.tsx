import '../LegalDocumentPage/LegalDocumentPage.css'
import './PrivacyPolicyContent.css'
import RichTextRenderer from '../RichTextRenderer/RichTextRenderer'
import { formatPrivacySectionTitle, getPrivacySectionId } from '@/lib/privacyPolicy'
import type { PrivacyPolicy } from '@/payload-types'

type PrivacySection = NonNullable<PrivacyPolicy['sections']>[number]

type Props = {
  sections?: PrivacyPolicy['sections']
}

function SectionHeading({
  id,
  sectionNumber,
  title,
}: {
  id: string
  sectionNumber?: string | null
  title?: string | null
}) {
  const heading = formatPrivacySectionTitle(sectionNumber, title)
  if (!heading) return null

  return (
    <h2 id={id} className="legal-section-title">
      {heading}
    </h2>
  )
}

function renderSection(section: PrivacySection, index: number) {
  const id = getPrivacySectionId(section, index)

  switch (section.blockType) {
    case 'contentSection':
      return (
        <section key={id} className="legal-section">
          <SectionHeading id={id} sectionNumber={section.sectionNumber} title={section.title} />
          <div className="legal-section-body article-body-v2">
            <RichTextRenderer content={section.content} />
          </div>
        </section>
      )

    case 'cookiesPolicy':
      return (
        <section key={id} className="legal-section">
          <SectionHeading id={id} sectionNumber={section.sectionNumber} title={section.title} />
          {section.intro ? (
            <div className="legal-section-body article-body-v2 privacy-section-intro">
              <RichTextRenderer content={section.intro} />
            </div>
          ) : null}
          {section.cookieTypes?.length ? (
            <div className="privacy-cookies-grid">
              {section.cookieTypes.map((cookie, cookieIndex) => (
                <div key={cookie.id || `${id}-cookie-${cookieIndex}`} className="privacy-cookie-card">
                  <h3 className="privacy-cookie-title">{cookie.title}</h3>
                  <p className="privacy-cookie-description">{cookie.description}</p>
                  {cookie.managedBy ? (
                    <p className="privacy-cookie-managed-by">Managed by: {cookie.managedBy}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
          {section.footer ? (
            <div className="legal-section-body article-body-v2 privacy-section-footer">
              <RichTextRenderer content={section.footer} />
            </div>
          ) : null}
        </section>
      )

    case 'grievanceOfficer': {
      const details = [
        { label: 'Name', value: section.officerName },
        { label: 'Designation', value: section.designation },
        { label: 'Email', value: section.email },
        { label: 'Address', value: section.address },
        { label: 'Response Time', value: section.responseTime },
      ].filter((item) => item.value)

      return (
        <section key={id} className="legal-section">
          <SectionHeading id={id} sectionNumber={section.sectionNumber} title={section.title} />
          {section.intro ? (
            <div className="legal-section-body article-body-v2 privacy-section-intro">
              <RichTextRenderer content={section.intro} />
            </div>
          ) : null}
          {details.length > 0 ? (
            <dl className="privacy-grievance-details">
              {details.map((item) => (
                <div key={item.label} className="privacy-grievance-row">
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {section.closing ? (
            <div className="legal-section-body article-body-v2 privacy-section-footer">
              <RichTextRenderer content={section.closing} />
            </div>
          ) : null}
        </section>
      )
    }

    default:
      return null
  }
}

export default function PrivacyPolicyContent({ sections }: Props) {
  if (!sections?.length) return null

  return (
    <div className="legal-page">
      <div className="legal-page-inner">
        <article className="legal-page-content privacy-policy-content">
          {sections.map((section, index) => renderSection(section, index))}
        </article>
      </div>
    </div>
  )
}
