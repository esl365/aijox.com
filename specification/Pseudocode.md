# Pseudocode - 의사코드 설계

## 개요
Global Educator Nexus의 핵심 AI 에이전트 로직을 의사코드로 표현합니다.
이 문서는 실제 구현된 코드(`lib/ai/`, `lib/visa/`)를 기반으로 역공학(Reverse SPARC)하여 작성되었습니다.

---

## 🤖 AI Agent 1: Video Analyzer (비디오 분석 에이전트)

### 목적
비정형 데이터(비디오 이력서)를 정형 데이터(점수 및 메타데이터)로 변환하여 원어민 여부, 억양, 전문성을 평가

### 입력/출력
```pseudocode
INPUT: videoUrl (String) - Cloudflare R2에 업로드된 비디오 URL
OUTPUT: VideoAnalysis (Object) {
  accent_type: Enum[North American, British, Australian, Asian, European, Other]
  accent_clarity_score: Number[1-10]
  native_confidence_score: Number[0-100]  // 핵심 필드
  energy_level: Enum[High, Medium, Low]
  energy_score: Number[1-10]
  professionalism_score: Number[1-10]
  technical_quality_score: Number[1-10]
  overall_score: Number[1-100]
  key_strengths: Array<String>[1-5]
  improvement_areas: Array<String>[0-5]
  summary: String[10-500]
  recommended_for_roles: Array<String>[1-5]
  appearance_professional: Boolean
  background_appropriate: Boolean
  lighting_quality: Enum[Excellent, Good, Fair, Poor]
  audio_clarity: Enum[Excellent, Good, Fair, Poor]
  confidence_level: Number[0-100]
}
```

### 주요 로직
```pseudocode
FUNCTION analyzeVideo(videoUrl):
    // 1. 입력 검증
    IF NOT isValidUrl(videoUrl) THEN
        THROW Error("Invalid video URL provided")
    END IF

    // 2. GPT-4o 멀티모달 분석 호출
    DEFINE system_prompt = """
    You are an expert international school recruiter.
    Analyze this teaching video and provide structured feedback.

    EVALUATION CRITERIA:
    1. ACCENT & PRONUNCIATION (1-10)
       - Native confidence score (0-100): Likelihood candidate is native English speaker
       - Clarity, enunciation, communication barriers
    2. ENERGY & ENTHUSIASM (1-10)
       - Body language, vocal variety, passion
    3. PROFESSIONALISM (1-10)
       - Attire, grooming, eye contact, confidence
    4. TECHNICAL QUALITY (1-10)
       - Lighting, audio, stability, background

    Overall Score = (accent * 0.3 + energy * 0.25 + professionalism * 0.25 + technical * 0.2) * 10

    OUTPUT ONLY VALID JSON matching the schema.
    """

    TRY:
        result = CALL openai.generateObject({
            model: "gpt-4o",
            schema: VideoAnalysisSchema,
            messages: [
                { role: "system", content: system_prompt },
                { role: "user", content: [
                    { type: "text", text: "Analyze this teaching candidate video." },
                    { type: "video", videoUrl: videoUrl }
                ]}
            ],
            temperature: 0.3,  // 일관성을 위한 낮은 온도
            maxTokens: 1500
        })
        RETURN result.object
    CATCH error:
        // 3. 에러 처리 (Rate Limit, Invalid Video, Timeout)
        IF error.message CONTAINS "rate_limit" THEN
            THROW Error("AI service rate limit exceeded. Try again in a few minutes.")
        ELSE IF error.message CONTAINS "invalid_video" THEN
            THROW Error("Video format not supported or file corrupted.")
        ELSE IF error.message CONTAINS "timeout" THEN
            THROW Error("Video analysis timed out. Video may be too long (max 5 minutes).")
        ELSE
            THROW Error("Video analysis failed: " + error.message)
        END IF
    END TRY
END FUNCTION
```

### 사용자 피드백 생성 로직
```pseudocode
FUNCTION generateUserFeedback(analysis):
    INITIALIZE tips = []
    INITIALIZE shouldRerecord = false

    // 기술적 품질 피드백
    IF analysis.lighting_quality IN [Poor, Fair] THEN
        tips.APPEND("💡 Improve lighting: Record near window or use desk lamp")
    END IF

    IF analysis.audio_clarity IN [Poor, Fair] THEN
        tips.APPEND("🎤 Improve audio: Find quiet room, speak toward microphone")
    END IF

    IF NOT analysis.background_appropriate THEN
        tips.APPEND("🖼️ Background: Choose clean, uncluttered background")
    END IF

    IF NOT analysis.appearance_professional THEN
        tips.APPEND("👔 Appearance: Dress business casual minimum")
    END IF

    // 성능 피드백
    IF analysis.accent_clarity_score < 7 THEN
        tips.APPEND("🗣️ Clarity: Speak slowly and enunciate clearly")
    END IF

    IF analysis.energy_level == Low THEN
        tips.APPEND("⚡ Energy: Show enthusiasm! Smile, gestures, vocal variety")
    END IF

    // 전체 권장사항
    IF analysis.overall_score < 60 THEN
        shouldRerecord = true
        RETURN {
            message: "Your video scored " + overall_score + "/100. Re-record recommended.",
            tips: tips,
            shouldRerecord: true
        }
    ELSE IF analysis.overall_score < 75 THEN
        RETURN {
            message: "Good start! Score: " + overall_score + "/100. Consider improvements:",
            tips: tips,
            shouldRerecord: false
        }
    ELSE
        RETURN {
            message: "Excellent video! Score: " + overall_score + "/100. " + key_strengths[0],
            tips: tips.length > 0 ? tips : ["Professional video. Schools will be impressed!"],
            shouldRerecord: false
        }
    END IF
END FUNCTION
```

### 재시도 로직 (Exponential Backoff)
```pseudocode
FUNCTION analyzeVideoWithRetry(videoUrl, maxRetries = 3):
    FOR attempt FROM 1 TO maxRetries:
        TRY:
            RETURN analyzeVideo(videoUrl)
        CATCH error:
            LOG "Analysis attempt " + attempt + " failed: " + error
            IF attempt < maxRetries THEN
                delay = POWER(2, attempt) * 1000  // 2s, 4s, 8s
                WAIT delay milliseconds
            END IF
        END TRY
    END FOR
    THROW Error("Video analysis failed after " + maxRetries + " attempts")
END FUNCTION
```

---

## 🕵️ AI Agent 2: Autonomous Headhunter (자동 매칭 에이전트)

### 목적
RAG(Retrieval Augmented Generation)를 사용하여 공고-강사 간 시맨틱 유사도 기반 자동 매칭

### 2.1. Embedding Generation (벡터 생성)

```pseudocode
FUNCTION generateJobEmbedding(job):
    // 공고 데이터를 자연어로 변환
    textToEmbed = """
    Position: {job.title}
    Subject Area: {job.subject}
    Location: {job.city}, {job.country}
    School Type: {job.schoolType}
    Requirements: {job.requirements}
    Benefits: {job.benefits}
    Culture: {job.cultureFit}
    Description: {job.description}
    """.TRIM()

    TRY:
        embedding = CALL openai.embed({
            model: "text-embedding-3-small",  // 1536 dimensions
            value: textToEmbed
        })
        RETURN embedding  // number[] of length 1536
    CATCH error:
        LOG "Job embedding generation failed: " + error
        THROW Error("Failed to generate job embedding")
    END TRY
END FUNCTION

FUNCTION generateTeacherEmbedding(teacher):
    textToEmbed = """
    Teaching Experience: {teacher.yearsExperience} years teaching {teacher.subjects.JOIN(', ')}
    Certifications: {teacher.certifications.JOIN(', ')}
    Education: {teacher.degreeLevel} in {teacher.degreeMajor}
    Preferred Locations: Interested in teaching in {teacher.preferredCountries.JOIN(', ')}
    Specializations: {teacher.specializations.JOIN(', ')}
    Teaching Strengths: {teacher.teachingStrengths}
    Professional Bio: {teacher.bio}
    """.TRIM()

    TRY:
        embedding = CALL openai.embed({
            model: "text-embedding-3-small",
            value: textToEmbed
        })
        RETURN embedding
    CATCH error:
        THROW Error("Failed to generate teacher embedding")
    END TRY
END FUNCTION
```

### 2.2. Vector Similarity Search (pgvector 활용)

```pseudocode
FUNCTION findMatchingTeachers(jobId, minSimilarity = 0.85, limit = 20):
    // 1. 공고 및 임베딩 조회
    job = DATABASE.query(
        "SELECT id, embedding, country, subject, minYearsExperience, salaryUSD
         FROM JobPosting
         WHERE id = :jobId"
    )

    IF NOT job THEN
        THROW Error("Job not found")
    END IF

    IF NOT job.embedding THEN
        THROW Error("Job embedding not generated. Please regenerate job posting.")
    END IF

    // 2. pgvector 코사인 유사도 검색
    // pgvector uses <=> for cosine distance
    // Similarity = 1 - distance
    matches = DATABASE.rawQuery("""
        SELECT
            t.id,
            t.userId,
            t.firstName,
            t.lastName,
            u.email,
            t.subjects,
            t.yearsExperience,
            t.citizenship,
            t.preferredCountries,
            t.minSalaryUSD,
            t.videoAnalysis,
            t.visaStatus,
            t.embedding <=> :jobEmbedding::vector AS distance,
            1 - (t.embedding <=> :jobEmbedding::vector) AS similarity
        FROM TeacherProfile t
        INNER JOIN User u ON u.id = t.userId
        WHERE
            t.embedding IS NOT NULL
            AND t.status = 'ACTIVE'
            AND t.profileCompleteness >= 70
            AND 1 - (t.embedding <=> :jobEmbedding::vector) >= :minSimilarity
        ORDER BY similarity DESC
        LIMIT :limit
    """, {
        jobEmbedding: job.embedding,
        minSimilarity: minSimilarity,
        limit: limit
    })

    RETURN matches
END FUNCTION
```

### 2.3. Hybrid Search (벡터 + 필터 조합)

```pseudocode
FUNCTION hybridTeacherSearch(filters):
    // 벡터 유사도 + 전통적 필터 조합

    // 1. 공고 임베딩 가져오기 (옵션)
    IF filters.jobId THEN
        job = DATABASE.query("SELECT embedding FROM JobPosting WHERE id = :jobId")
        embedding = job.embedding
    ELSE
        embedding = NULL
    END IF

    // 2. 동적 WHERE 조건 생성
    conditions = [
        "t.status = 'ACTIVE'",
        "t.profileCompleteness >= 60"
    ]

    IF embedding THEN
        conditions.APPEND("1 - (t.embedding <=> '" + embedding + "'::vector) >= " + filters.minSimilarity)
    END IF

    IF filters.subjects AND filters.subjects.LENGTH > 0 THEN
        conditions.APPEND("t.subjects && ARRAY[" + filters.subjects.MAP(s => "'" + s + "'").JOIN(',') + "]::text[]")
    END IF

    IF filters.countries AND filters.countries.LENGTH > 0 THEN
        conditions.APPEND("t.preferredCountries && ARRAY[" + filters.countries.MAP(c => "'" + c + "'").JOIN(',') + "]::text[]")
    END IF

    IF filters.minExperience THEN
        conditions.APPEND("t.yearsExperience >= " + filters.minExperience)
    END IF

    IF filters.maxSalary THEN
        conditions.APPEND("(t.minSalaryUSD IS NULL OR t.minSalaryUSD <= " + filters.maxSalary + ")")
    END IF

    // 3. 쿼리 실행
    whereClause = conditions.JOIN(' AND ')

    query = IF embedding THEN
        "SELECT ... ORDER BY similarity DESC LIMIT " + filters.limit
    ELSE
        "SELECT ... ORDER BY t.profileCompleteness DESC, t.yearsExperience DESC LIMIT " + filters.limit
    END IF

    RETURN DATABASE.rawQuery(query)
END FUNCTION
```

### 2.4. Batch Embedding (효율성)

```pseudocode
FUNCTION generateJobEmbeddingsBatch(jobs):
    results = []
    BATCH_SIZE = 10

    FOR i FROM 0 TO jobs.LENGTH STEP BATCH_SIZE:
        batch = jobs.SLICE(i, i + BATCH_SIZE)

        // 병렬 처리
        batchResults = PARALLEL_AWAIT(
            batch.MAP(job => {
                id: job.id,
                embedding: generateJobEmbedding(job.data)
            })
        )

        FOR result IN batchResults:
            IF result.STATUS == 'fulfilled' THEN
                results.APPEND(result.VALUE)
            ELSE
                LOG "Batch embedding failed: " + result.REASON
            END IF
        END FOR

        // Rate Limiting 방지
        IF i + BATCH_SIZE < jobs.LENGTH THEN
            WAIT 100 milliseconds
        END IF
    END FOR

    RETURN results
END FUNCTION
```

---

## ⚡ AI Agent 3: Visa Guard (비자 적격성 판별 에이전트)

### 목적
하드코딩된 국가별 규칙 엔진을 사용하여 강사의 비자 발급 가능성을 사전 검증

### 3.1. 비자 규칙 데이터 구조

```pseudocode
TYPE VisaRule = {
    country: String
    visaType: String
    description: String
    requirements: Array<VisaRequirement>
    disqualifiers: Array<VisaDisqualifier>
    additionalNotes: String (optional)
    lastUpdated: String (ISO Date)
}

TYPE VisaRequirement = {
    field: String                // TeacherProfile 필드 경로 (예: "citizenship", "degreeLevel")
    operator: Enum[eq, neq, gte, lte, gt, lt, in, notIn, includes]
    value: Any                   // 비교값
    errorMessage: String         // 실패 시 사용자에게 표시할 메시지
    priority: Enum[CRITICAL, HIGH, MEDIUM]
}

TYPE VisaDisqualifier = {
    field: String
    operator: String
    value: Any
    errorMessage: String
}
```

### 3.2. 비자 적격성 체크 로직

```pseudocode
FUNCTION checkVisaEligibility(teacher, country):
    // 1. 국가별 규칙 조회
    rule = getVisaRulesForCountry(country)

    IF NOT rule THEN
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
            lastUpdated: NOW()
        }
    END IF

    INITIALIZE failedRequirements = []
    INITIALIZE disqualifications = []
    INITIALIZE passedRequirements = []

    // 2. 필수 요구사항 검증
    FOR EACH req IN rule.requirements:
        teacherValue = getNestedValue(teacher, req.field)
        passed = evaluateCondition(teacherValue, req.operator, req.value)

        IF NOT passed THEN
            failedRequirements.APPEND({
                message: req.errorMessage,
                priority: req.priority
            })
        ELSE
            passedRequirements.APPEND(req.errorMessage.SPLIT('required')[0].TRIM())
        END IF
    END FOR

    // 3. 실격 조건 검증
    FOR EACH disq IN rule.disqualifiers:
        teacherValue = getNestedValue(teacher, disq.field)
        disqualified = evaluateCondition(teacherValue, disq.operator, disq.value)

        IF disqualified THEN
            disqualifications.APPEND(disq.errorMessage)
        END IF
    END FOR

    // 4. 우선순위별 정렬 (CRITICAL > HIGH > MEDIUM)
    failedRequirements.SORT_BY(priority)

    eligible = (failedRequirements.LENGTH == 0 AND disqualifications.LENGTH == 0)

    // 5. 신뢰도 계산
    confidence = IF eligible THEN
        95  // 적격 시 높은 신뢰도
    ELSE IF disqualifications.LENGTH > 0 THEN
        10  // 실격 시 매우 낮은 신뢰도
    ELSE
        criticalFailures = failedRequirements.FILTER(f => f.priority == "CRITICAL").LENGTH
        IF criticalFailures > 0 THEN 30 ELSE 60
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
```

### 3.3. 조건 평가 로직

```pseudocode
FUNCTION evaluateCondition(actualValue, operator, expectedValue):
    // NULL/Undefined 처리
    IF actualValue IS NULL OR actualValue IS UNDEFINED THEN
        RETURN false
    END IF

    SWITCH operator:
        CASE "eq":
            RETURN actualValue == expectedValue

        CASE "neq":
            RETURN actualValue != expectedValue

        CASE "gte":
            RETURN NUMBER(actualValue) >= NUMBER(expectedValue)

        CASE "lte":
            RETURN NUMBER(actualValue) <= NUMBER(expectedValue)

        CASE "gt":
            RETURN NUMBER(actualValue) > NUMBER(expectedValue)

        CASE "lt":
            RETURN NUMBER(actualValue) < NUMBER(expectedValue)

        CASE "in":
            RETURN IS_ARRAY(expectedValue) AND expectedValue.INCLUDES(actualValue)

        CASE "notIn":
            RETURN IS_ARRAY(expectedValue) AND NOT expectedValue.INCLUDES(actualValue)

        CASE "includes":
            RETURN IS_ARRAY(actualValue) AND actualValue.INCLUDES(expectedValue)

        DEFAULT:
            LOG "Unknown operator: " + operator
            RETURN false
    END SWITCH
END FUNCTION
```

### 3.4. 한국 E-2 비자 예제 규칙

```pseudocode
KOREA_E2_RULE = {
    country: "South Korea",
    visaType: "E-2",
    description: "Teaching visa for native English speakers",
    requirements: [
        {
            field: "citizenship",
            operator: "in",
            value: ["US", "UK", "CA", "AU", "NZ", "IE", "ZA"],
            errorMessage: "Must be a citizen of USA, UK, Canada, Australia, New Zealand, Ireland, or South Africa",
            priority: "CRITICAL"
        },
        {
            field: "degreeLevel",
            operator: "in",
            value: ["BA", "BS", "MA", "MS", "MEd", "PhD"],
            errorMessage: "Bachelor degree or higher required from an accredited university",
            priority: "CRITICAL"
        },
        {
            field: "criminalRecord",
            operator: "eq",
            value: "clean",
            errorMessage: "Clean national-level criminal background check required (FBI check for US citizens)",
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
        },
        {
            field: "hasE2VisaViolation",
            operator: "eq",
            value: true,
            errorMessage: "Previous E-2 visa violations will result in denial"
        }
    ],
    additionalNotes: "Visa processing takes 4-6 weeks. Health check required upon arrival.",
    lastUpdated: "2025-01-15"
}
```

### 3.5. 다중 국가 체크

```pseudocode
FUNCTION checkAllCountries(teacher):
    results = {}

    FOR EACH rule IN VISA_RULES:
        result = checkVisaEligibility(teacher, rule.country)
        results[rule.country] = result
    END FOR

    RETURN results
END FUNCTION

FUNCTION getEligibleCountries(teacher):
    allResults = checkAllCountries(teacher)

    eligibleCountries = []
    FOR EACH (country, result) IN allResults:
        IF result.eligible THEN
            eligibleCountries.APPEND(country)
        END IF
    END FOR

    RETURN eligibleCountries
END FUNCTION
```

### 3.6. 사용자 권장사항 생성

```pseudocode
FUNCTION getEligibilityRecommendations(result):
    IF result.eligible THEN
        RETURN ["You meet all requirements! Apply now."]
    END IF

    recommendations = []

    FOR EACH failure IN result.failedRequirements:
        message = failure.message.LOWERCASE()

        IF message.CONTAINS("degree") OR message.CONTAINS("bachelor") THEN
            recommendations.APPEND("Complete a recognized bachelor degree program")
        ELSE IF message.CONTAINS("experience") THEN
            years = message.EXTRACT_NUMBER()
            recommendations.APPEND("Gain " + years + " years of teaching experience")
        ELSE IF message.CONTAINS("tefl") OR message.CONTAINS("tesol") THEN
            recommendations.APPEND("Obtain a TEFL/TESOL certification (120 hours minimum)")
        ELSE IF message.CONTAINS("teaching license") THEN
            recommendations.APPEND("Get a teaching license from your home country")
        ELSE IF message.CONTAINS("criminal") THEN
            recommendations.APPEND("Obtain a clean national-level background check")
        ELSE IF message.CONTAINS("citizenship") OR message.CONTAINS("citizen") THEN
            recommendations.APPEND("This requirement cannot be changed (citizenship restriction)")
        ELSE IF message.CONTAINS("age") THEN
            recommendations.APPEND("Age requirement cannot be changed")
        ELSE
            recommendations.APPEND(failure.message)
        END IF
    END FOR

    // 중복 제거
    RETURN DEDUPLICATE(recommendations)
END FUNCTION
```

---

## 🔄 전체 데이터 흐름 (Complete Data Flow)

```pseudocode
// ========================================
// TEACHER ONBOARDING FLOW
// ========================================

1. Teacher signs up (Auth.js v5)
2. Creates profile (TeacherProfile table)
3. Uploads video resume to Cloudflare R2 (UploadThing)
4. **AI Agent 1 triggered**:
   - onUploadComplete webhook
   - analyzeVideo(videoUrl)
   - Save videoAnalysis JSON to TeacherProfile
   - Display feedback to teacher
5. **AI Agent 2 triggered**:
   - generateTeacherEmbedding(teacherData)
   - Save embedding vector(1536) to TeacherProfile
6. **AI Agent 3 triggered**:
   - checkAllCountries(teacher)
   - Save visaStatus JSON to TeacherProfile
7. Profile completeness calculated
8. Teacher visible in search

// ========================================
// JOB POSTING FLOW
// ========================================

1. Recruiter creates JobPosting
2. **AI Agent 2 triggered**:
   - generateJobEmbedding(jobData)
   - Save embedding to JobPosting
3. **AI Agent 2 background job**:
   - findMatchingTeachers(jobId, minSimilarity=0.85, limit=20)
   - Filter by visa eligibility (Agent 3 cached results)
4. **Email Agent (not yet implemented)**:
   - For each matched teacher:
     - Generate personalized email using Claude 3.5 Sonnet
     - Send via Resend API
     - Track email opens/clicks

// ========================================
// APPLICATION FLOW
// ========================================

1. Teacher views job posting
2. **AI Agent 3 triggered (real-time)**:
   - checkVisaEligibility(teacher, job.country)
   - IF NOT eligible:
       - Display blocking modal with reasons
       - Show getEligibilityRecommendations()
   - ELSE:
       - Allow application
3. Teacher submits application
4. Application.aiMatchScore = cosineSimilarity(teacherEmbedding, jobEmbedding) * 100
5. Recruiter sees applications sorted by aiMatchScore
6. Recruiter moves application through ATS funnel (Kanban board)
```

---

## 에러 처리 전략

```pseudocode
// ========================================
// GLOBAL ERROR HANDLING
// ========================================

FUNCTION handleAIError(error, context):
    LOG {
        timestamp: NOW(),
        context: context,
        error: error.message,
        stack: error.stack
    }

    // Rate Limiting (OpenAI)
    IF error.type == "rate_limit_exceeded" THEN
        RETRY WITH exponentialBackoff(maxRetries=3, baseDelay=2000)

    // Invalid API Key
    ELSE IF error.type == "invalid_api_key" THEN
        ALERT admin IMMEDIATELY
        RETURN user-friendly error message

    // Timeout (video too long)
    ELSE IF error.type == "timeout" THEN
        SUGGEST user to upload shorter video (<5 minutes)

    // pgvector extension not installed
    ELSE IF error.message.CONTAINS("pgvector") THEN
        ALERT admin "Database missing pgvector extension"

    // Generic fallback
    ELSE
        LOG TO Sentry/monitoring service
        RETURN "An unexpected error occurred. Our team has been notified."
    END IF
END FUNCTION
```

---

## 다음 단계
이 의사코드를 바탕으로 `Architecture.md`에서 시스템 아키텍처를 문서화합니다.
