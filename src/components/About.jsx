import Chapter from './Chapter'

const stats = [
  { value: '16+', label: 'Projects' },
  { value: '2', label: 'Internships' },
  { value: '9+', label: 'Certifications' },
  { value: '2025', label: 'B.Tech Graduate' },
]

const education = [
  {
    degree: 'B.Tech in Computer Science & Engineering',
    school: 'Manipal University Jaipur',
    date: 'Oct 2021 – Jul 2025 · Jaipur, Rajasthan',
  },
  {
    degree: 'Senior Secondary (12th) — 92.75%',
    school: 'Academic World School',
    date: 'Mar 2020 – Jul 2021 · Bemetara, Chhattisgarh',
  },
]

export default function About() {
  return (
    <Chapter
      id="about"
      numeral="Chapter I"
      title="About"
      subtitle="The engineer behind the work"
    >
      <div className="about-grid">
        <div>
          <p className="about-lede" data-reveal>
            I build <span className="gold">intelligent systems</span> — from agentic
            AI workflows to data pipelines that move at production scale.
          </p>
          <p className="about-body" data-reveal>
            Computer Science graduate from Manipal University Jaipur, focused on
            Artificial Intelligence, Data Science, and Generative AI. From contract
            intelligence on Databricks to autonomous SAP workflows on AWS, I turn
            complex problems into clean, automated solutions. Co-founded a gamified
            ed-tech startup; won top honors at The Startup Mela 2.0, Jaipur.
          </p>

          <div className="stats-row" data-reveal>
            {stats.map((s) => (
              <div className="stat" key={s.label}>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="edu-list">
          {education.map((edu) => (
            <div className="edu-item" key={edu.degree} data-reveal>
              <h4>{edu.degree}</h4>
              <div className="edu-school">{edu.school}</div>
              <div className="edu-date">{edu.date}</div>
            </div>
          ))}
        </div>
      </div>
    </Chapter>
  )
}
