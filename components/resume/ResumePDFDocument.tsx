import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

type ResumeContent = {
  fullName: string;
  contactLine: string;
  summary: string;
  workExperience: {
    companyName: string;
    jobTitle: string;
    startDate: string;
    endDate: string;
    bullets: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    year: string;
  } | null;
  skills: string[];
  certifications: string[];
};

const ACCENT = "#7c5cfc";
const TEXT_PRIMARY = "#101828";
const TEXT_SECONDARY = "#6a7282";
const BORDER = "#e7eaf3";

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 50,
    paddingTop: 42,
    paddingBottom: 36,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.4,
    color: TEXT_PRIMARY,
  },
  header: {
    marginBottom: 4,
    textAlign: "center",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    color: TEXT_PRIMARY,
    marginBottom: 5,
  },
  contactLine: {
    fontSize: 9,
    color: TEXT_SECONDARY,
    lineHeight: 1.4,
  },
  divider: {
    height: 1.5,
    backgroundColor: ACCENT,
    marginVertical: 12,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 7,
    color: ACCENT,
  },
  sectionDivider: {
    height: 0.5,
    backgroundColor: BORDER,
    marginBottom: 7,
  },
  summary: {
    fontSize: 10,
    lineHeight: 1.5,
    color: TEXT_PRIMARY,
  },
  experienceItem: {
    marginBottom: 10,
  },
  experienceHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 3,
  },
  jobTitle: {
    fontSize: 11,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    color: TEXT_PRIMARY,
  },
  companyLine: {
    fontSize: 9.5,
    color: TEXT_SECONDARY,
    marginTop: 1,
  },
  dateRange: {
    fontSize: 9,
    color: TEXT_SECONDARY,
    flexShrink: 0,
  },
  bullet: {
    fontSize: 9.5,
    lineHeight: 1.45,
    marginLeft: 12,
    marginBottom: 2,
    color: TEXT_PRIMARY,
  },
  bulletDot: {
    fontSize: 9.5,
    lineHeight: 1.45,
    color: TEXT_PRIMARY,
    width: 8,
    position: "absolute",
    left: 0,
  },
  bulletWrapper: {
    flexDirection: "row",
    marginBottom: 2,
  },
  educationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 2,
  },
  educationDegree: {
    fontSize: 10,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    color: TEXT_PRIMARY,
  },
  educationInstitution: {
    fontSize: 9.5,
    color: TEXT_SECONDARY,
    marginTop: 1,
  },
  skillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  skillChip: {
    backgroundColor: "#faf5ff",
    borderWidth: 0.5,
    borderColor: ACCENT,
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 8.5,
    color: ACCENT,
  },
  certItem: {
    fontSize: 9.5,
    color: TEXT_PRIMARY,
    marginLeft: 12,
    marginBottom: 2,
    lineHeight: 1.4,
  },
});

function ResumePDFDocument({ content }: { content: ResumeContent }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{content.fullName}</Text>
          {content.contactLine ? (
            <Text style={styles.contactLine}>{content.contactLine}</Text>
          ) : null}
        </View>

        <View style={styles.divider} />

        {content.summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <View style={styles.sectionDivider} />
            <Text style={styles.summary}>{content.summary}</Text>
          </View>
        ) : null}

        {content.workExperience.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            <View style={styles.sectionDivider} />
            {content.workExperience.map((exp, i) => (
              <View key={i} style={styles.experienceItem}>
                <View style={styles.experienceHeaderRow}>
                  <View style={{ flexShrink: 1 }}>
                    <Text style={styles.jobTitle}>{exp.jobTitle}</Text>
                    <Text style={styles.companyLine}>{exp.companyName}</Text>
                  </View>
                  <Text style={styles.dateRange}>
                    {exp.startDate} – {exp.endDate}
                  </Text>
                </View>
                {exp.bullets.map((bullet, j) => (
                  <View key={j} style={styles.bulletWrapper}>
                    <Text style={styles.bullet}>&#8226;  {bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {content.education ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            <View style={styles.sectionDivider} />
            <View style={styles.educationRow}>
              <View style={{ flexShrink: 1 }}>
                <Text style={styles.educationDegree}>
                  {content.education.degree}
                </Text>
                <Text style={styles.educationInstitution}>
                  {content.education.institution}
                </Text>
              </View>
              <Text style={styles.dateRange}>{content.education.year}</Text>
            </View>
          </View>
        ) : null}

        {content.skills.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.sectionDivider} />
            <View style={styles.skillsGrid}>
              {content.skills.map((skill, i) => (
                <Text key={i} style={styles.skillChip}>
                  {skill}
                </Text>
              ))}
            </View>
          </View>
        ) : null}

        {content.certifications.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            <View style={styles.sectionDivider} />
            {content.certifications.map((cert, i) => (
              <Text key={i} style={styles.certItem}>
                &#8226;  {cert}
              </Text>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

export { ResumePDFDocument };
export type { ResumeContent };
