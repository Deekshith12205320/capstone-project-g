export function screenRisk(text) {
  const t = text.toLowerCase();

  const selfHarmKeywords = [
    "kill myself",
    "end my life",
    "suicide",
    "self harm",
    "i want to die",
    "i want to harm myself"
  ];

  const harmOthersKeywords = [
    "kill others",
    "kill someone",
    "hurt others",
    "murder",
    "attack someone",
    "i want to kill others",
    "i feel like hurting someone"
  ];

  if (t === "i want to kill myself" || t.includes("i want to kill myself")) {
    return {
      crisis: true,
      flags: ["self_harm"],
      trigger: "explicit_self_harm_exact"
    };
  }

  if (selfHarmKeywords.some(k => t.includes(k))) {
    return {
      crisis: true,
      flags: ["self_harm"]
    };
  }

  if (harmOthersKeywords.some(k => t.includes(k))) {
    return {
      crisis: true,
      flags: ["harm_to_others"]
    };
  }

  const flags = [];
  if (t.includes('stress') || t.includes('overwhelm')) flags.push('stress');
  if (t.includes('anxiety') || t.includes('anxious') || t.includes('panic') || t.includes('worry')) flags.push('anxiety');
  if (t.includes('depress') || t.includes('sad') || t.includes('down') || t.includes('hopeless')) flags.push('depression');
  if (t.includes('burnout') || t.includes('exhausted') || t.includes('tired') || t.includes('drained')) flags.push('burnout');

  return {
    crisis: false,
    flags
  };
}
