export function getCrisisResponse(trigger) {
  const reply = "I’m really sorry that you’re feeling this much pain right now. You are not alone, and what you’re feeling matters. We are here with you, and support is available.";

  return {
    reply,
    crisis: true,
    flags: ["self_harm"],
    emergency: {
      message: "If you feel unsafe or think you might hurt yourself, please contact one of these resources immediately:",
      contacts: [
        {
          name: "AASRA Suicide Prevention Helpline",
          phone: "+91-9820466726",
          availability: "24x7"
        },
        {
          name: "KIRAN (Govt. of India Mental Health Helpline)",
          phone: "1800-599-0019",
          availability: "24x7"
        },
        {
          name: "Emergency Services",
          phone: "112",
          availability: "Immediate assistance"
        }
      ]
    }
  };
}

export function getViolenceResponse() {
  const reply = "I hear that you're going through a very difficult time. It's important to keep yourself and others safe. Help and support are available to help you manage these feelings.";

  return {
    reply,
    crisis: true,
    flags: ["harm_to_others"],

    emergency: {
      message: "If you feel unsafe or think you might hurt yourself or someone else, please contact one of these resources immediately:",
      contacts: [
        {
          name: "AASRA Suicide Prevention Helpline",
          phone: "+91-9820466726",
          availability: "24x7"
        },
        {
          name: "KIRAN (Govt. of India Mental Health Helpline)",
          phone: "1800-599-0019",
          availability: "24x7"
        },
        {
          name: "Emergency Services",
          phone: "112",
          availability: "Immediate assistance"
        }
      ]
    }
  };
}
