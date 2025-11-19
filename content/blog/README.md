# Blog Posts

This directory contains all blog posts in MDX format.

## File Naming

Blog post files should be named using kebab-case and end with `.mdx`:
- `e2-visa-guide-south-korea.mdx`
- `teaching-salary-comparison.mdx`
- `apostille-documents-guide.mdx`

## Frontmatter Format

Each MDX file must start with YAML frontmatter containing the following fields:

```yaml
---
title: "Your Post Title"
description: "A brief description (150-160 characters for SEO)"
date: "2025-01-20"
author: "Author Name"
category: "visa-immigration"
tags: ["visa", "south-korea", "e-2"]
image: "/images/blog/post-image.jpg"
imageAlt: "Description of image"
featured: true
draft: false
---
```

### Required Fields

- `title`: The post title (will be displayed as H1)
- `description`: Meta description for SEO (150-160 characters)
- `date`: Publication date in YYYY-MM-DD format
- `author`: Author name
- `category`: One of the predefined categories (see below)
- `tags`: Array of relevant tags

### Optional Fields

- `image`: Path to featured image
- `imageAlt`: Alt text for featured image
- `featured`: Set to `true` to feature on homepage (default: false)
- `draft`: Set to `true` to hide from production (default: false)

## Categories

Use one of these predefined category slugs:

- `visa-immigration` - Visa & Immigration
- `salary-compensation` - Salary & Compensation
- `certifications` - Certifications (TEFL, TESOL, CELTA)
- `country-guides` - Country Guides
- `career-advice` - Career Advice
- `job-search` - Job Search

## Tags

Tags should be lowercase and hyphenated. Examples:
- `visa`
- `south-korea`
- `e-2-visa`
- `tefl`
- `salary`
- `international-schools`

## Custom MDX Components

You can use these custom components in your MDX files:

### Callout

```mdx
<Callout type="info" title="Important Note">
This is an informational callout box.
</Callout>
```

Types: `info`, `warning`, `success`, `error`

### HighlightBox

```mdx
<HighlightBox title="Key Takeaways">
- Point 1
- Point 2
- Point 3
</HighlightBox>
```

### ProsCons

```mdx
<ProsCons
  pros={[
    "High salary potential",
    "Housing provided",
    "Cultural experience"
  ]}
  cons={[
    "Language barrier",
    "Far from home",
    "Competitive job market"
  ]}
/>
```

### ComparisonTable

```mdx
<ComparisonTable
  headers={["Country", "Avg Salary", "Housing", "Flight"]}
  rows={[
    ["South Korea", "$2,500", "Yes", "Yes"],
    ["China", "$2,200", "Yes", "Yes"],
    ["UAE", "$3,500", "Yes", "Yes"],
  ]}
/>
```

### StepGuide

```mdx
<StepGuide
  steps={[
    {
      title: "Get Your Documents",
      description: "Gather transcripts, diploma, and background check"
    },
    {
      title: "Get Apostille",
      description: "Have documents authenticated by your state"
    },
    {
      title: "Apply for Jobs",
      description: "Submit applications through AI Job X"
    }
  ]}
/>
```

## Writing Tips

1. **SEO Optimization**
   - Use descriptive, keyword-rich titles
   - Include target keywords naturally in content
   - Use headings (H2, H3) to structure content
   - Add internal links to job listings and other blog posts

2. **Readability**
   - Keep paragraphs short (2-3 sentences)
   - Use bullet points and lists
   - Add visuals (images, tables, callouts)
   - Use subheadings every 200-300 words

3. **Engagement**
   - Start with a hook or question
   - Include real examples and data
   - Add actionable advice
   - End with a call-to-action (CTA)

## Example Post Structure

```mdx
---
title: "Complete Guide to E-2 Visa for Teaching in South Korea"
description: "Everything you need to know about getting an E-2 visa to teach English in South Korea, including requirements, process, and timeline."
date: "2025-01-20"
author: "AI Job X Team"
category: "visa-immigration"
tags: ["visa", "south-korea", "e-2-visa", "esl"]
image: "/images/blog/e2-visa-guide.jpg"
imageAlt: "E-2 Visa application documents"
featured: true
draft: false
---

## Introduction

Brief introduction to E-2 visa and why it matters...

## What is the E-2 Visa?

Detailed explanation...

<Callout type="info" title="Who Qualifies?">
Citizens from these countries can apply for E-2 visas...
</Callout>

## Requirements

### Educational Requirements

- Bachelor's degree or higher
- Degree must be from...

### Experience Requirements

<HighlightBox title="Key Requirements">
- Native English speaker
- Clean criminal record
- Health certificate
</HighlightBox>

## Application Process

<StepGuide
  steps={[
    {
      title: "Find a Job",
      description: "Secure a teaching position at a Korean school"
    },
    {
      title: "Gather Documents",
      description: "Collect all required documents"
    },
    // ... more steps
  ]}
/>

## Timeline

Typical timeline from start to finish...

<ComparisonTable
  headers={["Stage", "Duration"]}
  rows={[
    ["Job Search", "1-3 months"],
    ["Document Prep", "2-4 weeks"],
    ["Visa Processing", "4-6 weeks"],
  ]}
/>

## Conclusion

Summary and next steps...

Ready to start your teaching journey in South Korea? [Browse teaching jobs](/jobs?country=South+Korea).
```

## Publishing Checklist

Before publishing a new post:

- [ ] Frontmatter is complete and accurate
- [ ] Title is SEO-optimized (includes target keyword)
- [ ] Description is 150-160 characters
- [ ] Date is correct
- [ ] Category matches one of the predefined options
- [ ] Tags are relevant and lowercase
- [ ] Images are optimized (< 200KB, WebP preferred)
- [ ] Internal links are added where relevant
- [ ] Custom components are used for better engagement
- [ ] Content is proofread for grammar and spelling
- [ ] Post is tested locally (`npm run dev`)
- [ ] `draft: false` to publish

## Resources

- [MDX Documentation](https://mdxjs.com/)
- [Markdown Guide](https://www.markdownguide.org/)
- [SEO Best Practices](https://developers.google.com/search/docs)

---

For questions about the blog system, contact the development team.
