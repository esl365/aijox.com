/**
 * Hybrid Search Engine - Phase 2 Task 1.1-1.2
 * Combines BM25 (keyword) and kNN (vector) search with RRF ranking
 */

export interface SearchParams {
  query: string;
  filters?: {
    location?: string;
    salaryMin?: number;
    salaryMax?: number;
    certifications?: string[];
  };
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  location: string;
  salary: number;
  score: number;
  matchType: 'keyword' | 'semantic' | 'hybrid';
}

/**
 * Hybrid search combining keyword and vector search
 */
export async function hybridSearch(params: SearchParams): Promise<SearchResult[]> {
  const { query, filters = {}, limit = 20, offset = 0 } = params;

  // TODO: Implement actual hybrid search with pgvector
  // TODO: Connect to Elasticsearch/OpenSearch for BM25
  // For now, return mock results

  const mockJobs = [
    {
      id: '1',
      title: 'ESL Teacher - Seoul',
      description: 'Looking for experienced ESL teacher for elementary school',
      location: 'Seoul, South Korea',
      salary: 45000,
    },
    {
      id: '2',
      title: 'Mathematics Teacher - Shanghai',
      description: 'International school seeking math teacher',
      location: 'Shanghai, China',
      salary: 52000,
    },
    {
      id: '3',
      title: 'Science Teacher - Dubai',
      description: 'High school science position available',
      location: 'Dubai, UAE',
      salary: 65000,
    },
  ];

  // Simple keyword filtering
  const filtered = mockJobs.filter((job) => {
    const matchesQuery = !query ||
      job.title.toLowerCase().includes(query.toLowerCase()) ||
      job.description.toLowerCase().includes(query.toLowerCase());

    const matchesLocation = !filters.location ||
      job.location.toLowerCase().includes(filters.location.toLowerCase());

    const matchesSalary =
      (!filters.salaryMin || job.salary >= filters.salaryMin) &&
      (!filters.salaryMax || job.salary <= filters.salaryMax);

    return matchesQuery && matchesLocation && matchesSalary;
  });

  return filtered.slice(offset, offset + limit).map((job, index) => ({
    id: job.id,
    title: job.title,
    description: job.description,
    location: job.location,
    salary: job.salary,
    score: 1.0 - (index * 0.05), // Mock relevance score
    matchType: 'hybrid' as const,
  }));
}

/**
 * Reciprocal Rank Fusion (RRF) - combines multiple ranked lists
 */
export function reciprocalRankFusion(
  lists: SearchResult[][],
  k: number = 60
): SearchResult[] {
  const scoreMap = new Map<string, { result: SearchResult; score: number }>();

  lists.forEach((list) => {
    list.forEach((result, rank) => {
      const rrf = 1 / (k + rank + 1);
      const existing = scoreMap.get(result.id);

      if (existing) {
        existing.score += rrf;
      } else {
        scoreMap.set(result.id, { result, score: rrf });
      }
    });
  });

  return Array.from(scoreMap.values())
    .sort((a, b) => b.score - a.score)
    .map(({ result, score }) => ({ ...result, score }));
}

/**
 * Faceted search aggregations
 */
export async function getSearchFacets(query: string) {
  // TODO: Implement actual faceted aggregations
  // For now, return mock facets

  return {
    locations: [
      { value: 'South Korea', count: 45 },
      { value: 'China', count: 32 },
      { value: 'UAE', count: 28 },
      { value: 'Japan', count: 21 },
    ],
    salaryRanges: [
      { min: 0, max: 30000, count: 15 },
      { min: 30000, max: 50000, count: 42 },
      { min: 50000, max: 70000, count: 28 },
      { min: 70000, max: 100000, count: 12 },
    ],
    certifications: [
      { value: 'TEFL', count: 67 },
      { value: 'TESOL', count: 54 },
      { value: 'CELTA', count: 31 },
      { value: 'Teaching License', count: 28 },
    ],
  };
}
