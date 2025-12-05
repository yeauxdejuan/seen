import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';

export function ImpactPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            The Power of Data-Driven Change
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Understanding how documented experiences of discrimination can drive meaningful change across communities, institutions, and policy
          </p>
        </div>

        {/* Introduction */}
        <Card padding="lg" className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Why Documentation Matters
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              Individual experiences of racial discrimination often go undocumented, making it difficult to 
              demonstrate patterns and advocate for systemic change. When these experiences are collected and 
              aggregated while protecting individual privacy, they become powerful evidence that can:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Validate the experiences of those who have faced discrimination</li>
              <li>Reveal patterns that might otherwise remain invisible</li>
              <li>Provide concrete data to support advocacy efforts</li>
              <li>Inform evidence-based policy decisions</li>
              <li>Hold institutions accountable for discriminatory practices</li>
            </ul>
          </div>
        </Card>

        {/* Impact Areas */}
        <div className="space-y-8 mb-12">
          {/* Communities */}
          <Card padding="lg">
            <div className="flex items-start mb-4">
              <div className="w-12 h-12 bg-black dark:bg-white rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <svg className="w-6 h-6 text-white dark:text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Impact on Communities
                </h3>
                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Validation & Solidarity</h4>
                    <p className="text-sm">
                      Seeing aggregated data helps individuals understand they're not alone in their experiences. 
                      This validation can be healing and empowering, fostering community solidarity and collective action.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Community Organizing</h4>
                    <p className="text-sm">
                      Data reveals patterns that can guide community organizing efforts, helping activists focus 
                      resources on the most pressing issues and build coalitions around shared experiences.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Resource Allocation</h4>
                    <p className="text-sm">
                      Community organizations can use data to identify where support services are most needed, 
                      from legal aid to mental health resources to educational programs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Cities & Local Government */}
          <Card padding="lg">
            <div className="flex items-start mb-4">
              <div className="w-12 h-12 bg-black dark:bg-white rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <svg className="w-6 h-6 text-white dark:text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Impact on Cities & Local Government
                </h3>
                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Policy Development</h4>
                    <p className="text-sm">
                      City officials can use aggregated data to develop targeted anti-discrimination policies, 
                      allocate funding for equity initiatives, and measure the effectiveness of existing programs.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Police & Public Safety Reform</h4>
                    <p className="text-sm">
                      Data on discriminatory policing practices can inform police reform efforts, training programs, 
                      and accountability measures to build trust between law enforcement and communities of color.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Urban Planning & Development</h4>
                    <p className="text-sm">
                      Understanding patterns of discrimination in housing, transportation, and public services can 
                      guide equitable urban planning and ensure all residents have access to opportunities.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Organizations & Institutions */}
          <Card padding="lg">
            <div className="flex items-start mb-4">
              <div className="w-12 h-12 bg-black dark:bg-white rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <svg className="w-6 h-6 text-white dark:text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                  <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Impact on Organizations & Institutions
                </h3>
                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Corporate Accountability</h4>
                    <p className="text-sm">
                      Data on workplace discrimination can pressure companies to improve diversity, equity, and 
                      inclusion initiatives, implement better reporting mechanisms, and create more equitable workplaces.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Educational Institutions</h4>
                    <p className="text-sm">
                      Schools and universities can use data to address discriminatory practices in admissions, 
                      discipline, and campus climate, creating more inclusive learning environments.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Healthcare Systems</h4>
                    <p className="text-sm">
                      Documentation of discrimination in healthcare can drive improvements in patient care, 
                      cultural competency training, and equitable access to medical services.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Law & Legal System */}
          <Card padding="lg">
            <div className="flex items-start mb-4">
              <div className="w-12 h-12 bg-black dark:bg-white rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <svg className="w-6 h-6 text-white dark:text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Impact on Law & Legal System
                </h3>
                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Pattern & Practice Evidence</h4>
                    <p className="text-sm">
                      Aggregated data can support pattern and practice lawsuits against institutions with systemic 
                      discrimination, providing statistical evidence that complements individual testimonies.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Legal Precedent</h4>
                    <p className="text-sm">
                      Documentation of discrimination can inform legal arguments, support amicus briefs, and 
                      contribute to the development of civil rights case law.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Enforcement & Compliance</h4>
                    <p className="text-sm">
                      Data helps civil rights agencies prioritize enforcement actions, monitor compliance with 
                      anti-discrimination laws, and identify areas requiring increased oversight.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Policy & Legislation */}
          <Card padding="lg">
            <div className="flex items-start mb-4">
              <div className="w-12 h-12 bg-black dark:bg-white rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <svg className="w-6 h-6 text-white dark:text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Impact on Policy & Legislation
                </h3>
                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Evidence-Based Policymaking</h4>
                    <p className="text-sm">
                      Legislators can use data to craft targeted anti-discrimination legislation, allocate funding 
                      for civil rights enforcement, and measure the impact of existing laws.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Public Awareness & Advocacy</h4>
                    <p className="text-sm">
                      Data visualization and reporting can raise public awareness about discrimination, build 
                      support for policy reforms, and mobilize voters around civil rights issues.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Systemic Reform</h4>
                    <p className="text-sm">
                      Comprehensive data can reveal systemic issues requiring broad policy interventions, from 
                      criminal justice reform to housing policy to employment law.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Call to Action */}
        <Card padding="lg" className="bg-black dark:bg-white text-white dark:text-black">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              Your Story Can Drive Change
            </h2>
            <p className="text-lg mb-6 text-gray-200 dark:text-gray-800">
              Every documented experience contributes to a larger understanding of discrimination and 
              helps build the evidence needed for meaningful change. Your voice matters.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => navigate('/report')}
              >
                Share Your Experience
              </Button>
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => navigate('/explore')}
              >
                Explore the Data
              </Button>
            </div>
          </div>
        </Card>

        {/* Additional Resources */}
        <Card padding="lg" className="mt-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Learn More
          </h3>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <p className="text-sm">
              For more information about how data-driven approaches are being used to combat discrimination:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-black dark:text-white mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                </svg>
                <span>Research civil rights organizations using data for advocacy</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-black dark:text-white mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                </svg>
                <span>Explore successful policy reforms driven by community data</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-black dark:text-white mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                </svg>
                <span>Learn about data privacy and protection in civil rights work</span>
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Made with Bob