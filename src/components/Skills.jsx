import Chapter from './Chapter'
import Sigil from './Sigil'

const categories = [
  {
    sigil: 'tongue',
    title: 'Languages & Frameworks',
    skills: ['Python', 'SQL', 'Go', 'FastAPI'],
  },
  {
    sigil: 'lens',
    title: 'Machine Learning',
    skills: ['NumPy', 'Pandas', 'Scikit-learn', 'TensorFlow', 'Matplotlib', 'Seaborn'],
  },
  {
    sigil: 'spark',
    title: 'GenAI & Agents',
    skills: ['LLMs', 'AI Agents', 'RAG', 'Amazon Bedrock', 'Hugging Face'],
  },
  {
    sigil: 'vessel',
    title: 'Data Engineering',
    skills: ['Databricks', 'Delta Lake', 'MySQL', 'PostgreSQL', 'ETL Pipelines'],
  },
  {
    sigil: 'tower',
    title: 'Cloud & DevOps',
    skills: ['AWS', 'Docker', 'Git', 'Jenkins', 'Vercel'],
  },
]

export default function Skills() {
  return (
    <Chapter
      id="skills"
      numeral="Chapter II"
      title="Skills & Tools"
      subtitle="Five disciplines, practiced daily"
    >
      <div className="grimoire-rows">
        {categories.map((cat) => (
          <div className="spell-row" key={cat.title} data-reveal data-hover>
            <Sigil name={cat.sigil} />
            <h3>{cat.title}</h3>
            <div className="spell-tags">
              {cat.skills.map((skill) => (
                <span key={skill} className="spell-tag">{skill}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Chapter>
  )
}
