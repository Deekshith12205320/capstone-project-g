export function getCrisisResponse() {
  return {
    reply:
      "I’m really sorry that you’re feeling this much pain right now. " +
      "You are not alone, and what you’re feeling matters. " +
      "We are here with you, and support is available.",

    crisis: true,
    flags: ["self_harm"],

    emergency: {
      message:
        "If you feel unsafe or think you might hurt yourself, please contact one of these resources immediately:",
      contacts: [
        {
          name: "AASRA Suicide Prevention Helpline",
          phone: "+91-9820466726",
          availability: "24x7"
        },
        {
          name: "KIRAN (Government of India Mental Health Helpline)",
          phone: "1800-599-0019",
          availability: "24x7"
        },
        {
          name: "Emergency Services",
          phone: "112",
          availability: "Immediate"
        }
      ]
    }
  };
}

export function getViolenceResponse() {
  return {
    reply:
      "It sounds like you’re feeling extremely overwhelmed or angry right now. " +
      "Hurting others will not solve what you’re going through, and everyone’s safety matters. " +
      "Please pause and seek immediate professional support.",

    crisis: true,
    flags: ["harm_to_others"],

    emergency: {
      message:
        "If you feel you might hurt someone, please contact emergency services or a mental health professional immediately:",
      contacts: [
        {
          name: "Emergency Services",
          phone: "112",
          availability: "Immediate"
        },
        {
          name: "KIRAN (Government of India Mental Health Helpline)",
          phone: "1800-599-0019",
          availability: "24x7"
        }
      ]
    }
  };
}
