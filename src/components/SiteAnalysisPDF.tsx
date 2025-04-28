import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register fonts - using a web-safe font to avoid loading issues
Font.register({
  family: 'Helvetica',
  fonts: [
    {
      src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica@1.0.4/Helvetica.ttf',
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica@1.0.4/Helvetica-Bold.ttf',
      fontWeight: 'bold',
    }
  ]
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica'
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold'
  },
  section: {
    marginBottom: 10,
    width: '100%'
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingBottom: 4
  },
  subsectionTitle: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: 'bold'
  },
  paragraph: {
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 1.4
  },
  imageContainer: {
    marginVertical: 10,
    width: '100%'
  },
  image: {
    width: '100%',
    height: 200
  },
  imageCaption: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 10,
    textAlign: 'center'
  }
});

interface SiteAnalysisPDFProps {
  analysis: string;
  images: {
    siteContext: string | null;
    environmental: string | null;
    designRecommendation: string | null;
  };
}

const SiteAnalysisPDF: React.FC<SiteAnalysisPDFProps> = ({ analysis, images }) => {
  // Debug log
  console.log('Rendering PDF with analysis:', analysis?.substring(0, 100));
  console.log('Images:', images);

  const sections = analysis?.split('\n\n') || [];
  const currentDate = new Date().toLocaleDateString();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cover Page */}
        <View style={styles.section}>
          <Text style={styles.header}>Site Analysis Report</Text>
          <Text style={styles.paragraph}>Generated on {currentDate}</Text>
        </View>

        {/* Content */}
        {sections.map((paragraph, index) => {
          // Debug log
          console.log(`Processing section ${index}:`, paragraph?.substring(0, 50));

          const isNumberedSection = /^\d+\.\s+[A-Z]/.test(paragraph);
          const isSubsection = paragraph.startsWith('•') || /^[A-Z][a-z]+:/.test(paragraph);
          const sectionNumber = isNumberedSection ? parseInt(paragraph.split('.')[0]) : null;

          return (
            <View key={index} wrap={false} style={styles.section}>
              {isNumberedSection ? (
                <View>
                  <Text style={styles.sectionTitle}>{paragraph}</Text>
                  {/* Images */}
                  {sectionNumber === 2 && images?.siteContext && (
                    <View style={styles.imageContainer}>
                      <Image src={images.siteContext} style={styles.image} />
                      <Text style={styles.imageCaption}>Site Context Analysis</Text>
                    </View>
                  )}
                  {sectionNumber === 4 && images?.environmental && (
                    <View style={styles.imageContainer}>
                      <Image src={images.environmental} style={styles.image} />
                      <Text style={styles.imageCaption}>Environmental Analysis</Text>
                    </View>
                  )}
                  {sectionNumber === 8 && images?.designRecommendation && (
                    <View style={styles.imageContainer}>
                      <Image src={images.designRecommendation} style={styles.image} />
                      <Text style={styles.imageCaption}>Design Recommendations</Text>
                    </View>
                  )}
                </View>
              ) : isSubsection ? (
                <Text style={styles.subsectionTitle}>
                  {paragraph.replace(/^[•]\s+/, '')}
                </Text>
              ) : (
                <Text style={styles.paragraph}>{paragraph}</Text>
              )}
            </View>
          );
        })}

        {/* Footer */}
        <Text style={styles.footer} fixed>
          Studio Six Site Analysis Report • Page 1
        </Text>
      </Page>
    </Document>
  );
};

export default SiteAnalysisPDF; 