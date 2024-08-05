/// <reference types="cypress" />

describe("Home Page", () => {
  beforeEach(() => {

    // Load categories fixture
    cy.fixture("userprofile.json").then((user) => {
      cy.intercept(
        "GET",
        "/api/v1/ecommerce_portfolio/userprofile/667c852933acad2623688b9a",
        {
          body: user,
        },
      ).as("userProfile");
    });

    // Visit the home page
    cy.visit("/profile/667c852933acad2623688b9a");
  });

  it("should display products", () => {
    // Wait for network requests to complete
    cy.wait("@userProfile");

    // Check for the presence of filters and products
    cy.contains("Products (4)").should("be.visible");
    cy.get("h1")
      .should("contain", "Test")
      .and("contain", "User")
      .should("be.visible");
    cy.contains("667c852933acad2623688b9a").should("be.visible");
    cy.get("p")
      .should("contain", "Addis Ababa,")
      .and("contain", "Ethiopia")
      .should("be.visible");

    // Product Name
    cy.contains("Chanel No. 5").should("be.visible");
    cy.contains("iphone 14 pro max").should("be.visible");
    cy.contains("apple macbook air m2").should("be.visible");

    // Reviews
    cy.contains("0 reviews").should("be.visible");
    cy.contains("1 reviews").should("be.visible");
    cy.contains("3 reviews").should("be.visible");
    cy.contains("2 reviews").should("be.visible");

    // Price
    cy.contains(3899.99).should("be.visible");
    cy.contains(199.99).should("be.visible");
    cy.contains(1199.99).should("be.visible");
  });
});
