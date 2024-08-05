/// <reference types="cypress" />

describe("Home Page", () => {
  beforeEach(() => {
    // Login first
    cy.request(
      "POST",
      "http://localhost:5000/api/v1/ecommerce_portfolio/signin",
      {
        password: Cypress.env("VITE_APP_PASSWORD"),
        email: Cypress.env("VITE_APP_EMAIL"),
      },
    );

    // Load categories fixture
    cy.fixture("getcart.json").then((cart) => {
      cy.intercept("GET", "/api/v1/ecommerce_portfolio/getcart", {
        body: cart,
      }).as("cart");
    });

    cy.intercept("PUT", "/api/v1/ecommerce_portfolio/updatecart", {
      body: {
        message: "",
      },
    }).as("updateCart");

    // Visit the home page
    cy.visit("/cart");
  });

  it("should display all cart items", () => {
    cy.wait("@cart");

    // Product Name
    cy.contains("Canon EOS R5").should("be.visible");
    cy.contains("iphone 14 pro max").should("be.visible");
    cy.contains("apple macbook air m2").should("be.visible");

    // Reviews
    cy.contains("0 reviews").should("be.visible");
    cy.contains("1 reviews").should("be.visible");
    cy.contains("2 reviews").should("be.visible");

    // Price
    cy.contains(3899.99).should("be.visible");
    cy.contains(1199.99).should("be.visible");
  });
});
