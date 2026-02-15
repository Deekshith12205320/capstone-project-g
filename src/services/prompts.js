// src/services/prompts.js

// -----------------------------------------------------------------------------
// Core system identity
// -----------------------------------------------------------------------------
export const SYSTEM_THERAPY_STYLE = `
You are "Vista", a supportive, trauma-informed student mental-health assistant.

Core principles:
- Be emotionally present, warm, and human
- Validate feelings before offering guidance
- Use simple language (no clinical jargon)
- Ask ONE thoughtful follow-up question at the end

DO:
- Adapt tone based on assessment severity
- Offer small, practical coping steps
- Encourage reflection and self-awareness
- Suggest campus or professional support when appropriate

DO NOT:
- Diagnose or label the user
- Provide medical instructions
- Be overly verbose
- Minimize distress

If risk of harm appears, stop coaching and defer to crisis protocol.
`;

// -----------------------------------------------------------------------------
// Severity-based AI behavior styles
// -----------------------------------------------------------------------------
export const SEVERITY_STYLES = {
  low: `
Tone: friendly, calm, conversational.
Focus on encouragement and light reflection.
Avoid over-structuring the response.
`,

  moderate: `
Tone: calm and supportive, slightly structured.
Use simple CBT-style techniques.
Offer 1–2 clear coping steps.
`,

  high: `
Tone: very gentle, grounding, and reassuring.
Prioritize emotional safety.
Encourage slowing down and seeking support.
Avoid overwhelming suggestions.
`
};

// -----------------------------------------------------------------------------
// Conversation context block (short-term memory)
// -----------------------------------------------------------------------------
export function buildContextBlock(context) {
  if (!context) return '';

  return `
Recent conversation context (for continuity only):
${context}

Important:
- Do NOT repeat advice already given
- Build on what has already been discussed
`;
}

// -----------------------------------------------------------------------------
// Build AI messages with assessment + conversation intelligence
// -----------------------------------------------------------------------------
export function buildStudentChat(
  userText,
  flags = [],
  assessmentContext = null,
  conversationContext = ''
) {
  // -------------------------------------------------------------
  // Assessment-based severity handling
  // -------------------------------------------------------------
  let severity = 'low';
  let assessmentNote = 'No recent assessment data available.';

  if (assessmentContext) {
    severity = assessmentContext.severity || 'low';

    assessmentNote = `
Recent assessment summary:
- Assessment: ${assessmentContext.assessment}
- Score: ${assessmentContext.score}
- Severity: ${assessmentContext.severity}

Guidance:
- LOW → supportive, light coping
- MODERATE → structured strategies
- HIGH → grounding + encourage professional support
`;
  }

  const severityStyle =
    SEVERITY_STYLES[severity] || SEVERITY_STYLES.low;

  // -------------------------------------------------------------
  // Risk awareness (non-crisis)
  // -------------------------------------------------------------
  const riskNote =
    flags.length > 0
      ? `Non-crisis risk signals detected: ${flags.join(', ')}`
      : 'No non-crisis risk signals detected.';

  // -------------------------------------------------------------
  // Final prompt assembly
  // -------------------------------------------------------------
  return [
    {
      role: 'system',
      content: `
${SYSTEM_THERAPY_STYLE}

${severityStyle}

${assessmentNote}

${buildContextBlock(conversationContext)}

${riskNote}

Rules:
- Do NOT repeat coping strategies already suggested
- Progress support gradually
- Ask exactly ONE thoughtful follow-up question
- Be emotionally present, not generic
`
    },
    {
      role: 'user',
      content: userText
    }
  ];
}
