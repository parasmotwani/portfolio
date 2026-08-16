import Chapter from './Chapter'
import Sigil from './Sigil'
import Cobweb from './Cobweb'

const categories = [
  {
    sigil: 'tongue',
    title: 'Programming & Frameworks',
    skills: ['Python', 'SQL', 'FastAPI'],
  },
  {
    sigil: 'spark',
    title: 'AI & Agents',
    skills: ['LLM Agents', 'Model Context Protocol (MCP)', 'Claude Code', 'Codex', 'Playwright Automation'],
  },
  {
    sigil: 'lens',
    title: 'Libraries',
    skills: ['Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'requests', 'BeautifulSoup'],
  },
  {
    sigil: 'tower',
    title: 'Cloud, Identity & MLOps',
    skills: ['AWS', 'Databricks', 'Microsoft Entra ID', 'BFF Architecture', 'Docker', 'Jenkins'],
  },
  {
    sigil: 'vessel',
    title: 'Databases',
    skills: ['MySQL', 'PostgreSQL'],
  },
]

export default function Skills() {
  return (
    <Chapter
      id="skills"
      room={2}
      numeral="Room II"
      title="Skills & Tools"
      subtitle="Framed on the wall, under a decade of dust"
      className="room"
    >
      <Cobweb corner="tl" size={130} />
      <div className="grimoire-rows" data-diegetic>
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
