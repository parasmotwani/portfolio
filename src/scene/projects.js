// The projects, in one place. Room IV draws these on its board and the DOM
// section lists the same six for screen readers, search and the static
// track — they used to be two separate arrays that had already drifted.
export const PROJECTS = [
  {
    title: 'Contract Intelligence System',
    description: 'Databricks contract intelligence platform. Large-scale document ingestion across 13 waves at 200 to 500 contracts each, with toggle-driven notebooks persisting to Delta tables across 3+ pipeline stages.',
    tech: ['Python', 'Databricks', 'LLMs', 'Delta Lake'],
    github: 'https://github.com/parasmotwani',
  },
  {
    title: 'Automated SAP Invoice Validation',
    description: 'End-to-end autonomous browser workflow for SAP invoice validation using Amazon NovaAct, with upstream pipelines across 6 AWS services for zero-touch SAP interactions post-ingestion.',
    tech: ['Python', 'AWS', 'Textract', 'Bedrock', 'NovaAct'],
    github: 'https://github.com/parasmotwani/agentic_ai_invoice_validator',
  },
  {
    title: 'Crypto Matching Engine',
    description: 'Real-time trading pipeline handling 62K+ orders per second with optimized concurrency, and 3 modular ETL flows for ingesting, validating and streaming trade data with automated PyTest checks.',
    tech: ['Python', 'FastAPI', 'WebSocket', 'PyTest'],
    github: 'https://github.com/parasmotwani/crypto-exchange-matching-engine',
  },
  {
    title: 'Agentic AI Tutor',
    description: 'AI-powered tutoring system delivering interactive, personalized learning through agentic AI workflows.',
    tech: ['Python', 'AI Agents', 'LLMs'],
    github: 'https://github.com/parasmotwani/agentic_ai_tutor',
  },
  {
    title: 'Hybrid Recommendation System',
    description: 'Content-based and collaborative filtering combined, recommending the top ten products per user with better accuracy than either approach alone.',
    tech: ['Python', 'Scikit-learn', 'Pandas', 'ML'],
    github: 'https://github.com/parasmotwani/hybrid-recommendation-system',
  },
  {
    title: 'SkimLit: NLP Paper Classifier',
    description: 'NLP model classifying sentences in medical research abstracts, so researchers can skim literature faster.',
    tech: ['Python', 'TensorFlow', 'NLP', 'Deep Learning'],
    github: 'https://github.com/parasmotwani/Skim_Lit_NLP',
  },
]
