import { memo, useState } from 'react';
import { EDUCATION } from '../../data/resumeData';
import { TiltedCardWrapper } from '../ui/TiltedCardWrapper';
import { keepAccordionPanelVisible } from './accordionScroll';

export const EducationSection = memo(function EducationSection({ idPrefix }: { idPrefix?: string }) {
  const uid = idPrefix || 'education';
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({});

  return (
    <>
      {EDUCATION.map((edu, idx) => {
        const panelId = `edu-body-${uid}-${idx}`;
        const isOpen = Boolean(openItems[idx]);

        return (
        <TiltedCardWrapper className="cp-card-exp" key={idx} maxTilt={4}>
          <button
            className={`cp-exp-header cp-accordion-trigger${isOpen ? ' is-open' : ''}`}
            type="button"
            aria-expanded={isOpen}
            aria-controls={panelId}
            aria-label={`${edu.degree} in ${edu.field} at ${edu.institution}, ${edu.period}. Toggle details and coursework.`}
            onClick={() => {
              const nextOpen = !openItems[idx];
              setOpenItems((prev) => ({ ...prev, [idx]: nextOpen }));
              if (nextOpen) keepAccordionPanelVisible(panelId);
            }}
          >
            <div>
              <h2 className="cp-exp-co">{edu.institution}</h2>
              <div className="cp-exp-meta">
                <span className="cp-exp-role-tag">{edu.degree} in {edu.field}</span>
                <span className="cp-exp-tenure">{edu.period}</span>
              </div>
            </div>
            <div className="cp-exp-chevron" aria-hidden="true">+</div>
          </button>
          <div
            className={`cp-exp-body${isOpen ? ' is-open' : ''}`}
            id={panelId}
            role="region"
            aria-hidden={!isOpen}
            inert={!isOpen || undefined}
            aria-label={`${edu.institution} academic details`}
          >
            <div className="cp-exp-body-inner">
              {edu.location && (
                <div className="cp-edu-location">
                  <div className="cp-exp-col-label cp-edu-location-label">Location:</div>
                  <span className="cp-exp-tenure cp-edu-location-value">{edu.location}</span>
                </div>
              )}
              {edu.details && edu.details.length > 0 && (
                <div>
                  <div className="cp-exp-col-label">Highlights & Coursework</div>
                  <ul className="cp-exp-bullets">
                    {edu.details.map((detail, dIdx) => (
                      <li key={dIdx}>{detail}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </TiltedCardWrapper>
        );
      })}
    </>
  );
});
