import { normalizeCourseCode } from "@/prereq checker/logic";
import { Course, CourseData, CoursePrereq, JoinType, PrereqGroup, PrereqGroupWithCredits, PrereqItem } from "@/types";

export default function CourseData({ courseData, studentCourses }: { courseData: CourseData, studentCourses?: Course[] }) {

  const renderPrereqItem = (item: PrereqItem, depth: number = 0): JSX.Element => {
    if (!item) return <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>None</span>;

    if (item.type === JoinType.COURSE) {
      const courseItem = item as CoursePrereq;
      return (
        <div
          style={{
            marginLeft: `${depth * 1.5}em`,
            marginTop: depth > 0 ? '0.5em' : '0',
            paddingLeft: depth > 0 ? '1em' : '0',
            borderLeft: depth > 0 ? '3px solid #e2e8f0' : 'none',
          }}
        >
          <span
            style={{
              padding: '0.25em 0.6em',
              background: `${studentCourses && studentCourses.some(c => normalizeCourseCode(c.code) === normalizeCourseCode(courseItem.name)) ? '#d1fae5' : '#eef2ff'}`,
              border: `2px solid ${studentCourses && studentCourses.some(c => normalizeCourseCode(c.code) === normalizeCourseCode(courseItem.name)) ? '#34d399' : '#dbeafe'}`,
              borderRadius: '6px',
              fontSize: '0.9em',
              fontWeight: 500,
              color: '#1e293b',
              display: 'inline-block',
            }}
          >
            {courseItem.name}
            {courseItem.minGrade > 0 && (
              <span style={{ color: '#64748b', marginLeft: '0.5em' }}>
                ({courseItem.minGrade}%+)
              </span>
            )}
          </span>
        </div>
      );
    }

    const group = item as PrereqGroup | PrereqGroupWithCredits;
    return (
      <div
        style={{
          marginLeft: `${depth * 1.5}em`,
          marginTop: depth > 0 ? '0.5em' : '0',
          paddingLeft: depth > 0 ? '1em' : '0',
          borderLeft: depth > 0 ? '3px solid #e2e8f0' : 'none',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '0.25em 0.5em',
            background: 'white',
            border: '2px solid #3b82f6',
            borderRadius: '6px',
            color: '#3b82f6',
            fontWeight: 600,
            fontSize: '0.85em',
            marginBottom: '0.5em',
          }}
        >
          {group.type}
          {'credits' in group && group.credits !== undefined && (
            <span style={{ marginLeft: '0.5em', color: '#64748b', fontWeight: 500 }}>
              ({group.credits} credits)
            </span>
          )}
        </div>

        {group.requirements.map((req, idx) => (
          <div key={idx}>
            {idx > 0 && (
              <div
                style={{
                  marginLeft: `${(depth + 1) * 1.5}em`,
                  color: '#3b82f6',
                  fontWeight: 600,
                  fontSize: '0.8em',
                  margin: '0.25em 0',
                }}
              >
                {group.type}
              </div>
            )}
            {renderPrereqItem(req, depth + 1)}
          </div>
        ))}
      </div>
    );
  };

  return (

    <div className="expanded-content">
      <h4
        style={{
          margin: '0 0 1em 0',
          color: '#475569',
          fontSize: '1.1em',
          fontWeight: 600,
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: '0.5em',
        }}
      >
        Prerequisites
      </h4>

      <div style={{ paddingLeft: '0.5em', marginBottom: '1.5em' }}>
        {courseData.prereqs ? (
          renderPrereqItem(courseData.prereqs)
        ) : (
          <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
            No prerequisites defined
          </span>
        )}
      </div>

      <h4
        style={{
          margin: '0 0 1em 0',
          color: '#475569',
          fontSize: '1.1em',
          fontWeight: 600,
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: '0.5em',
        }}
      >
        Antirequisites
      </h4>

      <div style={{ paddingLeft: '0.5em' }}>
        {courseData.antireqs.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5em' }}>
            {courseData.antireqs.map((antireq) => (
                <span key={antireq} style={{
                display: 'inline-block',
                padding: '0.3em 0.6em',
                background: `${studentCourses && studentCourses.some(course => normalizeCourseCode(course.code) === normalizeCourseCode(antireq)) ? '#dc2626' : '#fee2e2'}`,
                border: '2px solid #ef4444',
                borderRadius: '6px',
                color: '#7f1d1d',
                fontSize: '0.85em',
                fontWeight: 500,
                }}>
                {antireq}
                </span>
            ))}
          </div>
        ) : (
          <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
            No antirequisites defined
          </span>
        )}
      </div>
    </div>
  )
}