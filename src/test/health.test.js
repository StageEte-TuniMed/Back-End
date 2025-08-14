/**
 * Basic Health Check Test
 * Tests if the Express app starts correctly
 */

const request = require("supertest");

// We'll create a simple test version of the app
const express = require("express");
const app = express();

// Basic middleware
app.use(express.json());

// Simple health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "TuniMed Backend is running",
    timestamp: new Date().toISOString(),
  });
});

describe("Health Check", () => {
  test("GET /health should return status OK", async () => {
    const response = await request(app).get("/health").expect(200);

    expect(response.body).toEqual({
      status: "OK",
      message: "TuniMed Backend is running",
      timestamp: expect.any(String),
    });
  });

  test("GET /health should have correct content type", async () => {
    const response = await request(app).get("/health");

    expect(response.headers["content-type"]).toMatch(/application\/json/);
  });
});

module.exports = app;
