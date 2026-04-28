export const fixtures = {
  user: {
    id: "cmofrjyxo0003jyp8scd7iy7t",
    email: "john.doe@gmail.com",
    role: "USER" as const,
  },
  admin: {
    id: "cmoadmin00003jyp8adminusr",
    email: "admin@minibank.test",
    role: "ADMIN" as const,
  },
  cards: {
    activeSender: {
      id: "cmofrtghp00008zp8a4z0wasm",
      userId: "cmofrjyxo0003jyp8scd7iy7t",
      status: "ACTIVE" as const,
      cardNumber: "4242424242424242",
      iban: "UA123456789012345678901234567",
      balance: 5000,
    },
    activeRecipient: {
      id: "cmofrx09c00028zp8wtzpkkrk",
      userId: "cmorecipient0003jyp8userid",
      status: "ACTIVE" as const,
      cardNumber: "5105105105105100",
      iban: "UA987654321098765432109876543",
      balance: 1000,
    },
    frozenCard: {
      id: "cmofrzfrozen00028zp8wtzpk",
      userId: "cmofrjyxo0003jyp8scd7iy7t",
      status: "FROZEN" as const,
      cardNumber: "4000000000000002",
      iban: "UA555555555555555555555555555",
      balance: 100,
    },
  },
};
