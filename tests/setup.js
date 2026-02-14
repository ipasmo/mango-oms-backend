// Mock setup for tests - no real database needed for now
// Tests will use mocked services instead

const mongoose = require('mongoose');

// Mock mongoose connect
jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    connect: jest.fn().mockResolvedValue({}),
    connection: {
      collections: {},
    },
  };
});

// Clean up after tests
afterAll(async () => {
  if (mongoose.disconnect) {
    await mongoose.disconnect();
  }
});
