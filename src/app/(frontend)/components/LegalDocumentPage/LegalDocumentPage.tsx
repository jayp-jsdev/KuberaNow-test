import './LegalDocumentPage.css'
import RichTextRenderer from '../RichTextRenderer/RichTextRenderer'
import type { LegalSection } from '@/lib/legalPages'

type Props = {
  intro?: unknown
  notice?: unknown
  sections: LegalSection[]
}

export default function LegalDocumentPage({ intro, notice, sections }: Props) {
  return (
    <div className="legal-page">
      <div className="legal-page-inner">
        <div
          className={
            sections.length > 0
              ? 'legal-page-layout'
              : 'legal-page-layout legal-page-layout--single'
          }
        >
          <article className="legal-page-content">
            {intro ? (
              <div className="legal-page-intro">
                <RichTextRenderer content={intro} />
              </div>
            ) : null}

            {sections.map((section) => (
              <section key={section.id} id={section.id} className="legal-section">
                <h2 className="legal-section-title">{section.title}</h2>
                <div className="legal-section-body article-body-v2">
                  <RichTextRenderer content={section.content} />
                </div>
              </section>
            ))}
          </article>
        </div>
      </div>
    </div>
  )
}
