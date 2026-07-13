import { memo, useState } from 'react';
import { CAREER } from '../../data/resumeData';
import { TiltedCardWrapper } from '../ui/TiltedCardWrapper';
import { keepAccordionPanelVisible } from './accordionScroll';

interface ExperienceSectionProps {
  idPrefix?: string;
  roleIndex?: number;
}

export const ExperienceSection = memo(function ExperienceSection({ idPrefix, roleIndex }: ExperienceSectionProps) {
  const uid = idPrefix || 'career';
  const [openItems, setOpenItems] = useState<Record<number, boolean>>(
    roleIndex === undefined ? {} : { [roleIndex]: true },
  );
  const visibleRoles = roleIndex === undefined
    ? CAREER.map((role, index) => ({ role, index }))
    : CAREER[roleIndex]
      ? [{ role: CAREER[roleIndex], index: roleIndex }]
      : [];

  return (
    <>
      {visibleRoles.map(({ role, index: idx }) => {
        const panelId = `exp-body-${uid}-${idx}`;
        const isOpen = Boolean(openItems[idx]);

        return (
        <TiltedCardWrapper className="cp-card-exp" key={idx} maxTilt={4}>
          <button
            className={`cp-exp-header cp-accordion-trigger${isOpen ? ' is-open' : ''}`}
            type="button"
            aria-expanded={isOpen}
            aria-controls={panelId}
            data-career-index={idx}
            aria-label={`${role.title} at ${role.company}, ${role.period}. Toggle highlights and metrics.`}
            onClick={() => {
              const nextOpen = !openItems[idx];
              setOpenItems((prev) => ({ ...prev, [idx]: nextOpen }));
              if (nextOpen) keepAccordionPanelVisible(panelId);
            }}
          >
            <div>
              <div className="cp-exp-co">{role.company}</div>
              <div className="cp-exp-meta">
                <span className="cp-exp-role-tag">{role.title}</span>
                <span className="cp-exp-tenure">{role.period}</span>
              </div>
            </div>
            <div className="cp-exp-chevron" aria-hidden="true">+</div>
          </button>
          <div
            className={`cp-exp-body${isOpen ? ' is-open' : ''}`}
            id={panelId}
            role="region"
            aria-label={`${role.company} role details`}
          >
            <div className="cp-exp-body-inner">
              <div>
                <div className="cp-exp-col-label">Impact Metrics</div>
                <div className="cp-exp-metrics-grid">
                  {role.impactMetrics.map((m, mIdx) => (
                    <TiltedCardWrapper className="cp-exp-metric" key={mIdx} maxTilt={8}>
                      <span className="cp-em-val">{m.value}</span>
                      <span className="cp-em-label">{m.label}</span>
                    </TiltedCardWrapper>
                  ))}
                </div>
              </div>
              <div>
                <div className="cp-exp-col-label">Highlights</div>
                <ul className="cp-exp-bullets">
                  {role.achievements.slice(0, 4).map((a, aIdx) => (
                    <li key={aIdx}>{a}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </TiltedCardWrapper>
        );
      })}
    </>
  );
});
