'use client';

interface AboutJobSectionProps {
  description: string;
  fullDescriptionHtml?: string | null;
  requirements?: string | null;
  benefits?: string | null;
  housingProvided: boolean;
  flightProvided: boolean;
  contractLength?: number | null;
}

export function AboutJobSection({
  description,
  fullDescriptionHtml,
  requirements,
  benefits,
  housingProvided,
  flightProvided,
  contractLength,
}: AboutJobSectionProps) {
  // Parse requirements into array if it's a string with bullet points or newlines
  const parseToArray = (text: string | null | undefined): string[] => {
    if (!text) return [];
    return text
      .split(/[\n•\-\*]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  };

  // Build benefits array from various sources
  const benefitsList: string[] = [];
  if (housingProvided) benefitsList.push('Housing provided or housing allowance');
  if (flightProvided) benefitsList.push('Flight reimbursement included');
  if (contractLength) benefitsList.push(`${contractLength}-month contract`);

  // Add parsed benefits
  const additionalBenefits = parseToArray(benefits);
  benefitsList.push(...additionalBenefits);

  const requirementsList = parseToArray(requirements);

  // Parse description for responsibilities (if no HTML description)
  const responsibilitiesList = !fullDescriptionHtml
    ? parseToArray(description).slice(0, 5)
    : [];

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        About the job
      </h2>

      {/* Full description if available */}
      {fullDescriptionHtml ? (
        <div
          className="prose prose-gray dark:prose-invert max-w-none mb-8 prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-600 dark:prose-p:text-gray-400 prose-li:text-gray-600 dark:prose-li:text-gray-400"
          dangerouslySetInnerHTML={{ __html: fullDescriptionHtml }}
        />
      ) : (
        <p className="text-gray-600 dark:text-gray-400 mb-8 whitespace-pre-line">
          {description}
        </p>
      )}

      {/* Three-column grid */}
      <div className="grid md:grid-cols-3 gap-8 pt-6 border-t border-gray-200 dark:border-gray-800">
        {/* Responsibilities */}
        {responsibilitiesList.length > 0 && (
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              Responsibilities
            </h3>
            <ul className="space-y-2">
              {responsibilitiesList.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  <span className="text-gray-400 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Requirements */}
        {requirementsList.length > 0 && (
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
              Requirements
            </h3>
            <ul className="space-y-2">
              {requirementsList.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  <span className="text-gray-400 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Benefits */}
        {benefitsList.length > 0 && (
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                />
              </svg>
              Benefits
            </h3>
            <ul className="space-y-2">
              {benefitsList.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  <svg
                    className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
