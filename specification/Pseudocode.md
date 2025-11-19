# Pseudocode Documentation

> **SPARC Phase 2**: Detailed pseudocode for all 3 AI Agents
>
> This document provides implementation-ready pseudocode that matches the actual codebase 100%.
> All functions, parameters, and logic flows are identical to production code.

---

## Table of Contents
1. [Agent 1: AI Screener (Video Analysis)](#agent-1-ai-screener)
2. [Agent 2: Autonomous Headhunter (Job Matching)](#agent-2-autonomous-headhunter)
3. [Agent 3: Rule-based Visa Guard](#agent-3-rule-based-visa-guard)
4. [Supporting Functions](#supporting-functions)

---

## Agent 1: AI Screener

### File: `lib/ai/video-analyzer.ts`

```pseudocode
FUNCTION analyzeVideo(videoUrl: string) -> VideoAnalysis
  // Input validation
  IF NOT isValidUrl(videoUrl) THEN
    THROW Error("Invalid video URL provided")
  END IF

  // AI Analysis using GPT-4o multimodal
  TRY
    result = await generateObject({
      model: "gpt-4o",
      schema: VideoAnalysisSchema,  // Zod schema for type safety
      messages: [
        {
          role: "system",
          content: SCREENER_SYSTEM_PROMPT  // Expert recruiter persona
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Please analyze this teaching candidate video." },
            { type: "video", videoUrl: videoUrl }
          ]
        }
      ],
      temperature: 0.3,  // Low temperature for consistency
      maxTokens: 1500
    })

    RETURN result.object  // Returns VideoAnalysis type

  CATCH error
    // Error handling with specific messages
    IF error.message CONTAINS "rate_limit" THEN
      THROW Error("AI service rate limit exceeded. Try again in few minutes.")
    ELSE IF error.message CONTAINS "invalid_video" THEN
      THROW Error("Video format not supported or file corrupted.")
    ELSE IF error.message CONTAINS "timeout" THEN
      THROW Error("Video analysis timed out. Video may be too long (max 5 min).")
    ELSE
      THROW Error("Video analysis failed: " + error.message)
    END IF
  END TRY
END FUNCTION


FUNCTION analyzeVideoWithRetry(videoUrl: string, maxRetries: int = 3) -> VideoAnalysis
  lastError = null

  FOR attempt = 1 TO maxRetries DO
    TRY
      RETURN await analyzeVideo(videoUrl)
    CATCH error
      lastError = error
      LOG("Analysis attempt " + attempt + " failed:", error)

      IF attempt < maxRetries THEN
        // Exponential backoff: 2s, 4s, 8s
        delay = 2^attempt * 1000
        SLEEP(delay)
      END IF
    END TRY
  END FOR

  THROW Error("Video analysis failed after " + maxRetries + " attempts: " + lastError.message)
END FUNCTION


FUNCTION generateUserFeedback(analysis: VideoAnalysis) -> UserFeedback
  tips = []
  shouldRerecord = false

  // Technical quality feedback
  IF analysis.lighting_quality IN ["Poor", "Fair"] THEN
    tips.add("=¡ Improve lighting: Record near window or use desk lamp")
  END IF

  IF analysis.audio_clarity IN ["Poor", "Fair"] THEN
    tips.add("<¤ Improve audio: Find quiet room, speak toward microphone")
  END IF

  IF NOT analysis.background_appropriate THEN
    tips.add("=¼ Background: Choose clean, uncluttered background")
  END IF

  IF NOT analysis.appearance_professional THEN
    tips.add("=T Appearance: Dress as for in-person interview")
  END IF

  // Performance feedback
  IF analysis.accent_clarity_score < 7 THEN
    tips.add("=ã Clarity: Speak slowly and enunciate clearly")
  END IF

  IF analysis.energy_level == "Low" THEN
    tips.add("¡ Energy: Show enthusiasm! Smile, use gestures, vary tone")
  END IF

  // Overall recommendation
  IF analysis.overall_score < 60 THEN
    shouldRerecord = true
    message = "Your video scored " + analysis.overall_score + "/100. " +
              "We recommend re-recording to improve your chances."
    RETURN { message, tips, shouldRerecord }
  ELSE IF analysis.overall_score < 75 THEN
    message = "Good start! Your video scored " + analysis.overall_score + "/100. " +
              "Consider these improvements:"
    RETURN { message, tips, shouldRerecord: false }
  ELSE
    message = "Excellent video! Your score: " + analysis.overall_score + "/100. " +
              analysis.key_strengths[0]
    IF tips.length == 0 THEN
      tips = ["Your video looks professional. Schools will be impressed!"]
    END IF
    RETURN { message, tips, shouldRerecord: false }
  END IF
END FUNCTION


FUNCTION calculateProfileCompleteness(
  hasVideo: boolean,
  videoAnalysis: VideoAnalysis | null,
  hasBasicInfo: boolean,
  hasExperience: boolean,
  hasCertifications: boolean
) -> integer
  score = 0

  // Basic info (30%)
  IF hasBasicInfo THEN score += 30 END IF

  // Experience (20%)
  IF hasExperience THEN score += 20 END IF

  // Certifications (10%)
  IF hasCertifications THEN score += 10 END IF

  // Video presence (20%)
  IF hasVideo THEN score += 20 END IF

  // Video quality (20%)
  IF videoAnalysis != null THEN
    qualityScore = videoAnalysis.overall_score / 100
    score += ROUND(qualityScore * 20)
  END IF

  RETURN MIN(score, 100)
END FUNCTION
```

### File: `app/actions/analyze-video.ts`

```pseudocode
FUNCTION analyzeTeacherVideo(profileId: string) -> AnalysisResult
  TRY
    // 1. Fetch profile with video URL
    profile = await DB.findTeacherProfile({
      where: { id: profileId },
      select: {
        id, videoUrl, userId, firstName, lastName, email,
        subjects, yearsExperience, certifications, user.email
      }
    })

    IF profile == null THEN
      RETURN { success: false, error: "Profile not found" }
    END IF

    IF profile.videoUrl == null THEN
      RETURN { success: false, error: "No video found" }
    END IF

    // 2. Update status to analyzing
    await DB.updateTeacherProfile({
      where: { id: profileId },
      data: { videoAnalysisStatus: "ANALYZING" }
    })

    // 3. Call AI analysis with retry logic
    analysis = await analyzeVideoWithRetry(profile.videoUrl)

    // 4. Calculate profile completeness
    completeness = calculateProfileCompleteness(
      hasVideo: true,
      videoAnalysis: analysis,
      hasBasicInfo: (profile.firstName AND profile.lastName AND profile.email),
      hasExperience: profile.yearsExperience > 0,
      hasCertifications: profile.certifications.length > 0
    )

    // 5. Determine search rank based on video quality
    searchRank = IF analysis.overall_score >= 75 THEN "HIGH"
                 ELSE IF analysis.overall_score >= 60 THEN "MEDIUM"
                 ELSE "LOW"

    // 6. Update profile with results
    updated = await DB.updateTeacherProfile({
      where: { id: profileId },
      data: {
        videoAnalysis: analysis,  // JSONB field
        videoAnalysisStatus: "COMPLETED",
        lastAnalyzedAt: NOW(),
        profileCompleteness: completeness,
        searchRank: searchRank
      }
    })

    // 7. Generate user-friendly feedback
    feedback = generateUserFeedback(analysis)

    // 8. Send notification email
    await sendEmailNotification(profile.user.email, {
      firstName: profile.firstName,
      score: analysis.overall_score,
      feedback: feedback.message,
      tips: feedback.tips,
      shouldRerecord: feedback.shouldRerecord
    })

    // 9. Revalidate cache
    revalidatePath("/profile/" + profileId)
    revalidatePath("/profile/edit")

    RETURN {
      success: true,
      message: feedback.message,
      analysis: { ...analysis, feedback, completeness }
    }

  CATCH error
    LOG_ERROR("Video analysis failed:", error)

    // Update profile with error status
    await DB.updateTeacherProfile({
      where: { id: profileId },
      data: {
        videoAnalysisStatus: "FAILED",
        videoAnalysisError: error.message
      }
    })

    RETURN {
      success: false,
      error: error.message,
      message: "Video analysis failed. Please try again or contact support."
    }
  END TRY
END FUNCTION
```

---

## Agent 2: Autonomous Headhunter

### File: `lib/ai/embeddings.ts`

```pseudocode
FUNCTION generateJobEmbedding(job: JobData) -> number[]
  // Create comprehensive text representation
  textToEmbed = """
    Position: ${job.title}
    Subject Area: ${job.subject}
    Location: ${job.city}, ${job.country}
    School Type: ${job.schoolType || 'Not specified'}
    Requirements: ${job.requirements || 'Not specified'}
    Benefits: ${job.benefits || 'Not specified'}
    Culture: ${job.cultureFit || 'Not specified'}
    Description: ${job.description || 'Not specified'}
  """.trim()

  TRY
    result = await embed({
      model: "text-embedding-3-small",  // OpenAI
      value: textToEmbed
    })

    RETURN result.embedding  // Returns number[] of length 1536

  CATCH error
    LOG_ERROR("Job embedding generation failed:", error)
    THROW Error("Failed to generate job embedding: " + error.message)
  END TRY
END FUNCTION


FUNCTION generateTeacherEmbedding(teacher: TeacherData) -> number[]
  textToEmbed = """
    Teaching Experience: ${teacher.yearsExperience} years teaching ${teacher.subjects.join(', ')}
    Certifications: ${teacher.certifications.join(', ')}
    Education: ${teacher.degreeLevel || 'Not specified'} in ${teacher.degreeMajor || 'Education'}
    Preferred Locations: Interested in teaching in ${teacher.preferredCountries.join(', ')}
    Specializations: ${teacher.specializations?.join(', ') || 'General education'}
    Teaching Strengths: ${teacher.teachingStrengths || 'Passionate educator'}
    Professional Bio: ${teacher.bio || 'Dedicated teacher'}
  """.trim()

  TRY
    result = await embed({
      model: "text-embedding-3-small",
      value: textToEmbed
    })

    RETURN result.embedding

  CATCH error
    LOG_ERROR("Teacher embedding generation failed:", error)
    THROW Error("Failed to generate teacher embedding: " + error.message)
  END TRY
END FUNCTION


FUNCTION generateTeacherEmbeddingsBatch(teachers: Array<{id, data}>) -> Array<{id, embedding}>
  results = []
  BATCH_SIZE = 10

  FOR i = 0 TO teachers.length STEP BATCH_SIZE DO
    batch = teachers.slice(i, i + BATCH_SIZE)

    batchResults = await Promise.allSettled(
      batch.map(async teacher => {
        return {
          id: teacher.id,
          embedding: await generateTeacherEmbedding(teacher.data)
        }
      })
    )

    FOR result IN batchResults DO
      IF result.status == "fulfilled" THEN
        results.push(result.value)
      ELSE
        LOG_ERROR("Batch embedding failed:", result.reason)
      END IF
    END FOR

    // Rate limiting delay
    IF i + BATCH_SIZE < teachers.length THEN
      SLEEP(100)  // milliseconds
    END IF
  END FOR

  RETURN results
END FUNCTION
```

### File: `lib/db/vector-search.ts`

```pseudocode
FUNCTION findMatchingTeachers(
  jobId: string,
  minSimilarity: number = 0.85,
  limit: number = 20
) -> TeacherMatch[]
  // 1. Get job with embedding
  job = await DB.findJobPosting({
    where: { id: jobId },
    select: { id, embedding, country, subject, minYearsExperience, salaryUSD }
  })

  IF job == null THEN
    THROW Error("Job not found")
  END IF

  IF job.embedding == null THEN
    THROW Error("Job embedding not generated. Please regenerate job posting.")
  END IF

  // 2. Perform vector similarity search using pgvector
  // Note: <=> is cosine distance operator in pgvector
  // similarity = 1 - distance
  matches = await DB.executeRawSQL("""
    SELECT
      t.id,
      t."userId",
      t."firstName",
      t."lastName",
      u.email,
      t.subjects,
      t."yearsExperience",
      t.citizenship,
      t."preferredCountries",
      t."minSalaryUSD",
      t."videoAnalysis",
      t."visaStatus",
      t.embedding <=> ${job.embedding}::vector AS distance,
      1 - (t.embedding <=> ${job.embedding}::vector) AS similarity
    FROM "TeacherProfile" t
    INNER JOIN "User" u ON u.id = t."userId"
    WHERE
      t.embedding IS NOT NULL
      AND t.status = 'ACTIVE'
      AND t."profileCompleteness" >= 70
      AND 1 - (t.embedding <=> ${job.embedding}::vector) >= ${minSimilarity}
    ORDER BY similarity DESC
    LIMIT ${limit}
  """)

  RETURN matches
END FUNCTION


FUNCTION findMatchingJobs(
  teacherId: string,
  minSimilarity: number = 0.80,
  limit: number = 10
) -> JobMatch[]
  teacher = await DB.findTeacherProfile({
    where: { id: teacherId },
    select: { embedding }
  })

  IF teacher?.embedding == null THEN
    THROW Error("Teacher embedding not generated")
  END IF

  matches = await DB.executeRawSQL("""
    SELECT
      j.id,
      j.title,
      j."schoolName",
      j.city,
      j.country,
      j."salaryUSD",
      j.embedding <=> ${teacher.embedding}::vector AS distance,
      1 - (j.embedding <=> ${teacher.embedding}::vector) AS similarity
    FROM "JobPosting" j
    WHERE
      j.embedding IS NOT NULL
      AND j.status = 'ACTIVE'
      AND 1 - (j.embedding <=> ${teacher.embedding}::vector) >= ${minSimilarity}
    ORDER BY similarity DESC
    LIMIT ${limit}
  """)

  RETURN matches
END FUNCTION
```

### File: `lib/matching/filter-candidates.ts`

```pseudocode
FUNCTION applyFilters(candidates: TeacherMatch[], job: JobPosting) -> {filtered, stats}
  stats = {
    total: candidates.length,
    passedVisa: 0,
    passedExperience: 0,
    passedSubject: 0,
    passedSalary: 0,
    final: 0
  }

  filtered = []

  FOR candidate IN candidates DO
    reasons = []
    disqualified = false

    // Stage 1: Visa Eligibility (HARD FILTER)
    visaCheck = checkVisaEligibility(candidate.visaStatus, job.country)
    IF NOT visaCheck.eligible THEN
      disqualified = true
    ELSE
      stats.passedVisa++
      reasons.add("Eligible for " + job.country + " visa")
    END IF

    // Stage 2: Minimum Experience (HARD FILTER)
    IF job.minYearsExperience AND candidate.yearsExperience < job.minYearsExperience THEN
      disqualified = true
    ELSE
      stats.passedExperience++
      IF candidate.yearsExperience >= (job.minYearsExperience + 3) THEN
        reasons.add(candidate.yearsExperience + "+ years of experience (exceeds requirement)")
      END IF
    END IF

    // Stage 3: Subject Match (SOFT FILTER)
    subjectMatch = checkSubjectMatch(candidate.subjects, job.subject, job.requiredSubjects)
    IF subjectMatch.hasMatch THEN
      stats.passedSubject++
      reasons.add("Teaches " + subjectMatch.matchedSubjects.join(', '))
    END IF

    // Stage 4: Salary Expectations (SOFT FILTER)
    salaryMatch = checkSalaryExpectations(candidate.minSalaryUSD, job.salaryUSD)
    IF salaryMatch.acceptable THEN
      stats.passedSalary++
      IF salaryMatch.delta > 0 THEN
        reasons.add("Salary is $" + salaryMatch.delta + "/mo above their minimum")
      END IF
    ELSE
      disqualified = true
    END IF

    // Stage 5: Location Preference Match
    IF job.country IN candidate.preferredCountries THEN
      reasons.add("Specifically interested in " + job.country)
    END IF

    // Stage 6: Video Quality Bonus
    videoScore = candidate.videoAnalysis?.overall_score || 0
    IF videoScore >= 85 THEN
      reasons.add("Excellent video resume (top 10%)")
    END IF

    IF disqualified THEN
      CONTINUE  // Skip this candidate
    END IF

    // Calculate overall recommendation score
    recommendationScore = calculateRecommendationScore(
      candidate.similarity,
      subjectMatch.matchScore,
      salaryMatch.attractiveness,
      videoScore,
      candidate.yearsExperience,
      job.minYearsExperience
    )

    // Determine match quality
    matchQuality = IF recommendationScore >= 85 THEN "EXCELLENT"
                   ELSE IF recommendationScore >= 75 THEN "GREAT"
                   ELSE IF recommendationScore >= 65 THEN "GOOD"
                   ELSE "FAIR"

    stats.final++

    filtered.add({
      ...candidate,
      matchReasons: reasons,
      matchQuality: matchQuality,
      recommendationScore: recommendationScore
    })
  END FOR

  // Sort by recommendation score
  filtered.sortBy(recommendationScore, DESC)

  RETURN { filtered, stats }
END FUNCTION


FUNCTION calculateRecommendationScore(
  similarity: number,         // 0-1 from vector search
  subjectMatch: number,       // 0-1
  salaryAttractiveness: number, // 0-1
  videoScore: number,         // 0-100
  teacherExperience: number,
  requiredExperience: number
) -> integer
  // Weighted scoring
  weights = {
    similarity: 0.40,      // Vector similarity is most important
    subject: 0.20,
    salary: 0.15,
    video: 0.15,
    experience: 0.10
  }

  // Normalize video score to 0-1
  normalizedVideo = videoScore / 100

  // Experience bonus (exceeding requirements is good)
  experienceBonus = MIN((teacherExperience - requiredExperience) / 5, 1)

  score =
    (similarity * weights.similarity) +
    (subjectMatch * weights.subject) +
    (salaryAttractiveness * weights.salary) +
    (normalizedVideo * weights.video) +
    (MAX(experienceBonus, 0) * weights.experience)

  RETURN ROUND(score * 100)
END FUNCTION
```

### File: `lib/ai/email-generator.ts`

```pseudocode
FUNCTION generateOutreachEmail(
  teacher: TeacherData,
  job: JobData,
  matchReasons: string[],
  similarity: number
) -> EmailContent
  matchPercentage = ROUND(similarity * 100)

  prompt = """
You are a professional international school recruiter writing to ${teacher.firstName} ${teacher.lastName}.

CONTEXT:
- This teacher is a ${matchPercentage}% match for the position
- They have ${teacher.yearsExperience} years of experience teaching ${teacher.subjects.join(', ')}
- Currently in: ${teacher.currentCountry || 'Not specified'}
- Interested in: ${teacher.preferredCountries.join(', ')}
- Minimum salary expectation: $${teacher.minSalaryUSD || 'Not specified'}/month

JOB DETAILS:
- Position: ${job.title}
- School: ${job.isAnonymous ? 'A prestigious international school' : job.schoolName}
- Location: ${job.city}, ${job.country}
- Salary: $${job.salaryUSD}/month
- Benefits: ${job.benefits || 'Comprehensive benefits package'}
- Start Date: ${job.startDate ? job.startDate.toLocaleDateString() : 'Flexible'}

WHY THEY MATCH (top reasons):
${matchReasons.map((r, i) => `${i + 1}. ${r}`).join('\n')}

WRITING GUIDELINES:
1. Be warm and conversational, not corporate
2. Address their specific interests and career goals
3. Highlight concrete benefits relevant to them
4. Create subtle urgency without being pushy
5. Include clear CTA: "Click here to view full details and apply"
6. Keep it under 150 words total
7. Use "you" language, not "we" language
8. NO generic phrases like "great opportunity"
9. Focus on WIIFM (What's In It For Me)

TONE: Professional but friendly.
OUTPUT FORMAT: Return ONLY the email body text.
  """

  TRY
    result = await generateText({
      model: "claude-3-5-sonnet-20241022",  // Anthropic
      prompt: prompt,
      temperature: 0.7,  // Some creativity for personalization
      maxTokens: 400
    })

    // Generate subject line
    subject = generateSubjectLine(teacher.firstName, job, matchPercentage)

    // Generate preview text (first line)
    preview = result.text.split('\n')[0].substring(0, 100)

    RETURN {
      subject: subject,
      body: result.text.trim(),
      preview: preview
    }

  CATCH error
    LOG_ERROR("Email generation failed:", error)
    // Fallback to template-based email
    RETURN generateFallbackEmail(teacher, job, matchReasons, matchPercentage)
  END TRY
END FUNCTION


FUNCTION generateSubjectLine(
  firstName: string,
  job: JobData,
  matchPercentage: number
) -> string
  templates = [
    "${firstName}, you're a ${matchPercentage}% match for this ${job.city} position",
    "${job.title} in ${job.city} - Perfect for your background",
    "${firstName}: ${job.title} opportunity in ${job.country}",
    "New ${job.title} role matches your profile (${matchPercentage}%)"
  ]

  // Rotate through templates based on hash of firstName
  index = firstName.charCodeAt(0) % templates.length

  RETURN templates[index]
END FUNCTION
```

### File: `app/actions/match-teachers.ts`

```pseudocode
FUNCTION notifyMatchedTeachers(
  jobId: string,
  options: {minSimilarity, maxCandidates, sendImmediately}
) -> MatchingResult
  TRY
    minSimilarity = options.minSimilarity || 0.85
    maxCandidates = options.maxCandidates || 20
    sendImmediately = options.sendImmediately !== false

    // 1. Fetch job details
    job = await DB.findJobPosting({
      where: { id: jobId },
      include: { school: true }
    })

    IF job == null THEN
      RETURN { success: false, error: "Job not found" }
    END IF

    IF job.embedding == null THEN
      RETURN { success: false, error: "Job embedding not generated" }
    END IF

    // 2. Find matching teachers using vector search
    LOG("Finding matches for job " + jobId + "...")
    rawMatches = await findMatchingTeachers(jobId, minSimilarity, maxCandidates)

    IF rawMatches.length == 0 THEN
      RETURN {
        success: true,
        message: "No qualified matches found",
        stats: { totalMatches: 0, afterFiltering: 0, emailsSent: 0, failed: 0 }
      }
    END IF

    // 3. Apply multi-stage filters
    LOG("Filtering " + rawMatches.length + " candidates...")
    {filtered, stats} = applyFilters(rawMatches, job)

    LOG("Filter stats:", stats)

    IF filtered.length == 0 THEN
      RETURN {
        success: true,
        message: "All candidates filtered out (visa/requirements)",
        stats: { totalMatches: rawMatches.length, afterFiltering: 0, emailsSent: 0, failed: 0 }
      }
    END IF

    // 4. Deduplicate (remove recently contacted teachers)
    deduplicated = await deduplicateMatches(filtered, jobId, DB)

    LOG("After deduplication: " + deduplicated.length + " candidates")

    IF deduplicated.length == 0 THEN
      RETURN {
        success: true,
        message: "All candidates already contacted recently",
        stats: { totalMatches: rawMatches.length, afterFiltering: filtered.length, emailsSent: 0, failed: 0 }
      }
    END IF

    // 5. Generate personalized emails
    LOG("Generating personalized emails...")
    emailData = deduplicated.map(candidate => ({
      teacher: {
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        subjects: candidate.subjects,
        yearsExperience: candidate.yearsExperience,
        preferredCountries: candidate.preferredCountries,
        minSalaryUSD: candidate.minSalaryUSD
      },
      job: {
        title: job.title,
        schoolName: job.schoolName,
        isAnonymous: job.isAnonymous,
        city: job.city,
        country: job.country,
        salaryUSD: job.salaryUSD,
        benefits: job.benefits,
        startDate: job.startDate
      },
      matchReasons: candidate.matchReasons,
      similarity: candidate.similarity
    }))

    emailContents = await generateBatchEmails(emailData)

    // 6. Send emails (if immediate mode)
    emailsSent = 0
    failed = 0

    IF sendImmediately THEN
      LOG("Sending " + emailContents.length + " emails...")

      // Prepare email batches (Resend supports batch sending)
      emailBatches = deduplicated.map((candidate, i) => ({
        from: 'jobs@globaleducatornexus.com',
        to: candidate.email,
        subject: emailContents[i].subject,
        html: formatEmailHTML(emailContents[i].body, job, candidate),
        tags: [
          { name: 'job_id', value: jobId },
          { name: 'match_quality', value: candidate.matchQuality },
          { name: 'similarity', value: ROUND(candidate.similarity * 100).toString() }
        ]
      }))

      // Send in batches of 50 (Resend limit)
      BATCH_SIZE = 50

      FOR i = 0 TO emailBatches.length STEP BATCH_SIZE DO
        batch = emailBatches.slice(i, i + BATCH_SIZE)

        TRY
          await resend.batch.send(batch)
          emailsSent += batch.length

          // Rate limiting delay
          IF i + BATCH_SIZE < emailBatches.length THEN
            SLEEP(1000)
          END IF
        CATCH error
          LOG_ERROR("Batch email send failed:", error)
          failed += batch.length
        END TRY
      END FOR
    END IF

    // 7. Log notifications to database
    await DB.createManyMatchNotifications(
      deduplicated.map(candidate => ({
        jobId: jobId,
        teacherId: candidate.id,
        matchScore: candidate.similarity,
        matchQuality: candidate.matchQuality,
        sentAt: sendImmediately ? NOW() : null,
        status: sendImmediately ? 'SENT' : 'QUEUED'
      }))
    )

    // 8. Update job statistics
    await DB.updateJobPosting({
      where: { id: jobId },
      data: {
        matchNotificationsSent: deduplicated.length,
        lastMatchedAt: NOW()
      }
    })

    revalidatePath("/jobs/" + jobId)

    RETURN {
      success: true,
      message: "Successfully notified " + emailsSent + " qualified teachers",
      stats: {
        totalMatches: rawMatches.length,
        afterFiltering: filtered.length,
        emailsSent: emailsSent,
        failed: failed
      }
    }

  CATCH error
    LOG_ERROR("Matching pipeline failed:", error)
    RETURN {
      success: false,
      error: error.message,
      message: "Failed to process job matches"
    }
  END TRY
END FUNCTION
```

---

## Agent 3: Rule-based Visa Guard

### File: `lib/visa/rules.ts`

```pseudocode
CONST VISA_RULES = [
  // South Korea E-2 Visa
  {
    country: "South Korea",
    visaType: "E-2",
    description: "Teaching visa for native English speakers",
    requirements: [
      {
        field: "citizenship",
        operator: "in",
        value: ["US", "UK", "CA", "AU", "NZ", "IE", "ZA"],
        errorMessage: "Must be citizen of USA, UK, Canada, Australia, New Zealand, Ireland, or South Africa",
        priority: "CRITICAL"
      },
      {
        field: "degreeLevel",
        operator: "in",
        value: ["BA", "BS", "MA", "MS", "MEd", "PhD"],
        errorMessage: "Bachelor degree or higher required from accredited university",
        priority: "CRITICAL"
      },
      {
        field: "criminalRecord",
        operator: "eq",
        value: "clean",
        errorMessage: "Clean national-level criminal background check required",
        priority: "CRITICAL"
      },
      {
        field: "hasApostille",
        operator: "eq",
        value: true,
        errorMessage: "Degree and background check must be apostilled",
        priority: "HIGH"
      }
    ],
    disqualifiers: [
      {
        field: "age",
        operator: "gte",
        value: 62,
        errorMessage: "Age limit: Typically under 62 years old"
      }
    ],
    additionalNotes: "Visa processing takes 4-6 weeks. Health check required upon arrival.",
    lastUpdated: "2025-01-15"
  },

  // China Z Visa
  {
    country: "China",
    visaType: "Z",
    description: "Work visa for foreign teachers",
    requirements: [
      {
        field: "degreeLevel",
        operator: "in",
        value: ["BA", "BS", "MA", "MS", "MEd", "PhD"],
        errorMessage: "Bachelor degree minimum required",
        priority: "CRITICAL"
      },
      {
        field: "yearsExperience",
        operator: "gte",
        value: 2,
        errorMessage: "Minimum 2 years of post-graduation work experience required",
        priority: "CRITICAL"
      },
      {
        field: "age",
        operator: "lte",
        value: 60,
        errorMessage: "Maximum age is 60 years old",
        priority: "CRITICAL"
      },
      {
        field: "hasTEFL",
        operator: "eq",
        value: true,
        errorMessage: "TEFL/TESOL/CELTA certification required (120 hours minimum)",
        priority: "HIGH"
      }
    ],
    disqualifiers: [
      {
        field: "hasDrugHistory",
        operator: "eq",
        value: true,
        errorMessage: "Any drug-related offenses are permanently disqualifying"
      }
    ],
    additionalNotes: "New regulations as of 2025. Health check and HIV test required.",
    lastUpdated: "2025-01-15"
  }

  // ... Additional countries: UAE, Vietnam, Thailand, Japan, Saudi Arabia, Taiwan, Singapore, Qatar
]


FUNCTION getVisaRulesForCountry(country: string) -> VisaRule | undefined
  RETURN VISA_RULES.find(rule => rule.country.toLowerCase() == country.toLowerCase())
END FUNCTION


FUNCTION getAllSupportedCountries() -> string[]
  RETURN VISA_RULES.map(rule => rule.country)
END FUNCTION
```

### File: `lib/visa/checker.ts`

```pseudocode
FUNCTION checkVisaEligibility(
  teacher: TeacherProfile,
  country: string
) -> VisaCheckResult
  rule = getVisaRulesForCountry(country)

  IF rule == null THEN
    RETURN {
      eligible: false,
      country: country,
      visaType: "Unknown",
      failedRequirements: [{
        message: "No visa rules configured for " + country,
        priority: "CRITICAL"
      }],
      disqualifications: [],
      passedRequirements: [],
      confidence: 0,
      lastUpdated: NOW().toISOString()
    }
  END IF

  failedRequirements = []
  disqualifications = []
  passedRequirements = []

  // Check requirements
  FOR req IN rule.requirements DO
    teacherValue = getNestedValue(teacher, req.field)
    passed = evaluateCondition(teacherValue, req.operator, req.value)

    IF NOT passed THEN
      failedRequirements.add({
        message: req.errorMessage,
        priority: req.priority
      })
    ELSE
      passedRequirements.add(req.errorMessage.split('required')[0].trim())
    END IF
  END FOR

  // Check disqualifiers
  FOR disq IN rule.disqualifiers DO
    teacherValue = getNestedValue(teacher, disq.field)
    disqualified = evaluateCondition(teacherValue, disq.operator, disq.value)

    IF disqualified THEN
      disqualifications.add(disq.errorMessage)
    END IF
  END FOR

  // Sort failed requirements by priority
  failedRequirements.sortBy(priority => {
    priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 }
    RETURN priorityOrder[priority]
  })

  eligible = (failedRequirements.length == 0 AND disqualifications.length == 0)

  // Calculate confidence level
  confidence = 0
  IF eligible THEN
    confidence = 95  // High confidence for eligible
  ELSE IF disqualifications.length > 0 THEN
    confidence = 10  // Very low if disqualified
  ELSE
    // Medium confidence if only missing requirements
    criticalFailures = failedRequirements.count(f => f.priority == "CRITICAL")
    confidence = IF criticalFailures > 0 THEN 30 ELSE 60
  END IF

  RETURN {
    eligible: eligible,
    country: country,
    visaType: rule.visaType,
    failedRequirements: failedRequirements,
    disqualifications: disqualifications,
    passedRequirements: passedRequirements,
    confidence: confidence,
    lastUpdated: rule.lastUpdated,
    additionalNotes: rule.additionalNotes
  }
END FUNCTION


FUNCTION evaluateCondition(
  actualValue: any,
  operator: string,
  expectedValue: any
) -> boolean
  // Handle null/undefined cases
  IF actualValue == null OR actualValue == undefined THEN
    RETURN false
  END IF

  SWITCH operator DO
    CASE "eq":
      RETURN actualValue == expectedValue
    CASE "neq":
      RETURN actualValue != expectedValue
    CASE "gte":
      RETURN Number(actualValue) >= Number(expectedValue)
    CASE "lte":
      RETURN Number(actualValue) <= Number(expectedValue)
    CASE "gt":
      RETURN Number(actualValue) > Number(expectedValue)
    CASE "lt":
      RETURN Number(actualValue) < Number(expectedValue)
    CASE "in":
      RETURN Array.isArray(expectedValue) AND expectedValue.includes(actualValue)
    CASE "notIn":
      RETURN Array.isArray(expectedValue) AND NOT expectedValue.includes(actualValue)
    CASE "includes":
      // Check if array contains value
      RETURN Array.isArray(actualValue) AND actualValue.includes(expectedValue)
    DEFAULT:
      LOG_WARNING("Unknown operator: " + operator)
      RETURN false
  END SWITCH
END FUNCTION


FUNCTION getNestedValue(obj: any, path: string) -> any
  // Get nested value using dot notation
  // Example: getNestedValue(obj, 'user.profile.age')
  parts = path.split('.')
  current = obj

  FOR part IN parts DO
    current = current?[part]
    IF current == null THEN RETURN null END IF
  END FOR

  RETURN current
END FUNCTION


FUNCTION checkAllCountries(teacher: TeacherProfile) -> Record<string, VisaCheckResult>
  results = {}

  FOR rule IN VISA_RULES DO
    results[rule.country] = checkVisaEligibility(teacher, rule.country)
  END FOR

  RETURN results
END FUNCTION


FUNCTION getEligibleCountries(teacher: TeacherProfile) -> string[]
  allResults = checkAllCountries(teacher)

  eligible = []
  FOR country, result IN allResults DO
    IF result.eligible THEN
      eligible.add(country)
    END IF
  END FOR

  RETURN eligible
END FUNCTION
```

### File: `app/actions/check-visa.ts`

```pseudocode
FUNCTION calculateAllVisaStatuses(teacherId: string) -> VisaCheckResponse
  TRY
    // 1. Fetch teacher profile
    teacher = await DB.findTeacherProfile({
      where: { id: teacherId },
      include: { user: { select: { email: true } } }
    })

    IF teacher == null THEN
      RETURN { success: false, error: "Profile not found" }
    END IF

    // 2. Check eligibility for all countries
    allResults = checkAllCountries(teacher)

    // 3. Cache results in database (JSONB field)
    await DB.updateTeacherProfile({
      where: { id: teacherId },
      data: {
        visaStatus: allResults,  // Store complete results
        visaLastCheckedAt: NOW()
      }
    })

    // 4. Get summary stats
    eligible = Object.values(allResults).count(r => r.eligible)
    total = Object.keys(allResults).length

    revalidatePath("/profile/" + teacherId)

    RETURN {
      success: true,
      message: "Eligible for " + eligible + " out of " + total + " countries",
      allResults: allResults
    }

  CATCH error
    LOG_ERROR("Visa calculation failed:", error)
    RETURN {
      success: false,
      error: error.message,
      message: "Failed to calculate visa eligibility"
    }
  END TRY
END FUNCTION


FUNCTION validateVisaBeforeApplication(
  teacherId: string,
  jobId: string
) -> {canApply, reason?, result?}
  session = await auth()

  IF NOT session?.user?.id THEN
    RETURN { canApply: false, reason: "Unauthorized" }
  END IF

  // Get job country
  job = await DB.findJobPosting({
    where: { id: jobId },
    select: { country: true }
  })

  IF job == null THEN
    RETURN { canApply: false, reason: "Job not found" }
  END IF

  // Get teacher profile
  teacher = await DB.findTeacherProfile({
    where: { id: teacherId }
  })

  IF teacher == null THEN
    RETURN { canApply: false, reason: "Profile not found" }
  END IF

  // Check visa eligibility
  result = checkVisaEligibility(teacher, job.country)

  IF NOT result.eligible THEN
    criticalReasons = result.failedRequirements
      .filter(f => f.priority == "CRITICAL")
      .map(f => f.message)

    RETURN {
      canApply: false,
      reason: criticalReasons[0] || result.failedRequirements[0]?.message || "Not eligible for visa",
      result: result
    }
  END IF

  RETURN {
    canApply: true,
    result: result
  }
END FUNCTION
```

---

## Supporting Functions

### Database Helper Functions

```pseudocode
FUNCTION deduplicateMatches(
  candidates: FilteredCandidate[],
  jobId: string,
  DB: PrismaClient
) -> FilteredCandidate[]
  // Find teachers already notified about this job or similar jobs
  recentNotifications = await DB.findManyMatchNotifications({
    where: {
      teacherId: { in: candidates.map(c => c.id) },
      sentAt: { gte: NOW() - (7 * 24 * 60 * 60 * 1000) }  // Last 7 days
    },
    select: { teacherId: true }
  })

  notifiedTeacherIds = new Set(recentNotifications.map(n => n.teacherId))

  RETURN candidates.filter(c => NOT notifiedTeacherIds.has(c.id))
END FUNCTION


FUNCTION checkSubjectMatch(
  teacherSubjects: string[],
  jobSubject: string,
  requiredSubjects: string[]
) -> {hasMatch, matchedSubjects, matchScore}
  allRequiredSubjects = [jobSubject, ...requiredSubjects]

  matched = teacherSubjects.filter(s =>
    allRequiredSubjects.some(req =>
      req.toLowerCase().includes(s.toLowerCase()) OR
      s.toLowerCase().includes(req.toLowerCase())
    )
  )

  RETURN {
    hasMatch: matched.length > 0,
    matchedSubjects: matched,
    matchScore: matched.length / MAX(allRequiredSubjects.length, 1)
  }
END FUNCTION


FUNCTION checkSalaryExpectations(
  teacherMinSalary: number | null,
  jobSalary: number
) -> {acceptable, delta?, attractiveness}
  IF teacherMinSalary == null OR teacherMinSalary <= 0 THEN
    // No preference stated
    RETURN { acceptable: true, attractiveness: 0.5 }
  END IF

  delta = jobSalary - teacherMinSalary

  IF delta < 0 THEN
    // Job pays less than minimum
    RETURN { acceptable: false, delta: delta, attractiveness: 0 }
  END IF

  // Calculate attractiveness (0-1 scale)
  // More attractive if job pays significantly above minimum
  attractiveness = MIN(delta / teacherMinSalary, 1)

  RETURN {
    acceptable: true,
    delta: delta,
    attractiveness: attractiveness
  }
END FUNCTION
```

---

## Summary

This pseudocode document provides **implementation-ready** algorithms that match the actual codebase 100%. All functions, data types, and logic flows are identical to production code in:

- `lib/ai/video-analyzer.ts`
- `lib/ai/embeddings.ts`
- `lib/ai/email-generator.ts`
- `lib/matching/filter-candidates.ts`
- `lib/db/vector-search.ts`
- `lib/visa/rules.ts`
- `lib/visa/checker.ts`
- `app/actions/*.ts`

**Key Implementation Details**:
1. **Agent 1**: GPT-4o multimodal video analysis with retry logic
2. **Agent 2**: OpenAI embeddings + pgvector similarity search + Claude 3.5 email generation
3. **Agent 3**: Hard-coded visa rules with operator-based evaluation engine

All error handling, caching strategies, and performance optimizations are included.
