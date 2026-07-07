import Chapter from './Chapter'
import Sigil from './Sigil'

const schools = [
  {
    sigil: 'tongue',
    title: 'Tongues & Frameworks',
    school: 'the spoken forms',
    skills: ['Python', 'SQL', 'Go', 'FastAPI'],
  },
  {
    sigil: 'lens',
    title: 'Machine Learning',
    school: 'the seeing lens',
    skills: ['NumPy', 'Pandas', 'Scikit-learn', 'TensorFlow', 'Matplotlib', 'Seaborn'],
  },
  {
    sigil: 'spark',
    title: 'Generative Arts',
    school: 'the summoned minds',
    skills: ['LLMs', 'AI Agents', 'RAG', 'Amazon Bedrock', 'Hugging Face'],
  },
  {
    sigil: 'vessel',
    title: 'Data Alchemy',
    school: 'the great work',
    skills: ['Databricks', 'Delta Lake', 'MySQL', 'PostgreSQL', 'ETL Pipelines'],
  },
  {
    sigil: 'tower',
    title: 'Cloud & Keep',
    school: 'the high towers',
    skills: ['AWS', 'Docker', 'Git', 'Jenkins', 'Vercel'],
  },
]

export default function Skills() {
  return (
    <Chapter
      id="skills"
      numeral="Chapter II"
      title="The Grimoire"
      subtitle="Five schools of practice, mastered by study"
    >
      <div className="grimoire-rows">
        {schools.map((cat) => (
          <div className="spell-row" key={cat.title} data-reveal data-hover>
            <Sigil name={cat.sigil} />
            <h3>
              {cat.title}
              <span className="school">{cat.school}</span>
            </h3>
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
