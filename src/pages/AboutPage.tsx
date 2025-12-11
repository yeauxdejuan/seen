import { useState } from 'react';
import { Card } from '../components/Card';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Is my identity protected?",
    answer: "In this prototype, all data is stored locally in your browser. In a production version, we would implement industry-leading security measures including end-to-end encryption, anonymization protocols, and strict access controls. You would have full control over what information you share, and personally identifying details would be separated from incident data in our systems."
  },
  {
    question: "Can I use this as legal evidence?",
    answer: "This is a prototype application for demonstration purposes and should not be used for legal proceedings. In a production version, while the platform could help you document your experience, it would not replace official legal documentation or reporting channels. We would recommend consulting with legal professionals for advice specific to your situation."
  },
  {
    question: "How will this data be used in the future?",
    answer: "The vision for this platform is to aggregate anonymized data to reveal patterns of discrimination and bias. This information could be used by community advocates, researchers, policymakers, and organizations working toward systemic change. Individual reports would remain confidential, while aggregate statistics would help demonstrate the scope and nature of discrimination in various contexts."
  },
  {
    question: "Who can see my report?",
    answer: "In this prototype, reports are stored only on your device. In a production version, your individual report would be visible only to you and authorized platform administrators (with strict privacy protocols). Aggregated, anonymized data would be made available publicly to show patterns, but no individual stories would be shared without explicit consent."
  },
  {
    question: "Can I delete my report?",
    answer: "In this prototype, you can clear your browser's local storage to remove reports. A production version would give you full control to edit or delete your reports at any time. We believe you should always have ownership of your data and your story."
  },
  {
    question: "What if I'm not comfortable sharing certain details?",
    answer: "You're always in control. All demographic information is optional, and you can mark details as private. The platform is designed to be flexible—share what feels safe and important to you. Even partial information contributes to understanding patterns of discrimination."
  },
  {
    question: "How do you prevent misuse of the platform?",
    answer: "A production version would implement multiple safeguards including verification processes, content moderation, and abuse prevention systems. We would work with community partners and experts to ensure the platform serves its intended purpose of documenting genuine experiences while preventing bad actors from undermining its mission."
  },
  {
    question: "Is this platform affiliated with any organization?",
    answer: "This is an independent prototype created for demonstration purposes. A production version would ideally be operated by or in partnership with established civil rights organizations, community advocacy groups, and privacy experts to ensure credibility, security, and meaningful impact."
  }
];

export function AboutPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            About Seen
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            A safe space for documenting experiences of racial discrimination and bias
          </p>
        </div>

        {/* Mission */}
        <Card padding="lg" className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Our Mission
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              Seen exists to validate and amplify the experiences of those who face racial 
              discrimination and bias. We believe that every story matters, and that by 
              documenting these experiences, we can:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Validate individual experiences through collective data</li>
              <li>Make patterns of discrimination visible to communities and advocates</li>
              <li>Provide evidence for policy discussions and systemic change</li>
              <li>Create a historical record of discrimination in our time</li>
              <li>Connect people with resources and support</li>
            </ul>
            <p>
              Your story deserves to be heard. By sharing your experience, you contribute 
              to a larger understanding of how discrimination manifests in our society and 
              help create pathways toward justice and equity.
            </p>
          </div>
        </Card>

        {/* Privacy & Safety */}
        <Card padding="lg" className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Privacy & Safety Commitments
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p className="font-medium text-gray-900 dark:text-white">
              In a production version of this platform, we would commit to:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-black dark:text-white mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    End-to-End Encryption
                  </h3>
                  <p className="text-sm">
                    Your data would be encrypted in transit and at rest
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <svg className="w-6 h-6 text-black dark:text-white mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Data Anonymization
                  </h3>
                  <p className="text-sm">
                    Personal identifiers separated from incident data
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <svg className="w-6 h-6 text-black dark:text-white mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    User Control
                  </h3>
                  <p className="text-sm">
                    Full control over your data, including deletion rights
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <svg className="w-6 h-6 text-black dark:text-white mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Transparent Practices
                  </h3>
                  <p className="text-sm">
                    Clear communication about data usage and access
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <svg className="w-6 h-6 text-black dark:text-white mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    No Data Selling
                  </h3>
                  <p className="text-sm">
                    Your information would never be sold to third parties
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <svg className="w-6 h-6 text-black dark:text-white mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Regular Security Audits
                  </h3>
                  <p className="text-sm">
                    Independent security assessments and updates
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* FAQ */}
        <Card padding="lg" className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item, index) => (
              <div
                key={index}
                className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 pb-4 last:pb-0"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-start text-left"
                >
                  <span className="font-medium text-gray-900 dark:text-white pr-4">
                    {item.question}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                      openFAQ === index ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openFAQ === index && (
                  <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">
                    {item.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Important Notice */}
        <Card padding="lg" className="bg-gray-100 dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-black dark:text-white mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                Important: This is a Prototype
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                This application is a conceptual prototype created for demonstration purposes. 
                It is not a production system and should not be used to report actual incidents 
                that require official documentation or legal action.
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                All data in this prototype is stored locally in your browser and is not transmitted 
                to any servers. A production version would require significant additional work in 
                security, privacy, legal compliance, and partnership with established civil rights 
                organizations.
              </p>
            </div>
          </div>
        </Card>

        {/* Developer Info */}
        <Card padding="lg" className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Application Developer
          </h2>
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-black dark:bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-white dark:text-black">DE</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Dejuan Ellsworth
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                Developer & Social Impact Advocate
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                This application was developed as a conceptual prototype to demonstrate how technology
                can be used to document and address racial discrimination. The goal is to show how
                data-driven approaches can support communities, inform policy, and drive meaningful change.
              </p>
            </div>
          </div>
        </Card>

        {/* Resources */}
        <Card padding="lg">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Support Resources
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            If you've experienced discrimination or bias, these organizations may be able to help:
          </p>
          <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              <svg className="w-5 h-5 text-black dark:text-white mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
              </svg>
              <span>
                <strong>NAACP:</strong> National Association for the Advancement of Colored People
              </span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-black dark:text-white mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
              </svg>
              <span>
                <strong>ACLU:</strong> American Civil Liberties Union
              </span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-black dark:text-white mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
              </svg>
              <span>
                <strong>EEOC:</strong> U.S. Equal Employment Opportunity Commission (for workplace discrimination)
              </span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-black dark:text-white mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
              </svg>
              <span>
                <strong>Local civil rights organizations:</strong> Many cities have local advocacy groups
              </span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

// Made with Bob
