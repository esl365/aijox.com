import { NextRequest, NextResponse } from 'next/server';
import { hybridSearch, getSearchFacets } from '@/lib/search/hybrid-search';

/**
 * Hybrid Search API - Phase 2 Task 1.1-1.2
 * GET /api/search?q=teacher&location=Korea&salaryMin=30000
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const location = searchParams.get('location') || undefined;
    const salaryMin = searchParams.get('salaryMin')
      ? parseInt(searchParams.get('salaryMin')!)
      : undefined;
    const salaryMax = searchParams.get('salaryMax')
      ? parseInt(searchParams.get('salaryMax')!)
      : undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    const [results, facets] = await Promise.all([
      hybridSearch({
        query,
        filters: { location, salaryMin, salaryMax },
        limit,
        offset,
      }),
      getSearchFacets(query),
    ]);

    return NextResponse.json({
      results,
      facets,
      total: results.length,
      query,
      page: Math.floor(offset / limit) + 1,
      pageSize: limit,
    });
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Search failed', message: error.message },
      { status: 500 }
    );
  }
}
