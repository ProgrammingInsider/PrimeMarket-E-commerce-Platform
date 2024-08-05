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
    cy.fixture("productdetail.json").then((detail) => {
      cy.intercept(
        "GET",
        "/api/v1/ecommerce_portfolio/productdetails/668befa2cd23d557285039ef",
        {
          body: detail,
        },
      ).as("getProductDetail");
    });

    // Load products fixture
    cy.fixture("getrate.json").then((rate) => {
      cy.log("Loaded products fixture");
      cy.intercept(
        "GET",
        "/api/v1/ecommerce_portfolio/getrate/668befa2cd23d557285039ef",
        {
          body: rate,
        },
      ).as("getRate");
    });

    // Load smartphones fixture
    cy.fixture("smartphones.json").then((phone) => {
      cy.intercept(
        "GET",
        "api/v1/ecommerce_portfolio/products?categoryid=669bd33d3377976616749db3&parentcategory=&rating=&lowprice=&highprice=&sort=&search=",
        {
          body: phone,
        },
      ).as("filterByAll");
    });

    // Load smartphones fixture
    cy.intercept("POST", "api/v1/ecommerce_portfolio/rateproduct", {
      body: {
        status: true,
        rating: 5,
        user: {
          _id: "667c852933acad2623688b9a",
          firstname: "Test",
          lastname: "User",
          profilePic: null,
        },
        message: "You Rated 5 out 5",
      },
    }).as("rateProduct");

    // Visit the home page
    cy.visit("/product/668befa2cd23d557285039ef");
  });

  it("should display product detail", () => {
    // Wait for network requests to complete
    cy.wait("@filterByAll");
    cy.wait("@getProductDetail");
    cy.wait("@getRate");
    cy.contains("button", /add to cart/i).should("be.visible");
    cy.contains("h1", 4.5).should("be.visible");
    cy.contains("h1", "RA").should("be.visible");
    cy.get("h1")
      .should("contain", "Amanuel")
      .and("contain", "Abera")
      .should("be.visible");
    cy.get("h1")
      .should("contain", "Robera")
      .and("contain", "Abera")
      .should("be.visible");
    cy.get(
      '[src="https://res.cloudinary.com/dahgxnpog/image/upload/v1722787384/profile_fevoq8.png"]',
    ).should("be.visible");
    cy.get(
      '[src="https://res.cloudinary.com/dahgxnpog/image/upload/v1722583414/phone_hfrddk.jpg"]',
    ).should("be.visible");
    cy.contains("span", "2 reviews").should("be.visible");
    cy.contains("p", "with some improvement, it will be good.").should(
      "be.visible",
    );
    cy.contains("p", "Fine").should("be.visible");
    cy.get('[data-cy="addTo668befa2cd23d557285039ef"]').should("be.visible");
  });

  it("should rate the product", () => {
    cy.get('[data-cy="rate 5"]').click();
    cy.get('[placeholder="Write your comment here..."]').should("be.visible");
    cy.get('[placeholder="Write your comment here..."]').type("Wow");
    cy.contains("button", "Submit").click();

    cy.wait("@rateProduct");

    cy.contains("h1", "TU").should("be.visible");
    cy.contains("p", "Wow").should("be.visible");
    cy.contains("div", "You Rated 5 out 5").should("be.visible");
  });
});
