const n = {
  paths: {
    workflowPaths: ['/workflow-automation', '/guides/workflow-automation'],
    lowCodePaths: [
      '/low-code',
      '/guides/low-code',
      '/guides/document-converter',
      '/guides/document-editor',
      '/guides/document-searchability',
      '/guides/document-automation-server/',
    ],
  },
  workflow: {
    modalDisclaimer:
      'This is a custom LLM for Nutrient with access to product information, the help center, as well as other resources. For best results please mention the product name when asking technical questions.',
    exampleQuestions:
      'What types of Workflow templates are available?,How to create a Workflow Form?',
  },
  lowCode: {
    modalDisclaimer:
      'This is a custom LLM for Nutrient with access to product information, the help center, as well as other resources. For best results please mention the product name when asking technical questions.',
    exampleQuestions:
      'Convert Documents to PDF with Power Automate?, How to secure Documents using Power Automate?',
  },
  default: {
    modalDisclaimer:
      'This is a custom LLM for Nutrient with access to product information, [guides]((https://www.nutrient.io/sdk/developers)), API reference as well as other resources. For best results please mention the product name when asking technical questions.',
    exampleQuestions:
      'How do I get started with the Web SDK?,What AI features does Nutrient offer?',
  },
};
function u() {
  const a = window.location.pathname,
    t = Object.entries(n.paths).find(([o, r]) => r.some((i) => a.startsWith(i))),
    e = t ? t[0].replace('Paths', '') : 'default';
  return e === 'workflow' ? n.workflow : e === 'lowCode' ? n.lowCode : n.default;
}
function d() {
  const a = u(),
    t = document.createElement('script');
  (t.async = !0),
    (t.src = 'https://widget.kapa.ai/kapa-widget.bundle.js'),
    t.setAttribute('data-website-id', 'ec76a086-c5ce-409a-91bb-bee358fdb208'),
    t.setAttribute('data-project-color', '#1A1414'),
    t.setAttribute('data-text-color', '#1A1414'),
    t.setAttribute('data-modal-override-open-id', 'nutrient-sdk-docs-ai'),
    t.setAttribute('data-button-hide', 'false'),
    t.setAttribute('data-modal-open-by-default', 'true'),
    t.setAttribute('data-user-analytics-fingerprint-enabled', 'true'),
    t.setAttribute('data-project-name', 'Nutrient'),
    t.setAttribute('data-modal-title', 'Nutrient AI'),
    t.setAttribute('data-modal-disclaimer', a.modalDisclaimer),
    t.setAttribute('data-modal-example-questions', a.exampleQuestions),
    t.setAttribute('data-modal-disclaimer-bg-color', '#EFEBE7'),
    t.setAttribute('data-modal-disclaimer-text-color', '#67594B'),
    t.setAttribute('data-modal-disclaimer-font-size', '14px'),
    t.setAttribute('data-modal-disclaimer-padding', '0.875rem'),
    t.setAttribute('data-query-input-font-size', '1rem'),
    t.setAttribute('data-query-input-text-color', '#1A1414'),
    t.setAttribute('data-query-input-placeholder-text-color', '#67594B'),
    t.setAttribute('data-query-input-border-color', '#1A1414'),
    t.setAttribute('data-query-input-focus-border-color', '#DE9DCC'),
    t.setAttribute('data-submit-query-button-bg-color', '#1A1414'),
    t.setAttribute('data-example-question-button-height', '40px'),
    t.setAttribute('data-example-question-button-padding-x', '1.5rem'),
    t.setAttribute('data-example-question-button-padding-y', '0.75rem'),
    t.setAttribute('data-example-question-button-border', '1px solid #C2B8AE !important'),
    t.setAttribute('data-example-question-button-border-radius', '8px'),
    t.setAttribute('data-example-question-button-text-color', '#1A1414'),
    t.setAttribute('data-example-question-button-box-shadow', 'none'),
    t.setAttribute('data-example-question-button-font-size', '0.875rem'),
    t.setAttribute('data-example-question-button-hover-bg-color', '#EFEBE7'),
    t.setAttribute('data-modal-z-index', '999999'),
    t.setAttribute('data-modal-border-radius', '1.5rem'),
    t.setAttribute('data-modal-header-bg-color', '#DE9DCC'),
    t.setAttribute('data-modal-header-border-bottom', 'none'),
    t.setAttribute('data-modal-header-padding', '1.5rem'),
    t.setAttribute('data-modal-title-font-weight', '400'),
    t.setAttribute('data-modal-title-font-size', '1.5rem'),
    t.setAttribute('data-modal-title-color', '#1A1414'),
    t.setAttribute('data-button-text', 'ASK AI'),
    t.setAttribute('data-button-height', '5rem'),
    t.setAttribute('data-button-width', '5rem'),
    t.setAttribute('data-button-bg-color', '#1A1414'),
    t.setAttribute('data-button-border-radius', '1rem'),
    t.setAttribute('data-button-text-shadow', 'none'),
    t.setAttribute('data-button-text-font-weight', '400'),
    t.setAttribute('data-button-text-font-size', '0.75rem'),
    t.setAttribute('data-button-image-height', '1.5rem'),
    t.setAttribute('data-button-image-width', '1.5rem'),
    t.setAttribute('data-thread-clear-button-height', '40px'),
    t.setAttribute('data-thread-clear-button-padding-x', '16px'),
    t.setAttribute('data-thread-clear-button-padding-y', '8px'),
    t.setAttribute('data-thread-clear-button-border', 'none'),
    t.setAttribute('data-thread-clear-button-border-radius', '8px'),
    t.setAttribute('data-thread-clear-button-bg-color', '#EFEBE7'),
    t.setAttribute('data-thread-clear-button-hover-bg-color', '#E2DBD9'),
    t.setAttribute('data-thread-clear-button-text-color', '#1A1414'),
    t.setAttribute('data-thread-clear-button-font-size', '12px'),
    t.setAttribute('data-thread-clear-button-icon-size', '24px'),
    t.setAttribute('data-thread-clear-button-box-shadow', 'none'),
    t.setAttribute('data-answer-feedback-button-height', '40px'),
    t.setAttribute('data-answer-feedback-button-padding-x', '16px'),
    t.setAttribute('data-answer-feedback-button-padding-y', '8px'),
    t.setAttribute('data-answer-feedback-button-border', 'none'),
    t.setAttribute('data-answer-feedback-button-border-radius', '8px'),
    t.setAttribute('data-answer-feedback-button-bg-color', '#EFEBE7'),
    t.setAttribute('data-answer-feedback-button-hover-bg-color', '#E2DBD9'),
    t.setAttribute('data-answer-feedback-button-text-color', '#1A1414'),
    t.setAttribute('data-answer-feedback-button-font-size', '12px'),
    t.setAttribute('data-answer-feedback-button-icon-size', '24px'),
    t.setAttribute('data-answer-feedback-button-box-shadow', 'none'),
    t.setAttribute('data-answer-copy-button-height', '40px'),
    t.setAttribute('data-answer-copy-button-padding-x', '16px'),
    t.setAttribute('data-answer-copy-button-padding-y', '8px'),
    t.setAttribute('data-answer-copy-button-border', 'none'),
    t.setAttribute('data-answer-copy-button-border-radius', '8px'),
    t.setAttribute('data-answer-copy-button-bg-color', '#EFEBE7'),
    t.setAttribute('data-answer-copy-button-hover-bg-color', '#E2DBD9'),
    t.setAttribute('data-answer-copy-button-text-color', '#1A1414'),
    t.setAttribute('data-answer-copy-button-font-size', '12px'),
    t.setAttribute('data-answer-copy-button-icon-size', '24px'),
    t.setAttribute('data-answer-copy-button-box-shadow', 'none'),
    t.setAttribute('data-answer-cta-button-height', '40px'),
    t.setAttribute('data-answer-cta-button-padding-x', '16px'),
    t.setAttribute('data-answer-cta-button-padding-y', '8px'),
    t.setAttribute('data-answer-cta-button-border', 'none'),
    t.setAttribute('data-answer-cta-button-border-radius', '8px'),
    t.setAttribute('data-answer-cta-button-bg-color', '#EFEBE7'),
    t.setAttribute('data-answer-cta-button-hover-bg-color', '#E2DBD9'),
    t.setAttribute('data-answer-cta-button-text-color', '#1A1414'),
    t.setAttribute('data-answer-cta-button-font-size', '12px'),
    t.setAttribute('data-answer-cta-button-icon-size', '24px'),
    t.setAttribute('data-answer-copy-button-box-shadow', 'none'),
    t.setAttribute(
      'data-modal-image',
      'https://www.nutrient.io/assets/images/icons/products/nutrient-ai.svg'
    ),
    t.setAttribute(
      'data-project-logo',
      'https://www.nutrient.io/assets/images/icons/products/nutrient-ai.svg'
    ),
    (t.onload = () => {
      const e = document.getElementById('kapa-lazy-button');
      if (e) {
        const o = e,
          r = o._kapaClickHandler;
        r && (e.removeEventListener('click', r), delete o._kapaClickHandler),
          (e.style.display = 'none');
      }
    }),
    (t.onerror = () => {
      console.error('Failed to load Kapa script');
      const e = document.getElementById('kapa-button-icon'),
        o = document.getElementById('kapa-button-text');
      e && e.classList.remove('animate-spin'), o && (o.textContent = 'ASK AI');
      const r = document.getElementById('kapa-lazy-button');
      r &&
        (r.setAttribute('aria-busy', 'false'),
        r.setAttribute('aria-label', 'Ask AI - Click to load chat widget'));
    }),
    document.body.appendChild(t);
}
function s() {
  const a = document.getElementById('kapa-lazy-button');
  if (!a) return;
  const t = () => {
    const e = document.getElementById('kapa-button-icon'),
      o = document.getElementById('kapa-button-text');
    e && e.classList.add('animate-spin'),
      o && (o.textContent = 'LOADING...'),
      a instanceof HTMLButtonElement &&
        ((a.disabled = !0),
        a.setAttribute('aria-busy', 'true'),
        a.setAttribute('aria-label', 'Loading AI chat widget')),
      d();
  };
  a.addEventListener('click', t), (a._kapaClickHandler = t);
}
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', s) : s();
