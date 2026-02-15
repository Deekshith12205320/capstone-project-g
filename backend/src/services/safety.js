export function screenRisk(text) {
  const t = text.toLowerCase();

  const selfHarmKeywords = [
    "kill myself",
    "end my life",
    "suicide",
    "self harm",
    "i want to die"
  ];

  const harmOthersKeywords = [
    "kill others",
    "kill someone",
    "hurt others",
    "murder",
    "attack someone"
  ];

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

  return {
    crisis: false,
    flags: []
  };
}
